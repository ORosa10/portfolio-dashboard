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

      const axis = document.createElement("div");
      axis.className = "chart-y-axis";
      axis.innerHTML = `
        <span>Max</span>
        <span>Mid</span>
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

      const axis = document.createElement("div");
      axis.className = "bridge-y-axis";
      axis.innerHTML = `
        <span>Max</span>
        <span>Mid</span>
        <span>0</span>
      `;
      chart.prepend(axis);
    });
  }

  const style = document.createElement("style");
  style.textContent = `
    .chart-grid.has-y-axis {
      position: relative;
      padding-left: 54px;
    }

    .chart-y-axis {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 62px;
      width: 44px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-end;
      padding: 0 8px 0 0;
      color: #817C75;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: .08em;
      text-transform: uppercase;
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
      padding-left: 72px !important;
    }

    .bridge-y-axis {
      position: absolute;
      left: 18px;
      top: 24px;
      bottom: 76px;
      width: 42px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-end;
      padding-right: 8px;
      color: #817C75;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: .08em;
      text-transform: uppercase;
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
