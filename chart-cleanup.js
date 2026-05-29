(function () {
  const previousRender = render;

  render = function () {
    previousRender();
    enhanceCharts();
  };

  function enhanceCharts() {
    enhanceBarCharts();
    enhanceCompactBridge();
  }

  function enhanceBarCharts() {
    document.querySelectorAll(".chart-grid").forEach((chart) => {
      if (chart.dataset.axisEnhanced === "true") return;
      chart.dataset.axisEnhanced = "true";
      chart.classList.add("has-y-axis");

      const max = getMaxFromChartLabels(chart);
      const axis = document.createElement("div");
      axis.className = "chart-y-axis";
      axis.innerHTML = `
        <span>${formatAxisValue(max)}</span>
        <span>${formatAxisValue(max / 2)}</span>
        <span>0</span>
      `;
      chart.prepend(axis);
    });
  }

  function enhanceCompactBridge() {
    document.querySelectorAll(".compact-bridge-chart").forEach((chart) => {
      if (chart.dataset.axisEnhanced === "true") return;
      chart.dataset.axisEnhanced = "true";
      chart.classList.add("has-bridge-y-axis");

      const max = getMaxFromBridgeValues(chart);
      const axis = document.createElement("div");
      axis.className = "bridge-y-axis";
      axis.innerHTML = `
        <span>${formatAxisValue(max)}</span>
        <span>${formatAxisValue(max / 2)}</span>
        <span>0</span>
      `;
      chart.prepend(axis);
    });
  }

  function getMaxFromChartLabels(chart) {
    const values = [...chart.querySelectorAll(".month-label span")]
      .map((node) => numberFromText(node.textContent))
      .filter((value) => Number.isFinite(value));
    return niceMax(Math.max(...values, 1));
  }

  function getMaxFromBridgeValues(chart) {
    const values = [...chart.querySelectorAll(".compact-values-row span")]
      .map((node) => numberFromText(node.textContent))
      .filter((value) => Number.isFinite(value));
    return niceMax(Math.max(...values, 1));
  }

  function numberFromText(text) {
    return Number(String(text).replace(/[^0-9.-]/g, ""));
  }

  function niceMax(value) {
    if (value <= 10) return Math.ceil(value);
    if (value <= 100) return Math.ceil(value / 10) * 10;
    if (value <= 1000) return Math.ceil(value / 100) * 100;
    return Math.ceil(value / 1000) * 1000;
  }

  function formatAxisValue(value) {
    return Number(value).toLocaleString(undefined, { maximumFractionDigits: value < 100 ? 1 : 0 });
  }

  const style = document.createElement("style");
  style.textContent = `
    .chart-grid.has-y-axis {
      position: relative;
      padding-left: 64px;
    }

    .chart-y-axis {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 62px;
      width: 54px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-end;
      padding: 0 10px 0 0;
      color: #817C75;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: .04em;
      text-transform: none;
      border-right: 1px solid #D8D6D0;
    }

    .chart-grid.has-y-axis .chart-month {
      min-width: 0;
    }

    .chart-grid.has-y-axis .month-label span {
      display: none !important;
    }

    .compact-bridge-chart.has-bridge-y-axis {
      position: relative;
      padding-left: 78px !important;
    }

    .bridge-y-axis {
      position: absolute;
      left: 18px;
      top: 24px;
      bottom: 76px;
      width: 48px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-end;
      padding-right: 8px;
      color: #817C75;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: .04em;
      text-transform: none;
      border-right: 1px solid #D8D6D0;
    }

    .compact-values-row,
    .bridge-value,
    .scenario-metric-value {
      display: none !important;
    }

    .compact-scenario-label {
      margin-bottom: 0;
    }
  `;
  document.head.appendChild(style);

  enhanceCharts();
})();
