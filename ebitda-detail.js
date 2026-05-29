(function () {
  const previousRenderCompanyDetail = renderCompanyDetail;

  const ebitdaMonths = [
    { month: "Jan", actual: 1450, budget: 1500, ly: 1400 },
    { month: "Feb", actual: 1600, budget: 1620, ly: 1550 },
    { month: "Mar", actual: 1800, budget: 1780, ly: 1730 },
    { month: "Apr", actual: 1950, budget: 1960, ly: 1880 },
    { month: "May", actual: 2000, budget: 2000, ly: 1961 },
  ];

  const ebitdaPercentMonthly = [
    { month: "Jan", actual: 17.4, budget: 18.2, ly: 17.1 },
    { month: "Feb", actual: 18.2, budget: 18.6, ly: 17.8 },
    { month: "Mar", actual: 19.4, budget: 18.9, ly: 18.7 },
    { month: "Apr", actual: 20.1, budget: 20.0, ly: 19.3 },
    { month: "May", actual: 20.0, budget: 20.0, ly: 19.7 },
  ];

  const ebitdaPercentYtd = [
    { month: "Jan", actual: 17.4, budget: 18.2, ly: 17.1 },
    { month: "Feb", actual: 17.8, budget: 18.4, ly: 17.5 },
    { month: "Mar", actual: 18.4, budget: 18.6, ly: 17.9 },
    { month: "Apr", actual: 18.9, budget: 19.0, ly: 18.3 },
    { month: "May", actual: 19.1, budget: 19.2, ly: 18.6 },
  ];

  if (!state.ebitdaChartMode) state.ebitdaChartMode = "YTD";

  function cumulativeEbitdaMonths() {
    let actual = 0;
    let budget = 0;
    let ly = 0;

    return ebitdaMonths.map((row) => {
      actual += row.actual;
      budget += row.budget;
      ly += row.ly;
      return { month: row.month, actual, budget, ly };
    });
  }

  function ebitdaPercentageRows() {
    return state.ebitdaChartMode === "YTD" ? ebitdaPercentYtd : ebitdaPercentMonthly;
  }

  function renderEbitdaDetailPage(company) {
    const rows = state.ebitdaChartMode === "YTD" ? cumulativeEbitdaMonths() : ebitdaMonths;
    const percentRows = ebitdaPercentageRows();
    const maxValue = Math.max(...rows.flatMap((row) => [row.actual, row.budget, row.ly]));
    const breakdown = [
      { segment: "Business line A", actual: "820", share: "41.0%", budget: "+20", ly: "+2.5%", good: true },
      { segment: "Business line B", actual: "610", share: "30.5%", budget: "+35", ly: "+5.8%", good: true },
      { segment: "Business line C", actual: "310", share: "15.5%", budget: "-40", ly: "-3.1%", good: false },
      { segment: "Other / central", actual: "260", share: "13.0%", budget: "-15", ly: "+1.2%", good: false },
    ];

    return `
      ${companyHeader(company)}
      <button class="back" data-back-detail>Back to financial indicators</button>
      ${section({
        title: "Adjusted EBITDA detail",
        kicker: `${company.name} · ${company.month} ${company.fy}`,
        right: `<span class="eyebrow">EURm</span>`,
        body: `
          <div class="summary-box">
            <div class="summary-title">Summary</div>
            <p>Adjusted EBITDA is broadly in line with budget YTD and above last year. Margin development remains stable, with Business line C still the main drag versus plan.</p>
          </div>
        `,
      })}
      ${section({
        title: "Adjusted EBITDA development",
        kicker: state.ebitdaChartMode === "YTD" ? "Cumulative actual vs budget vs last year" : "Monthly actual vs budget vs last year",
        right: renderEbitdaToggle(),
        body: `${renderEbitdaBars(rows, maxValue)}${renderEbitdaLegend()}`,
      })}
      ${section({
        title: "Adjusted EBITDA % of revenues",
        kicker: state.ebitdaChartMode === "YTD" ? "Cumulative EBITDA as % of cumulative revenues" : "Monthly EBITDA as % of monthly revenues",
        right: `<span class="eyebrow">Actual vs budget vs last year</span>`,
        body: renderEbitdaPercentChart(percentRows),
      })}
      ${section({
        title: "Adjusted EBITDA breakdown",
        kicker: "Segment / channel view",
        body: renderTable(
          ["Segment", "YTD actual", "Share", "vs budget", "vs LY"],
          breakdown.map((row) => [
            row.segment,
            row.actual,
            row.share,
            varianceBadge({ pct: row.budget, abs: "", good: row.good }),
            varianceBadge({ pct: row.ly, abs: "", good: row.ly.startsWith("+") }),
          ])
        ),
      })}
    `;
  }

  function renderEbitdaToggle() {
    return `
      <div class="toggle">
        <button class="${state.ebitdaChartMode === "YTD" ? "active" : ""}" data-ebitda-chart="YTD">YTD</button>
        <button class="${state.ebitdaChartMode === "Monthly" ? "active" : ""}" data-ebitda-chart="Monthly">Monthly</button>
      </div>
    `;
  }

  function renderEbitdaBars(rows, maxValue) {
    return `
      <div class="chart-grid">
        ${rows.map((row) => {
          const budgetVariance = row.actual - row.budget;
          const lyVariance = row.actual - row.ly;
          const budgetPct = `${budgetVariance >= 0 ? "+" : ""}${((row.actual / row.budget - 1) * 100).toFixed(1)}%`;
          const lyPct = `${lyVariance >= 0 ? "+" : ""}${((row.actual / row.ly - 1) * 100).toFixed(1)}%`;

          return `
            <div class="chart-month">
              <div class="bars">
                <div class="bar-wrap"><div class="bar actual" style="height: ${(row.actual / maxValue) * 100}%;"></div></div>
                <div class="bar-wrap"><div class="bar budget" style="height: ${(row.budget / maxValue) * 100}%;"></div></div>
                <div class="bar-wrap"><div class="bar ly" style="height: ${(row.ly / maxValue) * 100}%;"></div></div>
              </div>
              <div class="month-label">
                <strong>${row.month}</strong>
                <span>${row.actual.toLocaleString()}</span>
              </div>
              <div class="mini-variance">
                <div class="mini-badge ${budgetVariance >= 0 ? "good" : "bad"}">BUD<br>${budgetPct}</div>
                <div class="mini-badge ${lyVariance >= 0 ? "good" : "bad"}">LY<br>${lyPct}</div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderEbitdaPercentChart(rows) {
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
        <svg viewBox="0 0 ${width} ${height}" width="100%" height="280" role="img" aria-label="Adjusted EBITDA percentage of revenues line chart">
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

  function renderEbitdaLegend() {
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
    if (state.detailMetric === "Adjusted EBITDA") return renderEbitdaDetailPage(company);
    return previousRenderCompanyDetail();
  };

  const previousBindEvents = bindEvents;

  bindEvents = function () {
    previousBindEvents();
    document.querySelectorAll("[data-ebitda-chart]").forEach((button) => {
      button.addEventListener("click", () => {
        state.ebitdaChartMode = button.dataset.ebitdaChart;
        render();
      });
    });
  };

  render();
})();
