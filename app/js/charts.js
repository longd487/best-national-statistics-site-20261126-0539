// StatAtlas USA — tiny dependency-free SVG chart helpers.
// Every chart is drawn from the data in data.js at load time; no network
// request is made. All functions are pure: same input, same SVG.
(function () {
  var NS = "http://www.w3.org/2000/svg";

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function text(parent, x, y, s, attrs) {
    var t = el("text", attrs || {}, parent);
    t.setAttribute("x", x);
    t.setAttribute("y", y);
    t.textContent = s;
    return t;
  }

  // Nice axis ticks: round the max up to a 1/2/5 step.
  function niceMax(max) {
    if (max <= 0) return 1;
    var p = Math.pow(10, Math.floor(Math.log10(max)));
    var n = max / p;
    var step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
    return step * p;
  }

  function fmt(v, digits) {
    return v.toLocaleString("en-US", {
      minimumFractionDigits: digits == null ? 0 : digits,
      maximumFractionDigits: digits == null ? 0 : digits
    });
  }

  function lineChart(mount, opts) {
    // opts: { labels, values, color, format, height, yLabel, baseline }
    var W = 760, H = opts.height || 300, P = { l: 56, r: 16, t: 18, b: 34 };
    var vals = opts.values;
    var lo = Math.min(0, Math.min.apply(null, vals));
    var hi = niceMax(Math.max.apply(null, vals) * 1.05);
    if (opts.baseline === false) lo = Math.min.apply(null, vals) * 0.92;
    var svg = el("svg", {
      viewBox: "0 0 " + W + " " + H, role: "img",
      "aria-label": opts.aria || "Line chart"
    }, null);
    svg.style.width = "100%";
    svg.style.height = "auto";
    var iw = W - P.l - P.r, ih = H - P.t - P.b;
    function X(i) { return P.l + (i / (vals.length - 1)) * iw; }
    function Y(v) { return P.t + (1 - (v - lo) / (hi - lo)) * ih; }
    // gridlines + y labels (4 steps)
    for (var g = 0; g <= 4; g++) {
      var gv = lo + ((hi - lo) * g) / 4;
      var gy = Y(gv);
      el("line", { x1: P.l, y1: gy, x2: W - P.r, y2: gy, stroke: "#e3e8ec", "stroke-width": 1 }, svg);
      text(svg, P.l - 8, gy + 4, opts.format ? opts.format(gv) : fmt(gv),
        { "text-anchor": "end", "font-size": 11, fill: "#5b6b7a" });
    }
    // zero line
    if (lo < 0) {
      el("line", { x1: P.l, y1: Y(0), x2: W - P.r, y2: Y(0), stroke: "#9aa7b2", "stroke-width": 1 }, svg);
    }
    // area + line
    var area = "M" + X(0) + "," + Y(lo) + " L" + X(0) + "," + Y(vals[0]) + " ";
    var line = "M" + X(0) + "," + Y(vals[0]) + " ";
    for (var i = 1; i < vals.length; i++) {
      line += "L" + X(i) + "," + Y(vals[i]) + " ";
      area += "L" + X(i) + "," + Y(vals[i]) + " ";
    }
    area += "L" + X(vals.length - 1) + "," + Y(lo) + " Z";
    el("path", { d: area, fill: opts.color || "#0e7c7b", opacity: 0.10 }, svg);
    el("path", { d: line, fill: "none", stroke: opts.color || "#0e7c7b", "stroke-width": 2.5, "stroke-linejoin": "round" }, svg);
    // points + value labels on first/last
    for (var j = 0; j < vals.length; j++) {
      el("circle", { cx: X(j), cy: Y(vals[j]), r: 3.5, fill: "#fff", stroke: opts.color || "#0e7c7b", "stroke-width": 2 }, svg);
      if (j === 0 || j === vals.length - 1) {
        // Anchor outward so the label never collides with the y-axis labels.
        var anchor = j === 0 ? "start" : "end";
        var lx = j === 0 ? X(j) + 8 : X(j) - 8;
        text(svg, lx, Y(vals[j]) - 10, opts.format ? opts.format(vals[j]) : fmt(vals[j]),
          { "text-anchor": anchor, "font-size": 12, "font-weight": 700, fill: "#102a43" });
      }
    }
    // x labels: every label, or every other when crowded
    var step = opts.labels.length > 8 ? 2 : 1;
    for (var k = 0; k < opts.labels.length; k += step) {
      text(svg, X(k), H - 10, String(opts.labels[k]),
        { "text-anchor": "middle", "font-size": 11, fill: "#5b6b7a" });
    }
    mount.innerHTML = "";
    mount.appendChild(svg);
  }

  function barChart(mount, opts) {
    // opts: { labels, values, color, format, height, negativeColor }
    var W = 760, H = opts.height || 300, P = { l: 56, r: 16, t: 18, b: 34 };
    var vals = opts.values;
    var lo = Math.min(0, Math.min.apply(null, vals));
    var hi = niceMax(Math.max.apply(null, vals) * 1.08);
    if (lo < 0) lo = -niceMax(Math.abs(Math.min.apply(null, vals)) * 1.08);
    var svg = el("svg", {
      viewBox: "0 0 " + W + " " + H, role: "img",
      "aria-label": opts.aria || "Bar chart"
    }, null);
    svg.style.width = "100%";
    svg.style.height = "auto";
    var iw = W - P.l - P.r, ih = H - P.t - P.b;
    function Y(v) { return P.t + (1 - (v - lo) / (hi - lo)) * ih; }
    var bw = iw / vals.length;
    for (var g = 0; g <= 4; g++) {
      var gv = lo + ((hi - lo) * g) / 4;
      var gy = Y(gv);
      el("line", { x1: P.l, y1: gy, x2: W - P.r, y2: gy, stroke: "#e3e8ec", "stroke-width": 1 }, svg);
      text(svg, P.l - 8, gy + 4, opts.format ? opts.format(gv) : fmt(gv),
        { "text-anchor": "end", "font-size": 11, fill: "#5b6b7a" });
    }
    el("line", { x1: P.l, y1: Y(0), x2: W - P.r, y2: Y(0), stroke: "#9aa7b2", "stroke-width": 1 }, svg);
    for (var i = 0; i < vals.length; i++) {
      var v = vals[i];
      var x = P.l + i * bw + bw * 0.18;
      var w = bw * 0.64;
      var yTop = Y(Math.max(v, 0)), yBot = Y(Math.min(v, 0));
      var col = v < 0 && opts.negativeColor ? opts.negativeColor : (opts.color || "#0e7c7b");
      el("rect", { x: x, y: yTop, width: w, height: Math.max(1, yBot - yTop), fill: col, rx: 2 }, svg);
      text(svg, x + w / 2, (v >= 0 ? yTop - 6 : yBot + 15), opts.format ? opts.format(v) : fmt(v),
        { "text-anchor": "middle", "font-size": 11, "font-weight": 700, fill: "#102a43" });
      text(svg, x + w / 2, H - 10, String(opts.labels[i]),
        { "text-anchor": "middle", "font-size": 11, fill: "#5b6b7a" });
    }
    mount.innerHTML = "";
    mount.appendChild(svg);
  }

  function donutChart(mount, opts) {
    // opts: { parts: [{label, value, color}], center }
    var W = 300, H = 300, cx = 150, cy = 150, r = 110, th = 44;
    var total = 0;
    opts.parts.forEach(function (p) { total += p.value; });
    var svg = el("svg", {
      viewBox: "0 0 " + W + " " + H, role: "img",
      "aria-label": opts.aria || "Donut chart"
    }, null);
    svg.style.width = "100%";
    svg.style.maxWidth = "300px";
    svg.style.height = "auto";
    var a0 = -Math.PI / 2;
    opts.parts.forEach(function (p) {
      var a1 = a0 + (p.value / total) * Math.PI * 2;
      var large = (a1 - a0) > Math.PI ? 1 : 0;
      var x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
      var x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      var x2 = cx + (r - th) * Math.cos(a1), y2 = cy + (r - th) * Math.sin(a1);
      var x3 = cx + (r - th) * Math.cos(a0), y3 = cy + (r - th) * Math.sin(a0);
      var d = "M" + x0 + "," + y0 + " A" + r + "," + r + " 0 " + large + " 1 " + x1 + "," + y1 +
        " L" + x2 + "," + y2 + " A" + (r - th) + "," + (r - th) + " 0 " + large + " 0 " + x3 + "," + y3 + " Z";
      el("path", { d: d, fill: p.color }, svg);
      a0 = a1;
    });
    text(svg, cx, cy - 4, opts.center || "", { "text-anchor": "middle", "font-size": 26, "font-weight": 700, fill: "#102a43" });
    text(svg, cx, cy + 18, opts.centerSub || "", { "text-anchor": "middle", "font-size": 12, fill: "#5b6b7a" });
    mount.innerHTML = "";
    mount.appendChild(svg);
  }

  window.StatCharts = { line: lineChart, bar: barChart, donut: donutChart, fmt: fmt };
})();
