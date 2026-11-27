// StatAtlas USA — page behaviour. No network requests: every control works
// on the data embedded in js/data.js. Runs after data.js and charts.js.
(function () {
  var D = window.STAT_DATA;
  var F = window.StatCharts.fmt;

  var SERIES = {
    gdpNominal: {
      get: function () { return D.gdpNominal; },
      fmt: function (v) { return "$" + (v / 1000).toFixed(1) + "T"; },
      color: "#0e7c7b"
    },
    gdpRealGrowth: {
      get: function () { return D.gdpRealGrowth; },
      fmt: function (v) { return v.toFixed(1) + "%"; },
      color: "#102a43"
    },
    population: {
      get: function () { return D.population; },
      fmt: function (v) { return v.toFixed(1) + "M"; },
      color: "#0e7c7b"
    },
    unemployment: {
      get: function () { return D.unemployment; },
      fmt: function (v) { return v.toFixed(1) + "%"; },
      color: "#b3541e"
    },
    participation: {
      get: function () { return D.participation; },
      fmt: function (v) { return v.toFixed(1) + "%"; },
      color: "#102a43"
    },
    cpiHeadline: {
      get: function () { return D.cpiHeadline; },
      fmt: function (v) { return v.toFixed(1) + "%"; },
      color: "#b3541e"
    },
    cpiCore: {
      get: function () { return D.cpiCore; },
      fmt: function (v) { return v.toFixed(1) + "%"; },
      color: "#102a43"
    },
    tradeBalance: {
      get: function () { return D.tradeBalance; },
      fmt: function (v) { return (v < 0 ? "−$" : "$") + F(Math.abs(v)) + "B"; },
      color: "#0e7c7b",
      negativeColor: "#b3541e"
    }
  };

  var DONUT_COLORS = ["#0e7c7b", "#102a43", "#d98e00", "#7a9bb0"];

  // Per-mount render state.
  var mounts = {};

  function renderMount(mount) {
    var id = mount.id;
    var st = mounts[id];
    if (!st) return;
    var series = SERIES[st.series];
    var rows = series.get().filter(function (r) {
      return (!st.from || r.year >= st.from) && (!st.to || r.year <= st.to);
    });
    var labels = rows.map(function (r) { return r.year; });
    var values = rows.map(function (r) { return r.value; });
    var opts = {
      labels: labels, values: values, color: series.color,
      format: series.fmt, negativeColor: series.negativeColor,
      aria: mount.getAttribute("data-aria") || (st.series + " chart")
    };
    if (st.kind === "bar") window.StatCharts.bar(mount, opts);
    else window.StatCharts.line(mount, opts);
  }

  function initCharts() {
    document.querySelectorAll("[data-chart]").forEach(function (mount) {
      mounts[mount.id] = {
        series: mount.getAttribute("data-series"),
        kind: mount.getAttribute("data-chart"),
        from: null, to: null
      };
      renderMount(mount);
    });
    document.querySelectorAll("[data-donut]").forEach(function (mount) {
      var key = mount.getAttribute("data-donut");
      var parts = D[key].map(function (p, i) {
        return { label: p.sector, value: p.value, color: DONUT_COLORS[i % DONUT_COLORS.length] };
      });
      window.StatCharts.donut(mount, {
        parts: parts,
        center: mount.getAttribute("data-center") || "",
        centerSub: mount.getAttribute("data-center-sub") || "",
        aria: mount.getAttribute("data-aria") || "Donut chart"
      });
    });
    // Segmented controls: series / kind / range switches for a chart mount.
    document.querySelectorAll("[data-chart-target]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.getAttribute("data-chart-target");
        var st = mounts[target];
        var mount = document.getElementById(target);
        if (!st || !mount) return;
        if (btn.hasAttribute("data-series")) st.series = btn.getAttribute("data-series");
        if (btn.hasAttribute("data-kind")) st.kind = btn.getAttribute("data-kind");
        if (btn.hasAttribute("data-range")) {
          var r = btn.getAttribute("data-range");
          if (r === "all") { st.from = null; st.to = null; }
          else { var p = r.split("-"); st.from = +p[0]; st.to = +p[1]; }
        }
        // Active state: only within this button's own group.
        var group = btn.closest(".seg");
        if (group) {
          group.querySelectorAll("[data-chart-target]").forEach(function (b) {
            b.classList.toggle("active", b === btn);
          });
        }
        renderMount(mount);
      });
    });
  }

  function initNav() {
    var toggle = document.getElementById("navToggle");
    var nav = document.getElementById("siteNav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initSortable() {
    document.querySelectorAll("table.sortable").forEach(function (table) {
      var headers = table.querySelectorAll("th[data-sort]");
      headers.forEach(function (th) {
        th.addEventListener("click", function () {
          var col = +th.getAttribute("data-sort");
          var type = th.getAttribute("data-type") || "text";
          var tbody = table.querySelector("tbody");
          var rows = Array.prototype.slice.call(tbody.querySelectorAll("tr"));
          var dir = th.getAttribute("data-dir") === "asc" ? -1 : 1;
          headers.forEach(function (h) { h.removeAttribute("data-dir"); h.classList.remove("sorted"); });
          th.setAttribute("data-dir", dir === 1 ? "asc" : "desc");
          th.classList.add("sorted");
          rows.sort(function (a, b) {
            var av = a.cells[col].textContent.trim();
            var bv = b.cells[col].textContent.trim();
            if (type === "number") {
              av = parseFloat(av.replace(/[^0-9.\-]/g, "")) || 0;
              bv = parseFloat(bv.replace(/[^0-9.\-]/g, "")) || 0;
              return (av - bv) * dir;
            }
            return av.localeCompare(bv) * dir;
          });
          rows.forEach(function (r) { tbody.appendChild(r); });
        });
      });
    });
  }

  function initFilters() {
    document.querySelectorAll("[data-filter]").forEach(function (input) {
      var table = document.querySelector(input.getAttribute("data-filter"));
      if (!table) return;
      var count = document.querySelector(input.getAttribute("data-filter-count") || "");
      input.addEventListener("input", function () {
        var q = input.value.trim().toLowerCase();
        var shown = 0;
        table.querySelectorAll("tbody tr").forEach(function (tr) {
          var hit = !q || tr.textContent.toLowerCase().indexOf(q) !== -1;
          tr.style.display = hit ? "" : "none";
          if (hit) shown++;
        });
        if (count) count.textContent = shown + " of " + table.querySelectorAll("tbody tr").length + " shown";
      });
    });
  }

  function initStamps() {
    document.querySelectorAll("[data-updated]").forEach(function (n) {
      n.textContent = D.meta.updated;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initCharts();
    initSortable();
    initFilters();
    initStamps();
  });
})();
