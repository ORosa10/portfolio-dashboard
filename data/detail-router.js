/* Detail router for data-import-v1. */
(function () {
  const metrics = [
    "Revenues",
    "Gross margin",
    "Adjusted EBITDA",
    "CAPEX",
    "OpCF (EBITDA less Capex)",
    "Debt",
    "Cash",
    "Net debt / LTM EBITDA",
  ];

  function openMetricDetail(metric, mode) {
    if (!metrics.includes(metric)) return;

    state.selectedMetric = metric;
    state.detailMetric = metric;
    state.view = "company";

    if (!state.dataChartModes) state.dataChartModes = {};
    if (mode === "MTD") state.dataChartModes[metric] = "Monthly";
    if (mode === "YTD") state.dataChartModes[metric] = "YTD";

    render();
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  window.openMetricDetail = openMetricDetail;

  document.addEventListener(
    "click",
    function (event) {
      const target = event.target.closest("[data-open-detail]");
      if (!target) return;

      const metric = target.dataset.openDetail;
      if (!metrics.includes(metric)) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      openMetricDetail(metric, target.dataset.mode || "YTD");
    },
    true
  );
})();
