(function () {
  const previousRenderCompanyDetail = renderCompanyDetail;
  const previousBindEvents = bindEvents;

  const metricConfigs = {
    "Adjusted EBITDA": {
      title: "Adjusted EBITDA detail",
      unit: "EURm",
      percentTitle: "Adjusted EBITDA % of revenues",
      percentKickerYtd: "Cumulative EBITDA as % of cumulative revenues",
      percentKickerMonthly: "Monthly EBITDA as % of monthly revenues",
      summary: "Adjusted EBITDA is broadly in line with budget YTD and above last year. Margin development remains stable, with cost control offsetting softer performance in selected business lines.",
      lowerIsBetter: false,
      months: [
        { month: "Jan", actual: 1450, budget: 1500, ly: 1400 },
        { month: "Feb", actual: 1600, budget: 1620, ly: 1550 },
        { month: "Mar", actual: 1800, budget: 1780, ly: 1730 },
        { month: "Apr", actual: 1950, budget: 1960, ly: 1880 },
        { month: "May", actual: 2000, budget: 2000, ly: 1961 },
      ],
      percentMonthly: [
        { month: "Jan", actual: 17.4, budget: 18.2, ly: 17.1 },
        { month: "Feb", actual: 18.2, budget: 18.6, ly: 17.8 },
        { month: "Mar", actual: 19.4, budget: 18.9, ly: 18.7 },
        { month: "Apr", actual: 20.1, budget: 20.0, ly: 19.3 },
        { month: "May", actual: 20.0, budget: 20.0, ly: 19.7 },
      ],
      percentYtd: [
        { month: "Jan", actual: 17.4, budget: 18.2, ly: 17.1 },
        { month: "Feb", actual: 17.8, budget: 18.4, ly: 17.5 },
        { month: "Mar", actual: 18.4, budget: 18.6, ly: 17.9 },
        { month: "Apr", actual: 18.9, budget: 19.0, ly: 18.3 },
        { month: "May", actual: 19.1, budget: 19.2, ly: 18.6 },
      ],
    },
    "CAPEX": {
      title: "CAPEX detail",
      unit: "EURm",
      percentTitle: "CAPEX % of revenues",
      percentKickerYtd: "Cumulative CAPEX as % of cumulative revenues",
      percentKickerMonthly: "Monthly CAPEX as % of monthly revenues",
      summary: "CAPEX is below budget YTD, supporting near-term cash generation. The next review should separate timing effects from genuine savings to avoid underinvestment risk.",
      lowerIsBetter: true,
      months: [
        { month: "Jan", actual: 2.1, budget: 2.5, ly: 2.3 },
        { month: "Feb", actual: 1.8, budget: 2.2, ly: 2.1 },
        { month: "Mar", actual: 2.4, budget: 2.1, ly: 2.0 },
        { month: "Apr", actual: 1.9, budget: 2.4, ly: 2.2 },
        { month: "May", actual: 1.8, budget: 2.8, ly: 2.4 },
      ],
      percentMonthly: [
        { month: "Jan", actual: 2.5, budget: 3.0, ly: 2.8 },
        { month: "Feb", actual: 2.0, budget: 2.5, ly: 2.4 },
        { month: "Mar", actual: 2.6, budget: 2.2, ly: 2.2 },
        { month: "Apr", actual: 2.0, budget: 2.4, ly: 2.3 },
        { month: "May", actual: 1.8, budget: 2.8, ly: 2.5 },
      ],
      percentYtd: [
        { month: "Jan", actual: 2.5, budget: 3.0, ly: 2.8 },
        { month: "Feb", actual: 2.2, budget: 2.8, ly: 2.6 },
        { month: "Mar", actual: 2.4, budget: 2.6, ly: 2.5 },
        { month: "Apr", actual: 2.3, budget: 2.5, ly: 2.4 },
        { month: "May", actual: 2.2, budget: 2.6, ly: 2.4 },
      ],
    },
    "OpCF (EBITDA less Capex)": {
      title: "OpCF detail",
      unit: "EURm",
      percentTitle: "OpCF % of revenues",
      percentKickerYtd: "Cumulative OpCF as % of cumulative revenues",
      percentKickerMonthly: "Monthly OpCF as % of monthly revenues",
      summary: "Operating cash flow before working capital is slightly ahead of budget YTD, helped by stable EBITDA and lower CAPEX. The key follow-up is whether lower CAPEX is timing-related or sustainable.",
      lowerIsBetter: false,
      months: [
        { month: "Jan", actual: 1447.9, budget: 1497.5, ly: 1397.7 },
        { month: "Feb", actual: 1598.2, budget: 1617.8, ly: 1547.9 },
        { month: "Mar", actual: 1797.6, budget: 1777.9, ly: 1728.0 },
        { month: "Apr", actual: 1948.1, budget: 1957.6, ly: 1877.8 },
        { month: "May", actual: 1998.2, budget: 1997.2, ly: 1958.6 },
      ],
      percentMonthly: [
        { month: "Jan", actual: 17.3, budget: 18.0, ly: 16.9 },
        { month: "Feb", actual: 18.1, budget: 18.4, ly: 17.6 },
        { month: "Mar", actual: 19.3, budget: 18.7, ly: 18.5 },
        { month: "Apr", actual: 20.0, budget: 19.8, ly: 19.0 },
        { month: "May", actual: 19.8, budget: 19.7, ly: 19.4 },
      ],
      percentYtd: [
        { month: "Jan", actual: 17.3, budget: 18.0, ly: 16.9 },
        { month: "Feb", actual: 17.7, budget: 18.2, ly: 17.3 },
        { month: "Mar", actual: 18.3, budget: 18.4, ly: 17.7 },
        { month: "Apr", actual: 18.8, budget: 18.7, ly: 18.1 },
        { month: "May", actual: 19.0, budget: 18.9, ly: 18.4 },
      ],
    },
  };

  Object.keys(metricConfigs).forEach((name) => {
    const key = chartKey(name);
    if (!state[key]) state[key] = "YTD";
  });

  function chartKey(metricName) {
    if (metricName === "CAPEX") return "capexChartMode";
    if (metricName.startsWith("OpCF")) return "opcfChartMode";
    return "ebitdaChartMode";
  }

  function cumulativeRows(rows) {
    let actual = 0;
    let budget = 0;
    let ly = 0;

    return rows.map((row) => {
      actual += row.actual;
      budget += row.budget;
      ly += row.ly;
      return { month: row.month, actual, budget, ly };
    });
  }

  function activeRows(config, metricName) {
    return state[chartKey(metricName)] === "YTD" ? cumulativeRows(config.months) : config.months;
  }

  function activePercentRows(config, metricName) {
    return state[chartKey(metricName)] === "YTD" ? config.percentYtd : config.percentMonthly;
  }

  function renderMetricDetail(metricName, company) {
    const config = metricConfigs[metricName];
    const mode = state[chartKey(metricName)];
    const rows = activeRows(config, metricName);
    const percentRows = activePercentRows(config, metricName);
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
        kicker: mode === "YTD" ? "Cumulative actual vs budget vs last year" : "Monthly actual vs budget vs last year",
        right: renderToggle(metricName),
        body: `${renderBars(rows, maxValue, config.lowerIsBetter)}${renderLegend()}`,
      })}
      ${section({
        title: config.percentTitle,
        kicker: mode === "YTD" ? config.percentKickerYtd : config.percentKickerMonthly,
        right: `<span class="eyebrow">Actual vs budget vs last year</span>`,
        body: renderPercentChart(percentRows, config.percentTitle),
      })}
    `;
  }

  function renderToggle(metricName) {
    const key = chartKey(metricName);
    return `
      <div class="toggle">
        <button class="${state[key] === "YTD" ? "active" : ""}" data-metric-chart="${metricName}" data-mode="YTD">YTD</button>
        <button class="${state[key] === "Monthly" ? "active" : ""}" data-metric-chart="${metricName}" data-mode="Monthly">Monthly</button>
      </div>
    `;
  }

  function goodVariance(variance, lowerIsBetter) {
    if (Math.abs(variance) < 0.0001) return true;
    return lowerIsBetter ? variance <= 0 : variance >= 0;
  }

  function renderBars(rows, maxValue, lowerIsBetter) {
    return `
      <div class="chart-grid">
        ${rows.map((row) => {
          const budgetVariance = row.actual - row.budget;
          const lyVariance = row.actual - row.ly;
          const budgetPct = `${budgetVariance >= 0 ? "+" : ""}${((row.actual / row.budget - 1) * 100).toFixed(1)}%`;
          const lyPct = `${lyVariance >= 0 ? "+" : ""}${((row.actual / row.ly - 1) * 100).toFixed(1)}%`;
          const budgetGood = goodVariance(budgetVariance, lowerIsBetter);
          const lyGood = goodVariance(lyVariance, lowerIsBetter);

          return `
            <div class="chart-month">
              <div class="bars">
                <div class="bar-wrap"><div class="bar actual" style="height: ${(row.actual / maxValue) * 100}%;"></div></div>
                <div class="bar-wrap"><div class="bar budget" style="height: ${(row.budget / maxValue) * 100}%;"></div></div>
                <div class="bar-wrap"><div class="bar ly" style="height: ${(row.ly / maxValue) * 100}%;"></div></div>
              </div>
              <div class="month-label">
                <strong>${row.month}</strong>
                <span>${Number(row.actual).toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
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

  function renderPercentChart(rows, title) {
    const width = 1000;
    const height = 280;
    const labelPaddingLeft = 80;
    const paddingTop = 38;
    const paddingBottom = 62;
    const series = [
      { key: "actual", label: "Actual", color: "#000000", strokeWidth: 5, dash: "" },
      { key: "budget", label: "Budget", color: "#B7B3AA", strokeWidth: 4, dash: "" },
      { key: "ly", label: "Last year", color: "#D1CEC7", strokeWidth: 4, dash: "7 7" },
    ];
    const values = rows.flatMap((row) => [row.actual, row.budget, row.ly]);
    const minValue = Math.floor((Math.min(...values) - 0.8) * 2) / 2;
    const maxValue = Math.ceil((Math.max(...values) + 0.8) * 2) / 2;
    const plotLeft = 96;
    const plotRight = width - 40;
    const innerHeight = height - paddingTop - paddingBottom;

    const xForIndex = (index) => width * ((index + 0.5) / rows.length);
    const yForValue = (value) => paddingTop + ((maxValue - value) / (maxValue - minValue)) * innerHeight;
    const pointsBySeries = Object.fromEntries(
      series.map((item) => [
        item.key,
        rows.map((row, index) => ({
          x: xForIndex(index),
          y: yForValue(row[item.key]),
          value: row[item.key],
          month: row.month,
        })),
      ])
    );
    const yTicks = [maxValue, (maxValue + minValue) / 2, minValue];

    return `
      <div style="background:white;border-radius:3px;padding:18px 0 10px;">
        <svg viewBox="0 0 ${width} ${height}" width="100%" height="280" role="img" aria-label="${title} line chart">
          <rect x="0" y="0" width="${width}" height="${height}" fill="white"></rect>
          ${yTicks.map((tick) => {
            const y = yForValue(tick);
            return `
              <line x1="${plotLeft}" y1="${y}" x2="${plotRight}" y2="${y}" stroke="#D8D6D0" stroke-width="1" />
              <text x="${labelPaddingLeft}" y="${y + 4}" text-anchor="end" font-size="19" fill="#817C75">${tick.toFixed(1)}%</text>
            `;
          }).join("")}
          ${pointsBySeries.actual.map((point) => `
            <line x1="${point.x}" y1="${paddingTop}" x2="${point.x}" y2="${height - paddingBottom + 10}" stroke="#E6E5E1" stroke-width="1" />
            <text x="${point.x}" y="${height - 16}" text-anchor="middle" font-size="22" font-weight="800" fill="#817C75">${point.month}</text>
          `).join("")}
          ${series.map((item) => {
            const polyline = pointsBySeries[item.key].map((point) => `${point.x},${point.y}`).join(" ");
            return `<polyline points="${polyline}" fill="none" stroke="${item.color}" stroke-width="${item.strokeWidth}" stroke-linejoin="round" stroke-linecap="round" ${item.dash ? `stroke-dasharray="${item.dash}"` : ""} />`;
          }).join("")}
          ${pointsBySeries.budget.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="6" fill="#B7B3AA" />`).join("")}
          ${pointsBySeries.ly.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="6" fill="#D1CEC7" />`).join("")}
          ${pointsBySeries.actual.map((point) => `
            <circle cx="${point.x}" cy="${point.y}" r="8" fill="#000000" />
            <text x="${point.x}" y="${point.y - 15}" text-anchor="middle" font-size="18" font-weight="800" fill="#000000">${point.value.toFixed(1)}%</text>
          `).join("")}
        </svg>
      </div>
      <div class="legend">
        ${series.map((item) => `<span><span class="legend-mark" style="background:${item.color};"></span>${item.label}</span>`).join("")}
      </div>
    `;
  }

  function renderLegend() {
    return `
      <div class="legend">
        <span><span class="legend-mark" style="background: var(--black);"></span>Actual</span>
        <span><span class="legend-mark" style="background: #B7B3AA;"></span>Budget</span>
        <span><span class="legend-mark" style="background: #D1CEC7;"></span>Last year</span>
      </div>
    `;
  }

  renderCompanyDetail = function () {
    const company = selectedCompany();
    if (metricConfigs[state.detailMetric]) return renderMetricDetail(state.detailMetric, company);
    return previousRenderCompanyDetail();
  };

  bindEvents = function () {
    previousBindEvents();

    document.querySelectorAll("[data-open-detail]").forEach((button) => {
      button.addEventListener("click", () => {
        const metricName = button.dataset.openDetail;
        if (!metricConfigs[metricName]) return;
        state.selectedMetric = metricName;
        state.detailMode = button.dataset.mode || "YTD";
        state.detailMetric = metricName;
        render();
      });
    });

    document.querySelectorAll("[data-metric-chart]").forEach((button) => {
      button.addEventListener("click", () => {
        const metricName = button.dataset.metricChart;
        state[chartKey(metricName)] = button.dataset.mode;
        render();
      });
    });
  };

  render();
})();
