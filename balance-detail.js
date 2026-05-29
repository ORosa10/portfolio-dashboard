(function () {
  const previousRenderCompanyDetail = renderCompanyDetail;
  const previousBindEvents = bindEvents;

  const balanceDetailConfigs = {
    Debt: {
      title: "Debt detail",
      unit: "EURm",
      lowerIsBetter: true,
      summary: "Debt is slightly below budget and broadly in line with last year. The key focus is whether current debt levels are supported by stable cash generation and refinancing headroom.",
      rowsYtd: [
        { month: "Jan", actual: 22.5, budget: 24.0, ly: 23.5 },
        { month: "Feb", actual: 22.0, budget: 23.5, ly: 22.8 },
        { month: "Mar", actual: 21.5, budget: 23.0, ly: 22.1 },
        { month: "Apr", actual: 20.8, budget: 22.5, ly: 21.4 },
        { month: "May", actual: 20.0, budget: 22.0, ly: 20.6 },
      ],
      rowsMonthly: [
        { month: "Jan", actual: 22.5, budget: 24.0, ly: 23.5 },
        { month: "Feb", actual: 22.0, budget: 23.5, ly: 22.8 },
        { month: "Mar", actual: 21.5, budget: 23.0, ly: 22.1 },
        { month: "Apr", actual: 20.8, budget: 22.5, ly: 21.4 },
        { month: "May", actual: 20.0, budget: 22.0, ly: 20.6 },
      ],
      breakdownHeaders: ["Source", "Amount", "Share", "vs budget", "vs LY"],
      breakdownRows: [
        ["Bank debt", "14.0", "70.0%", "-1.5", "-0.4"],
        ["Lease liabilities", "4.0", "20.0%", "-0.3", "-0.1"],
        ["Other debt", "2.0", "10.0%", "-0.2", "-0.1"],
      ],
    },
    Cash: {
      title: "Cash detail",
      unit: "EURm",
      lowerIsBetter: false,
      summary: "Cash is above budget and slightly ahead of last year. Liquidity remains comfortable, supported by stable operating cash flow and controlled CAPEX.",
      rowsYtd: [
        { month: "Jan", actual: 7.8, budget: 7.2, ly: 7.4 },
        { month: "Feb", actual: 8.2, budget: 7.6, ly: 7.8 },
        { month: "Mar", actual: 8.8, budget: 8.0, ly: 8.2 },
        { month: "Apr", actual: 9.4, budget: 8.5, ly: 8.8 },
        { month: "May", actual: 10.0, budget: 9.0, ly: 9.6 },
      ],
      rowsMonthly: [
        { month: "Jan", actual: 7.8, budget: 7.2, ly: 7.4 },
        { month: "Feb", actual: 8.2, budget: 7.6, ly: 7.8 },
        { month: "Mar", actual: 8.8, budget: 8.0, ly: 8.2 },
        { month: "Apr", actual: 9.4, budget: 8.5, ly: 8.8 },
        { month: "May", actual: 10.0, budget: 9.0, ly: 9.6 },
      ],
      breakdownHeaders: ["Bucket", "Amount", "Share", "vs budget", "vs LY"],
      breakdownRows: [
        ["Operating cash", "6.5", "65.0%", "+0.6", "+0.3"],
        ["Restricted cash", "1.5", "15.0%", "+0.1", "+0.0"],
        ["Other cash", "2.0", "20.0%", "+0.3", "+0.1"],
      ],
    },
    "Net debt / LTM EBITDA": {
      title: "Net debt / LTM EBITDA detail",
      unit: "x",
      lowerIsBetter: true,
      summary: "Leverage remains low and below budget. Net debt / LTM EBITDA is supported by stable EBITDA and a stronger cash position versus plan.",
      rowsYtd: [
        { month: "Jan", actual: 0.75, budget: 0.90, ly: 0.85 },
        { month: "Feb", actual: 0.68, budget: 0.84, ly: 0.78 },
        { month: "Mar", actual: 0.62, budget: 0.78, ly: 0.71 },
        { month: "Apr", actual: 0.56, budget: 0.73, ly: 0.65 },
        { month: "May", actual: 0.50, budget: 0.70, ly: 0.60 },
      ],
      rowsMonthly: [
        { month: "Jan", actual: 0.75, budget: 0.90, ly: 0.85 },
        { month: "Feb", actual: 0.68, budget: 0.84, ly: 0.78 },
        { month: "Mar", actual: 0.62, budget: 0.78, ly: 0.71 },
        { month: "Apr", actual: 0.56, budget: 0.73, ly: 0.65 },
        { month: "May", actual: 0.50, budget: 0.70, ly: 0.60 },
      ],
      breakdownHeaders: ["Component", "Actual", "Budget", "Last year", "Comment"],
      breakdownRows: [
        ["Debt", "20.0", "22.0", "20.6", "Below budget"],
        ["Cash", "10.0", "9.0", "9.6", "Above budget"],
        ["Net debt", "10.0", "13.0", "11.0", "Lower leverage base"],
        ["LTM EBITDA", "20.0", "18.6", "18.3", "Stable denominator"],
      ],
    },
  };

  Object.keys(balanceDetailConfigs).forEach((metricName) => {
    const key = balanceChartKey(metricName);
    if (!state[key]) state[key] = "YTD";
  });

  function balanceChartKey(metricName) {
    if (metricName === "Debt") return "debtChartMode";
    if (metricName === "Cash") return "cashChartMode";
    return "leverageChartMode";
  }

  function renderBalanceMetricDetail(metricName, company) {
    const config = balanceDetailConfigs[metricName];
    const mode = state[balanceChartKey(metricName)];
    const rows = mode === "YTD" ? config.rowsYtd : config.rowsMonthly;
    const maxValue = Math.max(...rows.flatMap((row) => [row.actual, row.budget, row.ly]));

    return `
      ${companyHeader(company)}
      <button class="back" data-back-detail>Back to financial indicators</button>
      ${section({
        title: config.title,
        kicker: `${company.name} · ${company.month} ${company.fy}`,
        right: `<span class="eyebrow">${config.unit}</span>`,
        body: `
          <div class="summary-box">
            <div class="summary-title">Summary</div>
            <p>${config.summary}</p>
          </div>
        `,
      })}
      ${section({
        title: `${config.title.replace(" detail", "")} development`,
        kicker: mode === "YTD" ? "YTD actual vs budget vs last year" : "Monthly actual vs budget vs last year",
        right: renderBalanceToggle(metricName),
        body: `${renderBalanceBars(rows, maxValue, config.lowerIsBetter, config.unit)}${renderBalanceLegend()}`,
      })}
      ${section({
        title: `${config.title.replace(" detail", "")} breakdown`,
        kicker: metricName === "Net debt / LTM EBITDA" ? "Bridge from debt and cash to leverage" : "Composition view",
        body: renderTable(
          config.breakdownHeaders,
          config.breakdownRows.map((row) => row.map((cell, index) => {
            if (index < 3 || metricName === "Net debt / LTM EBITDA") return cell;
            const isGood = config.lowerIsBetter ? String(cell).startsWith("-") : String(cell).startsWith("+");
            return varianceBadge({ pct: cell, abs: "", good: isGood });
          }))
        ),
      })}
    `;
  }

  function renderBalanceToggle(metricName) {
    const key = balanceChartKey(metricName);
    return `
      <div class="toggle">
        <button class="${state[key] === "YTD" ? "active" : ""}" data-balance-chart="${metricName}" data-mode="YTD">YTD</button>
        <button class="${state[key] === "Monthly" ? "active" : ""}" data-balance-chart="${metricName}" data-mode="Monthly">Monthly</button>
      </div>
    `;
  }

  function renderBalanceBars(rows, maxValue, lowerIsBetter, unit) {
    return `
      <div class="chart-grid">
        ${rows.map((row) => {
          const budgetVariance = row.actual - row.budget;
          const lyVariance = row.actual - row.ly;
          const budgetPct = `${budgetVariance >= 0 ? "+" : ""}${((row.actual / row.budget - 1) * 100).toFixed(1)}%`;
          const lyPct = `${lyVariance >= 0 ? "+" : ""}${((row.actual / row.ly - 1) * 100).toFixed(1)}%`;
          const budgetGood = lowerIsBetter ? budgetVariance <= 0 : budgetVariance >= 0;
          const lyGood = lowerIsBetter ? lyVariance <= 0 : lyVariance >= 0;

          return `
            <div class="chart-month">
              <div class="bars">
                <div class="bar-wrap"><div class="bar actual" style="height:${(row.actual / maxValue) * 100}%;"></div></div>
                <div class="bar-wrap"><div class="bar budget" style="height:${(row.budget / maxValue) * 100}%;"></div></div>
                <div class="bar-wrap"><div class="bar ly" style="height:${(row.ly / maxValue) * 100}%;"></div></div>
              </div>
              <div class="month-label">
                <strong>${row.month}</strong>
                <span>${formatBalanceValue(row.actual, unit)}</span>
              </div>
              <div class="mini-variance">
                <div class="mini-badge ${budgetGood ? "good" : "bad"}">BUD<br>${budgetPct}</div>
                <div class="mini-badge ${lyGood ? "good" : "bad"}">LY<br>${lyPct}</div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function formatBalanceValue(value, unit) {
    const formatted = Number(value).toLocaleString(undefined, { maximumFractionDigits: unit === "x" ? 2 : 1 });
    return unit === "x" ? `${formatted}x` : formatted;
  }

  function renderBalanceLegend() {
    return `
      <div class="legend">
        <span><span class="legend-mark" style="background: var(--black);"></span>Actual</span>
        <span><span class="legend-mark" style="background:#B7B3AA;"></span>Budget</span>
        <span><span class="legend-mark" style="background:#D1CEC7;"></span>Last year</span>
      </div>
    `;
  }

  renderCompanyDetail = function () {
    const company = selectedCompany();
    if (balanceDetailConfigs[state.detailMetric]) return renderBalanceMetricDetail(state.detailMetric, company);
    return previousRenderCompanyDetail();
  };

  bindEvents = function () {
    previousBindEvents();

    document.querySelectorAll("[data-open-detail]").forEach((button) => {
      button.addEventListener("click", () => {
        const metricName = button.dataset.openDetail;
        if (!balanceDetailConfigs[metricName]) return;
        state.selectedMetric = metricName;
        state.detailMetric = metricName;
        state.detailMode = button.dataset.mode || "YTD";
        render();
      });
    });

    document.querySelectorAll("[data-balance-chart]").forEach((button) => {
      button.addEventListener("click", () => {
        const metricName = button.dataset.balanceChart;
        state[balanceChartKey(metricName)] = button.dataset.mode;
        render();
      });
    });
  };

  render();
})();
