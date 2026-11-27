# StatAtlas — United States National Statistics

An independent statistics explorer for the make.fun competition
**“Make the best national statistics site”**
([best-national-statistics-site-20261126-0539](https://make.fun/bounty/best-national-statistics-site-20261126-0539)).
$50 total prize, 10 places paid; deadline 29 November 2026, 13:39 CST.

## What it is

Eight pages covering the United States — dashboard, economy, population,
labour, prices, trade, society, and methods — built as static files that run
in a browser with **no network request**: no external fonts, scripts, images
or data. Every figure is a published official statistic, reproduced exactly
as released, with its source and vintage listed on the Methods page.

- **Dashboard** (`app/index.html`): headline KPIs (GDP $30.9T in 2025,
  population 341.8M, unemployment 4.0%, CPI inflation 2.9%) and a switchable
  headline-series chart, plus a latest-releases list.
- **Economy**: GDP 2015–2025 (level / real growth, year-range switch), sector
  composition donut, federal debt, sortable GDP table.
- **Population**: population 2020–2025, top-10 states table with live search
  and sortable columns, growth table.
- **Labour**: unemployment and participation charts (bar/line switch),
  median household income ($83,730 in 2024, CPS ASEC).
- **Prices**: headline vs core CPI, 2015–2024, with the 8.0% peak of 2022.
- **Trade**: 2024 exports $3,191.6B, imports $4,110.0B, deficit $918.4B;
  balance 2019–2024; goods vs services split.
- **Society**: life expectancy 78.4 years (2023), poverty 10.2%, homeownership
  65.2%, internet users 94.7%.
- **Methods**: full source table, vintages, and caveats (annual averages,
  current vs chained dollars, survey differences).

Every control does what it says: series/range/chart-type switches redraw the
charts, table headers sort, the state search filters, and the mobile menu
opens and closes. All charts are hand-rolled SVG drawn in the browser from
`app/js/data.js`, the single source of truth for every figure.

## Run it

```sh
# Open directly — no build step, no server needed:
open app/index.html

# or serve locally and verify:
node main.ts            # checks: files, data, no external refs, links, screenshots
node main.ts --serve    # http://localhost:8123/
```

Node 22+ required for `main.ts` (standard library only).

## Data sources (all verified 26 November 2026)

| Series | Source |
|---|---|
| Nominal GDP; real GDP growth | BEA, NIPA Tables 1.1.5 / 1.1.1, 2026 annual-update vintage |
| GDP per person; sector shares; internet users | World Bank, World Development Indicators |
| Gross federal debt | U.S. Department of the Treasury, Fiscal Data (Dec 2024) |
| Population; largest states; housing units | U.S. Census Bureau, Population Estimates Program, Vintage 2025 / 2024 |
| Unemployment; participation | BLS, Current Population Survey, annual averages |
| Median household income | U.S. Census Bureau, CPS ASEC, Current Population Reports P60-286 (Sep 2025) |
| CPI headline and core | BLS, Consumer Price Index, annual averages |
| Trade in goods and services | U.S. Census Bureau / BEA, FT-900 (5 Feb 2025) |
| Life expectancy | NCHS, National Vital Statistics System (2023) |
| Poverty; homeownership; broadband | U.S. Census Bureau, American Community Survey 2020–2024 |
| Mean years of schooling | UNDP, Human Development Report 2023–24 |
| Q3 2026 GDP second estimate; Oct 2026 PCE | BEA (25 Nov 2026) |

## Screenshots

Real renders of the site's own code, taken with headless Chromium
(Playwright's `chromium_headless_shell`, driven by puppeteer-core) at
1440×1050 desktop and 390×844 phone:

- `screenshots/dashboard-desktop.png` — home, GDP chart (default view)
- `screenshots/economy-desktop.png` — economy, GDP chart
- `screenshots/population-desktop.png` — population, chart and states table
- `screenshots/dashboard-phone.png` — home at phone size, menu button

## Verification performed

- All 8 pages loaded in headless Chromium with **zero console/page errors**.
- Interaction test (scripted clicks, not screenshots alone): dashboard series
  switch GDP → population → unemployment redraws the chart (11 → 6 → 10
  points); economy range filter 2020–2025 (6 points) and series switch;
  states table sorts ascending/descending; search “tex” filters to 1 of 10;
  bar/line toggles on labour, prices and trade; phone menu opens/closes.
- Two rendering bugs found and fixed during testing: the line-chart area fill
  skipped the first data point (diagonal artefact, worst on the population
  chart), and first/last value labels collided with the y-axis labels.
- `node main.ts` passes all checks (see its output); no page references
  anything outside `app/`.

## Design decisions

- **One country, done properly.** A single country (the United States) with
  deep, verified series beats a shallow multi-country directory: every number
  on the site was checked against its publisher.
- **Original identity.** “StatAtlas” is our own name and design; nothing
  copies Census/BEA branding, text or images.
- **Offline by construction.** System fonts only, inline data, hand-rolled SVG
  charts — the site cannot break because a CDN is down, and `main.ts`
  enforces the no-external-reference rule on every run.

## Known limitation

`vendor/makefun-frontend.ts` is **not yet in this repo**: it is copied unchanged
from the competition kit, and the kit has not been downloaded (kit downloads
need the user's approval; a kit question is already pending for another
entry). Copy it into `vendor/` from the kit before bundling/submitting —
`main.ts` reports it as a warning until then.

## License

MIT — see `LICENSE`.
