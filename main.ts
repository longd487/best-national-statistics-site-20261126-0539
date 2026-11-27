// main.ts — StatAtlas USA, the entry program for the make.fun competition
// "Make the best national statistics site" (best-national-statistics-site-20261126-0539).
//
// Node 22+, standard library only. Run from the repository root:
//
//   node main.ts            generate the entry (default): copy app/ and
//                           screenshots/ beside this file to /output (or
//                           $MAKEFUN_OUTPUT_DIR) and write /output/dossier.json
//                           with buildDossier from vendor/makefun-frontend.ts.
//                           Deterministic: two runs write the same bytes.
//   node main.ts --check    verify the site: checks that every page exists,
//                           that no page references anything outside the site,
//                           that the data file parses, that the screenshots
//                           are real renders inside the gate limits.
//                           Exit 0 when all checks pass; exit 1 on failure.
//   node main.ts --serve     serve app/ on http://localhost:8123 for manual
//                           testing (Ctrl-C to stop).
//
// The site itself is static files under app/: open app/index.html in a
// browser, or use --serve. It makes no network requests.

import { createServer } from "node:http";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { extname, join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)));
const APP = join(ROOT, "app");
const OUT = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const PAGES = [
  "index.html", "economy.html", "population.html", "labour.html",
  "prices.html", "trade.html", "society.html", "methods.html",
];
const ASSETS = ["css/style.css", "js/data.js", "js/charts.js", "js/app.js"];
const SCREENSHOTS = [
  "screenshots/dashboard-desktop.png",
  "screenshots/economy-desktop.png",
  "screenshots/population-desktop.png",
  "screenshots/dashboard-phone.png",
];

// Gate limits (competition.yaml resolution.criteria / gate): each screenshot
// <= 256 KiB, long side <= 1280 px, short side >= 360 px.
const SHOT_MAX_BYTES = 262144;
const SHOT_LONG_MAX = 1280;
const SHOT_SHORT_MIN = 360;

function pngSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 24 || buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4e || buf[3] !== 0x47) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function generate(): void {
  // Clear the output directory first so a re-run cannot leave stale files
  // behind; then copy app/ + screenshots/ byte for byte and write the
  // dossier with the kit's buildDossier. Copying the repo's files is
  // byte-identical across runs, which satisfies the twice-run rule.
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  cpSync(APP, join(OUT, "app"), { recursive: true });
  mkdirSync(join(OUT, "screenshots"), { recursive: true });
  if (existsSync(join(ROOT, "screenshots"))) {
    cpSync(join(ROOT, "screenshots"), join(OUT, "screenshots"), { recursive: true });
  }
  // The scorer's own caps (reference/gate.json): only text_max_bytes shapes
  // the bytes; the others refuse an entry the scorer would refuse.
  writeFileSync(
    join(OUT, "dossier.json"),
    buildDossier(OUT, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 }),
  );
  console.log(`wrote ${OUT}/app/ + ${OUT}/screenshots/ + ${OUT}/dossier.json`);
}

interface Check {
  name: string;
  ok: boolean;
  detail: string;
}

const checks: Check[] = [];
function check(name: string, ok: boolean, detail: string): void {
  checks.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name} — ${detail}`);
}

function allFiles(dir: string, base = ""): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = base ? `${base}/${entry}` : entry;
    if (statSync(full).isDirectory()) out.push(...allFiles(full, rel));
    else out.push(rel);
  }
  return out;
}

function runChecks(): boolean {
  // 1. Required files exist.
  for (const p of PAGES) {
    check(`page app/${p}`, existsSync(join(APP, p)), existsSync(join(APP, p)) ? "present" : "MISSING");
  }
  for (const a of ASSETS) {
    check(`asset app/${a}`, existsSync(join(APP, a)), existsSync(join(APP, a)) ? "present" : "MISSING");
  }

  // 2. Data file parses and holds the series the pages need.
  try {
    const src = readFileSync(join(APP, "js/data.js"), "utf8");
    const sandbox: { window: Record<string, unknown> } = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext(src, sandbox, { filename: "data.js" });
    const data = sandbox.window["STAT_DATA"] as Record<string, unknown> | undefined;
    const series = ["gdpNominal", "gdpRealGrowth", "population", "unemployment", "cpiHeadline", "cpiCore", "tradeBalance"];
    const missing = series.filter((s) => !Array.isArray((data as Record<string, unknown> | undefined)?.[s]));
    check("data.js parses", !!data && missing.length === 0,
      data ? (missing.length ? `missing series: ${missing.join(", ")}` : `${series.length} series present`) : "STAT_DATA not defined");
  } catch (e) {
    check("data.js parses", false, String(e));
  }

  // 3. No external references: the site must run offline from its own files.
  // The SVG namespace (http://www.w3.org/2000/svg) is a namespace identifier,
  // not a fetch, so it is allowed.
  const bad: string[] = [];
  const extRe = /(https?:)?\/\/(?!www\.w3\.org)[a-z0-9.-]+/i;
  for (const f of allFiles(APP)) {
    const text = readFileSync(join(APP, f), "utf8");
    const lines = text.split("\n");
    lines.forEach((line, i) => {
      if (line.includes("http://www.w3.org/2000/svg")) return;
      if (extRe.test(line) || /fetch\s*\(|XMLHttpRequest|fonts\.googleapis/.test(line)) {
        bad.push(`${f}:${i + 1}`);
      }
    });
  }
  check("no external references", bad.length === 0, bad.length ? bad.join(", ") : "all references are local");

  // 4. Every internal link resolves to a file under app/.
  const missingLinks: string[] = [];
  for (const p of PAGES) {
    const html = readFileSync(join(APP, p), "utf8");
    const hrefs = [...html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)].map((m) => m[1]);
    for (const h of hrefs) {
      if (h.startsWith("http") || h.startsWith("mailto:") || h.startsWith("data:")) continue;
      if (!existsSync(join(APP, h))) missingLinks.push(`${p} -> ${h}`);
    }
  }
  check("internal links resolve", missingLinks.length === 0,
    missingLinks.length ? missingLinks.join(", ") : `${PAGES.length} pages checked`);

  // 5. Screenshots are real PNG renders inside the gate limits.
  for (const s of SCREENSHOTS) {
    const full = join(ROOT, s);
    let ok = false;
    let detail = "MISSING";
    if (existsSync(full)) {
      const buf = readFileSync(full);
      const size = pngSize(buf);
      if (size) {
        const long = Math.max(size.width, size.height);
        const short = Math.min(size.width, size.height);
        ok = buf.length > 10000 && buf.length <= SHOT_MAX_BYTES && long <= SHOT_LONG_MAX && short >= SHOT_SHORT_MIN;
        detail = `${size.width}x${size.height}, ${(buf.length / 1024).toFixed(0)} KB PNG` +
          (ok ? "" : ` (gate: <=${SHOT_MAX_BYTES / 1024} KiB, long <=${SHOT_LONG_MAX}, short >=${SHOT_SHORT_MIN})`);
      } else {
        detail = "not a valid PNG";
      }
    }
    check(`screenshot ${s}`, ok, detail);
  }

  // 6. Kit vendor file (required for the generator path).
  const vendor = join(ROOT, "vendor", "makefun-frontend.ts");
  check("vendor/makefun-frontend.ts", existsSync(vendor), existsSync(vendor) ? "present" : "MISSING — copy it unchanged from the competition kit");

  const failed = checks.filter((c) => !c.ok).length;
  console.log(`\n${checks.length - failed}/${checks.length} checks passed${failed ? `, ${failed} FAILED` : ""}.`);
  return failed === 0;
}

function serve(): void {
  const types: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".png": "image/png",
  };
  const server = createServer((req, res) => {
    const path = decodeURIComponent((req.url || "/").split("?")[0]);
    const file = join(APP, path === "/" ? "index.html" : path);
    if (!file.startsWith(APP) || !existsSync(file) || !statSync(file).isFile()) {
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("not found\n");
      return;
    }
    res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" });
    res.end(readFileSync(file));
  });
  server.listen(8123, () => {
    console.log("StatAtlas serving app/ at http://localhost:8123/ (Ctrl-C to stop)");
  });
}

const args = process.argv.slice(2);
if (args.includes("--serve")) {
  serve();
} else if (args.includes("--check")) {
  process.exit(runChecks() ? 0 : 1);
} else {
  generate();
}
