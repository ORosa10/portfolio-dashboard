(function () {
  const previousRenderCompanyDetail = renderCompanyDetail;
  const previousBindEvents = bindEvents;

  if (!state.companyBridgeMode) state.companyBridgeMode = "YTD";

  const bridgeData = {
    YTD: {
      actual: { label: "Actual", values: { Revenue: 10000, "Gross Margin": 3800, "Adj. EBITDA": 2000, OpCF: 1990 } },
      budget: { label: "Budget", values: { Revenue: 10000, "Gross Margin": 3750, "Adj. EBITDA": 2000, OpCF: 1988 } },
      ly: { label: "Last year", values: { Revenue: 9524, "Gross Margin": 3718, "Adj. EBITDA": 1961, OpCF: 1949 } },
    },
    Monthly: {
      actual: { label: "Actual", values: { Revenue: 2400, "Gross Margin": 912, "Adj. EBITDA": 480, OpCF: 478.2 } },
      budget: { label: "Budget", values: { Revenue: 2438, "Gross Margin": 914, "Adj. EBITDA": 488, OpCF: 485.2 } },
      ly: { label: "Last year", values: { Revenue: 2376, "Gross Margin": 885, "Adj. EBITDA": 462, OpCF: 459.6 } },
    },
  };

  const scenarios = ["actual", "budget", "ly"];
  const bridgeMetricOrder = ["Revenue", "Gross Margin", "Adj. EBITDA", "OpCF"];
  const metricColors = {
    Revenue: "#000000",
    "Gross Margin": "#8D8982",
    "Adj. EBITDA": "#C7C4BD",
    OpCF: "#06DB49",
  };

  function renderCompanyBridge(company) {
    const periodData = bridgeData[state.companyBridgeMode];
    const maxValue = Math.max(
      ...scenarios.flatMap((scenario) => bridgeMetricOrder.map((metric) => periodData[scenario].values[metric]))
    );

    return section({
      title: "Revenue to OpCF bridge",
      kicker:
        state.companyBridgeMode === "YTD"
          ? `YTD snapshot as of ${company.month}`
          : `${company.month} monthly snapshot`,
      right: renderBridgeToggle(),
      body: `
        <div class="compact-bridge-chart">
          ${scenarios.map((scenario) => renderScenarioGroup(scenario, periodData[scenario], maxValue)).join("")}
        </div>
        ${renderBridgeLegend()}
      `,
    });
  }

  function renderBridgeToggle() {
    return `
      <div class="toggle">
        <button class="${state.companyBridgeMode === "YTD" ? "active" : ""}" data-company-bridge="YTD">YTD</button>
        <button class="${state.companyBridgeMode === "Monthly" ? "active" : ""}" data-company-bridge="Monthly">Monthly</button>
      </div>
    `;
  }

  function renderScenarioGroup(key, scenario, maxValue) {
    return `
      <div class="compact-scenario-group ${key}">
        <div class="compact-bars">
          ${bridgeMetricOrder.map((metric) => renderMetricBar(metric, scenario.values[metric], maxValue)).join("")}
        </div>
        <div class="compact-scenario-label">${scenario.label}</div>
        <div class="compact-values-row">
          ${bridgeMetricOrder.map((metric) => `<span>${formatScenarioValue(scenario.values[metric])}</span>`).join("")}
        </div>
      </div>
    `;
  }

  function renderMetricBar(metric, value, maxValue) {
    const height = Math.max(value > 0 ? 5 : 0, (value / maxValue) * 100);
    return `
      <div class="compact-bar-slot">
        <div class="compact-bar" style="height:${height}%; background:${metricColors[metric]};"></div>
      </div>
    `;
  }

  function renderBridgeLegend() {
    return `
      <div class="legend compact-bridge-legend">
        ${bridgeMetricOrder.map((metric) => `<span><span class="legend-mark" style="background:${metricColors[metric]};"></span>${metric}</span>`).join("")}
      </div>
    `;
  }

  function formatScenarioValue(value) {
    return Number(value).toLocaleString(undefined, { maximumFractionDigits: value < 100 ? 1 : 0 });
  }

  function renderStandardCompanyDetail() {
    const company = selectedCompany();

    return `
      ${companyHeader(company)}
      ${renderCompanyBridge(company)}
      ${section({
        title: "Financial indicators",
        kicker: "YTD and MTD performance by metric",
        body: `
          <div class="metric-head">
            <div>Metric</div>
            <div>YTD development</div>
            <div>Month development</div>
          </div>
          ${company.metrics.map(renderMetricRow).join("")}
        `,
      })}
      <div class="grid-2">
        ${section({
          title: `${state.selectedMetric} detail`,
          kicker: "Click Detail YTD / Detail MTD to open available drill-downs",
          body: `<div class="kpi-sub">Placeholder chart for ${state.selectedMetric}.</div>`,
        })}
        ${section({
          title: "Management commentary",
          kicker: "Monthly explanation",
          dark: true,
          body: `<p style="font-size: 17px; line-height: 1.55; color: rgba(255,255,255,.78);">${company.comment}</p>`,
        })}
      </div>
    `;
  }

  renderCompanyDetail = function () {
    if (!state.detailMetric) return renderStandardCompanyDetail();
    return previousRenderCompanyDetail();
  };

  bindEvents = function () {
    previousBindEvents();

    document.querySelectorAll("[data-company-bridge]").forEach((button) => {
      button.addEventListener("click", () => {
        state.companyBridgeMode = button.dataset.companyBridge;
        render();
      });
    });
  };

  const style = document.createElement("style");
  style.textContent = `
    .compact-bridge-chart {
      background: #ffffff;
      border-radius: 3px;
      padding: 24px 24px 12px;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 18px;
      margin-top: 8px;
    }

    .compact-scenario-group {
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      border-right: 1px solid #E6E5E1;
      padding-right: 18px;
    }

    .compact-scenario-group:last-child {
      border-right: 0;
      padding-right: 0;
    }

    .compact-bars {
      height: 220px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 8px;
      border-bottom: 1px solid #D8D6D0;
      padding-bottom: 0;
    }

    .compact-bar-slot {
      width: 34px;
      height: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .compact-bar {
      width: 100%;
      min-height: 5px;
    }

    .compact-scenario-label {
      text-align: center;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: .16em;
      text-transform: uppercase;
      margin-top: 12px;
      color: #000000;
    }

    .compact-values-row {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
      margin-top: 8px;
      text-align: center;
      font-size: 12px;
      font-weight: 800;
      color: #817C75;
    }

    .compact-bridge-legend {
      margin-top: 14px;
      border-top: 1px solid #D8D6D0;
      padding-top: 14px;
    }

    @media (max-width: 1100px) {
      .compact-bridge-chart { grid-template-columns: 1fr; }
      .compact-scenario-group { border-right: 0; border-bottom: 1px solid #E6E5E1; padding-right: 0; padding-bottom: 18px; }
      .compact-scenario-group:last-child { border-bottom: 0; padding-bottom: 0; }
    }
  `;
  document.head.appendChild(style);

  render();
})();
