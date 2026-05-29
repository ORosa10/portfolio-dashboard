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

  const balanceData = {
    YTD: {
      actual: { label: "Actual", values: { Debt: 20, Cash: 10, "Net Debt": 10 } },
      budget: { label: "Budget", values: { Debt: 22, Cash: 9, "Net Debt": 13 } },
      ly: { label: "Last year", values: { Debt: 20.6, Cash: 9.6, "Net Debt": 11 } },
    },
    Monthly: {
      actual: { label: "Actual", values: { Debt: 20, Cash: 10, "Net Debt": 10 } },
      budget: { label: "Budget", values: { Debt: 22, Cash: 9, "Net Debt": 13 } },
      ly: { label: "Last year", values: { Debt: 20.6, Cash: 9.6, "Net Debt": 11 } },
    },
  };

  const scenarios = ["actual", "budget", "ly"];
  const bridgeMetricOrder = ["Revenue", "Gross Margin", "Adj. EBITDA", "OpCF"];
  const balanceMetricOrder = ["Debt", "Cash", "Net Debt"];
  const operatingMetricLabels = ["Revenues", "Gross margin", "Adjusted EBITDA", "CAPEX", "OpCF (EBITDA less Capex)"];
  const balanceMetricLabels = ["Debt", "Cash", "Net debt / LTM EBITDA"];

  const metricColors = {
    Revenue: "#000000",
    "Gross Margin": "#8D8982",
    "Adj. EBITDA": "#C7C4BD",
    OpCF: "#06DB49",
  };
  const balanceColors = {
    Debt: "#000000",
    Cash: "#06DB49",
    "Net Debt": "#8D8982",
  };
  const metricDetailMap = {
    Revenue: "Revenues",
    "Gross Margin": "Gross margin",
    "Adj. EBITDA": "Adjusted EBITDA",
    OpCF: "OpCF (EBITDA less Capex)",
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
          ${scenarios.map((scenario) => renderScenarioGroup(scenario, periodData[scenario], maxValue, bridgeMetricOrder, metricColors, true)).join("")}
        </div>
        ${renderBridgeLegend(bridgeMetricOrder, metricColors, true)}
      `,
    });
  }

  function renderBalanceBridge(company) {
    const periodData = balanceData[state.companyBridgeMode];
    const maxValue = Math.max(
      ...scenarios.flatMap((scenario) => balanceMetricOrder.map((metric) => periodData[scenario].values[metric]))
    );

    return section({
      title: "Debt / Cash / Net Debt bridge",
      kicker:
        state.companyBridgeMode === "YTD"
          ? `Balance sheet snapshot as of ${company.month}`
          : `${company.month} balance sheet snapshot`,
      right: `<span class="eyebrow">EURm</span>`,
      body: `
        <div class="compact-bridge-chart balance-bridge-chart">
          ${scenarios.map((scenario) => renderScenarioGroup(scenario, periodData[scenario], maxValue, balanceMetricOrder, balanceColors, false)).join("")}
        </div>
        ${renderBridgeLegend(balanceMetricOrder, balanceColors, false)}
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

  function renderScenarioGroup(key, scenario, maxValue, metricOrder, colors, clickable) {
    return `
      <div class="compact-scenario-group ${key}">
        <div class="compact-bars">
          ${metricOrder.map((metric) => renderMetricBar(metric, scenario.values[metric], maxValue, colors, clickable)).join("")}
        </div>
        <div class="compact-scenario-label">${scenario.label}</div>
        <div class="compact-values-row">
          ${metricOrder.map((metric) => `<span>${formatScenarioValue(scenario.values[metric])}</span>`).join("")}
        </div>
      </div>
    `;
  }

  function renderMetricBar(metric, value, maxValue, colors, clickable) {
    const height = Math.max(value > 0 ? 5 : 0, (value / maxValue) * 100);
    const content = `<div class="compact-bar" style="height:${height}%; background:${colors[metric]};"></div>`;

    if (!clickable) {
      return `<div class="compact-bar-slot non-clickable">${content}</div>`;
    }

    return `
      <button class="compact-bar-slot" data-bridge-detail="${metricDetailMap[metric]}" title="Open ${metricDetailMap[metric]} detail">
        ${content}
      </button>
    `;
  }

  function renderBridgeLegend(metricOrder, colors, clickable) {
    return `
      <div class="legend compact-bridge-legend">
        ${metricOrder.map((metric) => {
          const marker = `<span class="legend-mark" style="background:${colors[metric]};"></span>${metric}`;
          if (!clickable) return `<span>${marker}</span>`;
          return `<button class="legend-link" data-bridge-detail="${metricDetailMap[metric]}">${marker}</button>`;
        }).join("")}
      </div>
    `;
  }

  function formatScenarioValue(value) {
    return Number(value).toLocaleString(undefined, { maximumFractionDigits: value < 100 ? 1 : 0 });
  }

  function renderMetricSection(title, kicker, metrics) {
    return section({
      title,
      kicker,
      body: `
        <div class="metric-head">
          <div>Metric</div>
          <div>YTD development</div>
          <div>Month development</div>
        </div>
        ${metrics.map(renderMetricRow).join("")}
      `,
    });
  }

  function renderStandardCompanyDetail() {
    const company = selectedCompany();
    const operatingMetrics = company.metrics.filter((metric) => operatingMetricLabels.includes(metric.label));
    const balanceMetrics = company.metrics.filter((metric) => balanceMetricLabels.includes(metric.label));

    return `
      ${companyHeader(company)}
      ${renderCompanyBridge(company)}
      ${renderBalanceBridge(company)}
      ${renderMetricSection("Operating financial indicators", "YTD and MTD performance by operating metric", operatingMetrics)}
      ${renderMetricSection("Balance sheet / leverage indicators", "Debt, cash and leverage position", balanceMetrics)}
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

    document.querySelectorAll("[data-bridge-detail]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedMetric = button.dataset.bridgeDetail;
        state.detailMetric = button.dataset.bridgeDetail;
        state.detailMode = state.companyBridgeMode === "Monthly" ? "MTD" : "YTD";
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

    .balance-bridge-chart .compact-bars {
      height: 180px;
    }

    .compact-bar-slot {
      width: 34px;
      height: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      border: 0;
      background: transparent;
      padding: 0;
      cursor: pointer;
    }

    .compact-bar-slot.non-clickable {
      cursor: default;
    }

    .compact-bar-slot:hover .compact-bar {
      transform: translateY(-3px);
      box-shadow: 0 6px 14px rgba(0,0,0,.14);
    }

    .compact-bar-slot.non-clickable:hover .compact-bar {
      transform: none;
      box-shadow: none;
    }

    .compact-bar {
      width: 100%;
      min-height: 5px;
      transition: transform .15s ease, box-shadow .15s ease;
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

    .balance-bridge-chart .compact-values-row {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .compact-bridge-legend {
      margin-top: 14px;
      border-top: 1px solid #D8D6D0;
      padding-top: 14px;
    }

    .legend-link {
      border: 0;
      background: transparent;
      padding: 0;
      display: inline-flex;
      align-items: center;
      gap: 9px;
      color: inherit;
      font: inherit;
      font-weight: 900;
      letter-spacing: .14em;
      text-transform: uppercase;
      cursor: pointer;
    }

    .legend-link:hover {
      text-decoration: underline;
      text-underline-offset: 5px;
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
