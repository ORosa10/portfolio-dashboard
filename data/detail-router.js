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

  function safeMetric(metric) {
    return String(metric).replace(/'/g, "\\'");
  }

  function openMetricDetail(metric, mode) {
    if (!metrics.includes(metric)) return false;

    state.selectedMetric = metric;
    state.detailMetric = metric;
    state.view = "company";

    if (!state.dataChartModes) state.dataChartModes = {};
    state.dataChartModes[metric] = mode === "MTD" ? "Monthly" : "YTD";

    render();
    window.scrollTo(0, 0);
    return false;
  }

  window.openMetricDetail = openMetricDetail;

  renderMetricRow = function (item) {
    const metric = safeMetric(item.label);
    return `
      <div class="metric-row">
        <div class="metric-name">
          <div class="metric-unit">${item.unit}</div>
          <button class="metric-title-btn" onclick="return window.openMetricDetail('${metric}', 'YTD')">${item.label}</button>
        </div>
        <div>
          <div class="small-label">YTD development</div>
          <div class="actual-label">Actual</div>
          <div class="actual-value">${item.ytdActual}</div>
          ${varianceBadge({ label: "vs budget", pct: item.ytdBudgetPct, abs: item.ytdBudgetAbs, good: item.ytdBudgetGood ?? true })}
          ${varianceBadge({ label: "vs LY", pct: item.ytdLyPct, abs: item.ytdLyAbs, good: item.ytdLyGood ?? true })}
          <button class="detail-link" onclick="return window.openMetricDetail('${metric}', 'YTD')">Detail YTD</button>
        </div>
        <div>
          <div class="small-label">Month development</div>
          <div class="actual-label">Actual</div>
          <div class="actual-value">${item.mtdActual}</div>
          ${varianceBadge({ label: "vs budget", pct: item.mtdBudgetPct, abs: item.mtdBudgetAbs, good: item.mtdBudgetGood ?? true })}
          ${varianceBadge({ label: "vs LY", pct: item.mtdLyPct, abs: item.mtdLyAbs, good: item.mtdLyGood ?? true })}
          <button class="detail-link" onclick="return window.openMetricDetail('${metric}', 'MTD')">Detail MTD</button>
        </div>
        ${item.subRows ? `<div class="subrows">${item.subRows.map(renderSubRow).join("")}</div>` : ""}
      </div>
    `;
  };

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

  render();
})();
