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

  document.addEventListener("click", function (event) {
    const target = event.target.closest("[data-open-detail]");
    if (!target) return;

    const metric = target.dataset.openDetail;
    if (!metrics.includes(metric)) return;

    state.selectedMetric = metric;
    state.detailMetric = metric;
    state.view = "company";

    if (!state.dataChartModes) state.dataChartModes = {};
    if (target.dataset.mode === "MTD") state.dataChartModes[metric] = "Monthly";
    if (target.dataset.mode === "YTD") state.dataChartModes[metric] = "YTD";

    setTimeout(function () {
      render();
    }, 0);
  }, true);
})();
