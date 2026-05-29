(function () {
  const previousRenderCompanyDetail = renderCompanyDetail;
  const previousBindEvents = bindEvents;

  if (!state.companyBridgeMode) state.companyBridgeMode = "YTD";

  const bridgeData = {
    YTD: [
      { label: "Revenue", actual: 10000, budget: 10000, ly: 9524 },
      { label: "Gross Margin", actual: 3800, budget: 3750, ly: 3718 },
      { label: "Adjusted EBITDA", actual: 2000, budget: 2000, ly: 1961 },
      { label: "CAPEX", actual: 10, budget: 12, ly: 10.9, lowerIsBetter: true },
      { label: "OpCF", actual: 1990, budget: 1988, ly: 1949 },
    ],
    Monthly: [
      { label: "Revenue", actual: 2400, budget: 2438, ly: 2376 },
      { label: "Gross Margin", actual: 912, budget: 914, ly: 885 },
      { label: "Adjusted EBITDA", actual: 480, budget: 488, ly: 462 },
      { label: "CAPEX", actual: 1.8, budget: 2.8, ly: 2.4, lowerIsBetter: true },
      { label: "OpCF", actual: 478.2, budget: 485.2, ly: 459.6 },
    ],
  };

  function renderCompanyBridge(company) {
    const rows = bridgeData[state.companyBridgeMode];
    const maxValue = Math.max(...rows.flatMap((row) => [row.actual, row.budget, row.ly]));

    return section({
      title: "Revenue to OpCF bridge",
      kicker:
        state.companyBridgeMode === "YTD"
          ? `YTD snapshot as of ${company.month}`
          : `${company.month} monthly snapshot`,
      right: renderBridgeToggle(),
      body: `
        <div class="bridge-chart">
          ${rows.map((row) => renderBridgeMetric(row, maxValue)).join("")}
        </div>
        <div class="legend">
          <span><span class="legend-mark" style="background: var(--black);"></span>Actual</span>
          <span><span class="legend-mark" style="background: #B7B3AA;"></span>Budget</span>
          <span><span class="legend-mark" style="background: #D1CEC7;"></span>Last year</span>
        </div>
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

  function renderBridgeMetric(row, maxValue) {
    const varianceBudget = row.actual - row.budget;
    const varianceLy = row.actual - row.ly;
    const budgetGood = row.lowerIsBetter ? varianceBudget <= 0 : varianceBudget >= 0;
    const lyGood = row.lowerIsBetter ? varianceLy <= 0 : varianceLy >= 0;

    return `
      <div class="bridge-metric">
        <div class="bridge-bars">
          ${renderBridgeBar(row.actual, maxValue, "actual")}
          ${renderBridgeBar(row.budget, maxValue, "budget")}
          ${renderBridgeBar(row.ly, maxValue, "ly")}
        </div>
        <div class="bridge-label">${row.label}</div>
        <div class="bridge-value">${formatBridgeValue(row.actual)}</div>
        <div class="bridge-variance-row">
          <div class="mini-badge ${budgetGood ? "good" : "bad"}">BUD<br>${formatBridgePct(row.actual, row.budget)}</div>
          <div class="mini-badge ${lyGood ? "good" : "bad"}">LY<br>${formatBridgePct(row.actual, row.ly)}</div>
        </div>
      </div>
    `;
  }

  function renderBridgeBar(value, maxValue, variant) {
    const minHeight = value > 0 ? 3 : 0;
    const height = Math.max(minHeight, (value / maxValue) * 100);
    return `<div class="bridge-bar-wrap"><div class="bridge-bar ${variant}" style="height: ${height}%;"></div></div>`;
  }

  function formatBridgeValue(value) {
    return Number(value).toLocaleString(undefined, { maximumFractionDigits: value < 100 ? 1 : 0 });
  }

  function formatBridgePct(actual, compare) {
    const pct = ((actual / compare - 1) * 100).toFixed(1);
    return `${pct >= 0 ? "+" : ""}${pct}%`;
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
    .bridge-chart {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 12px;
      margin-top: 8px;
    }

    .bridge-metric {
      background: #ffffff;
      border-radius: 3px;
      padding: 16px 14px 14px;
      min-height: 290px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }

    .bridge-bars {
      height: 150px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 8px;
      margin-bottom: 12px;
      border-bottom: 1px solid #D8D6D0;
    }

    .bridge-bar-wrap {
      width: 24px;
      height: 100%;
      display: flex;
      align-items: flex-end;
    }

    .bridge-bar {
      width: 100%;
      min-height: 3px;
    }

    .bridge-bar.actual { background: #000000; }
    .bridge-bar.budget { background: #B7B3AA; }
    .bridge-bar.ly { background: #D1CEC7; }

    .bridge-label {
      text-align: center;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: .08em;
      text-transform: uppercase;
      min-height: 34px;
    }

    .bridge-value {
      text-align: center;
      font-size: 13px;
      color: #817C75;
      margin-bottom: 10px;
      font-weight: 700;
    }

    .bridge-variance-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }

    @media (max-width: 900px) {
      .bridge-chart { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(style);

  render();
})();
