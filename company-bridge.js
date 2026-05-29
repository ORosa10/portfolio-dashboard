(function () {
  const previousRenderCompanyDetail = renderCompanyDetail;
  const previousBindEvents = bindEvents;

  if (!state.companyBridgeMode) state.companyBridgeMode = "YTD";

  const bridgeData = {
    YTD: {
      actual: { label: "Actual", values: { Revenue: 10000, "Gross Margin": 3800, "Adj. EBITDA": 2000, CAPEX: 10, OpCF: 1990 } },
      budget: { label: "Budget", values: { Revenue: 10000, "Gross Margin": 3750, "Adj. EBITDA": 2000, CAPEX: 12, OpCF: 1988 } },
      ly: { label: "Last year", values: { Revenue: 9524, "Gross Margin": 3718, "Adj. EBITDA": 1961, CAPEX: 10.9, OpCF: 1949 } },
    },
    Monthly: {
      actual: { label: "Actual", values: { Revenue: 2400, "Gross Margin": 912, "Adj. EBITDA": 480, CAPEX: 1.8, OpCF: 478.2 } },
      budget: { label: "Budget", values: { Revenue: 2438, "Gross Margin": 914, "Adj. EBITDA": 488, CAPEX: 2.8, OpCF: 485.2 } },
      ly: { label: "Last year", values: { Revenue: 2376, "Gross Margin": 885, "Adj. EBITDA": 462, CAPEX: 2.4, OpCF: 459.6 } },
    },
  };

  const bridgeMetricOrder = ["Revenue", "Gross Margin", "Adj. EBITDA", "CAPEX", "OpCF"];

  function renderCompanyBridge(company) {
    const periodData = bridgeData[state.companyBridgeMode];
    const maxValue = Math.max(
      ...Object.values(periodData).flatMap((scenario) => bridgeMetricOrder.map((metric) => scenario.values[metric]))
    );

    return section({
      title: "Revenue to OpCF bridge",
      kicker:
        state.companyBridgeMode === "YTD"
          ? `YTD snapshot as of ${company.month}`
          : `${company.month} monthly snapshot`,
      right: renderBridgeToggle(),
      body: `
        <div class="scenario-bridge-grid">
          ${["actual", "budget", "ly"].map((key) => renderScenarioBridge(key, periodData[key], maxValue)).join("")}
        </div>
        <div class="scenario-bridge-note">Each block shows the same bridge from Revenue to OpCF for the selected period. CAPEX is shown as a small deduction between EBITDA and OpCF.</div>
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

  function renderScenarioBridge(key, scenario, maxValue) {
    return `
      <div class="scenario-bridge-card ${key}">
        <div class="scenario-title">${scenario.label}</div>
        <div class="scenario-bars">
          ${bridgeMetricOrder.map((metric) => renderScenarioMetric(metric, scenario.values[metric], maxValue, key)).join("")}
        </div>
      </div>
    `;
  }

  function renderScenarioMetric(metric, value, maxValue, key) {
    const isCapex = metric === "CAPEX";
    const height = Math.max(value > 0 ? 4 : 0, (value / maxValue) * 100);

    return `
      <div class="scenario-metric ${isCapex ? "capex" : ""}">
        <div class="scenario-bar-area">
          <div class="scenario-bar ${key} ${isCapex ? "capex" : ""}" style="height:${height}%;"></div>
        </div>
        <div class="scenario-metric-label">${metric}</div>
        <div class="scenario-metric-value">${formatScenarioValue(value)}</div>
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
    .scenario-bridge-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
      margin-top: 8px;
    }

    .scenario-bridge-card {
      background: #ffffff;
      border-radius: 3px;
      padding: 18px 16px 14px;
      min-height: 340px;
      display: flex;
      flex-direction: column;
    }

    .scenario-title {
      font-size: 13px;
      font-weight: 900;
      letter-spacing: .16em;
      text-transform: uppercase;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 1px solid #D8D6D0;
    }

    .scenario-bridge-card.actual .scenario-title { color: #000000; }
    .scenario-bridge-card.budget .scenario-title { color: #817C75; }
    .scenario-bridge-card.ly .scenario-title { color: #9A968E; }

    .scenario-bars {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 9px;
      flex: 1;
      align-items: end;
    }

    .scenario-metric {
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      height: 260px;
    }

    .scenario-bar-area {
      height: 170px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      border-bottom: 1px solid #D8D6D0;
      margin-bottom: 10px;
    }

    .scenario-bar {
      width: 28px;
      min-height: 4px;
      background: #000000;
    }

    .scenario-bar.budget { background: #B7B3AA; }
    .scenario-bar.ly { background: #D1CEC7; }
    .scenario-bar.capex {
      width: 20px;
      opacity: .75;
    }

    .scenario-metric-label {
      text-align: center;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: .06em;
      text-transform: uppercase;
      min-height: 28px;
      line-height: 1.2;
    }

    .scenario-metric-value {
      text-align: center;
      font-size: 12px;
      color: #817C75;
      font-weight: 800;
    }

    .scenario-bridge-note {
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid #D8D6D0;
      font-size: 12px;
      color: #817C75;
      line-height: 1.45;
    }

    @media (max-width: 1100px) {
      .scenario-bridge-grid { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(style);

  render();
})();
