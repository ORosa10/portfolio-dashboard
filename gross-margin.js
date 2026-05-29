(function () {
  const originalRenderCompanyDetail = renderCompanyDetail;

  const grossMarginMonths = [
    { month: "Jan", actual: 3116, budget: 3040, ly: 2926 },
    { month: "Feb", actual: 3344, budget: 3306, ly: 3173 },
    { month: "Mar", actual: 3534, budget: 3572, ly: 3363 },
    { month: "Apr", actual: 3686, budget: 3724, ly: 3515 },
    { month: "May", actual: 3800, budget: 3800, ly: 3619 },
  ];

  const grossMarginPercentMonthly = [
    { month: "Jan", actual: 37.2, budget: 36.9, ly: 35.9 },
    { month: "Feb", actual: 38.0, budget: 37.4, ly: 36.6 },
    { month: "Mar", actual: 37.1, budget: 38.0, ly: 37.0 },
    { month: "Apr", actual: 38.4, budget: 38.1, ly: 37.6 },
    { month: "May", actual: 38.0, budget: 37.8, ly: 37.3 },
  ];

  const grossMarginPercentYtd = [
    { month: "Jan", actual: 37.2, budget: 36.9, ly: 35.9 },
    { month: "Feb", actual: 37.6, budget: 37.2, ly: 36.3 },
    { month: "Mar", actual: 37.4, budget: 37.5, ly: 36.6 },
    { month: "Apr", actual: 37.7, budget: 37.7, ly: 36.9 },
    { month: "May", actual: 37.8, budget: 37.8, ly: 37.0 },
  ];

  if (!state.grossMarginChartMode) state.grossMarginChartMode = "YTD";

  function cumulativeGrossMarginMonths() {
    let actual = 0;
    let budget = 0;
    let ly = 0;

    return grossMarginMonths.map((row) => {
      actual += row.actual;
      budget += row.budget;
      ly += row.ly;
      return { month: row.month, actual, budget, ly };
    });
  }

  function grossMarginPercentageRows() {
    return state.grossMarginChartMode === "YTD" ? grossMarginPercentYtd : grossMarginPercentMonthly;
  }

  function renderGrossMarginDetail(company) {
    const rows = state.grossMarginChartMode === "YTD" ? cumulativeGrossMarginMonths() : grossMarginMonths;
    const percentRows = grossMarginPercentageRows();
    const maxValue = Math.max(...rows.flatMap((row) => [row.actual, row.budget, row.ly]));
    const breakdown = [
      { segment: "Business line A", actual: "1,615", share: "42.5%", budget: "+35", ly: "+2.2%", good: true },
      { segment: "Business line B", actual: "1,140", share: "30.0%", budget: "+55", ly: "+5.1%", good: true },
      { segment: "Business line C", actual: "665", share: "17.5%", budget: "-30", ly: "-1.4%", good: false },
      { segment: "Other", actual: "380", share: "10.0%", budget: "-10", ly: "+0.7%", good: false },
    ];

    return `
      ${companyHeader(company)}
      <button class="back" data-back-detail>Back to financial indicators</button>
      ${section({
        title: "Gross Margin detail",
        kicker: `${company.name} · ${company.month} ${company.fy}`,
        right: `<span class="eyebrow">EURm</span>`,
        body: `
          <div class="summary-box">
            <div class="summary-title">Summary</div>
            <p>Gross Margin is broadly on budget YTD and above last year. The only visible weakness is Business line C, partly offset by stronger Business line B trading.</p>
          </div>
        `,
      })}
      ${section({
        title: "Gross Margin development",
        kicker: state.grossMarginChartMode === "YTD" ? "Cumulative actual vs budget vs last year" : "Monthly actual vs budget vs last year",
        right: renderGrossMarginToggle(),
        body: `${renderGrossMarginBars(rows, maxValue)}${renderGrossMarginLegend()}`,
      })}
      ${section({
        title: "Gross Margin % of revenues",
        kicker: state.grossMarginChartMode === "YTD" ? "Cumulative gross margin as % of cumulative revenues" : "Monthly gross margin as % of monthly revenues",
        right: `<span class="eyebrow">Actual vs budget vs last year</span>`,
        body: renderGrossMarginPercentChart(percentRows),
      })}
      ${section({
        title: "Gross Margin breakdown",
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

  function renderGrossMarginToggle() {
    return `
      <div class="toggle">
        <button class="${state.grossMarginChartMode === "YTD" ? "active" : ""}" data-gross-margin-chart="YTD">YTD</button>
        <button class="${state.grossMarginChartMode === "Monthly" ? "active" : ""}" data-gross-margin-chart="Monthly">Monthly</button>
      </div>
    `;
  }

  function renderGrossMarginBars(rows, maxValue) {
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

  function renderGrossMarginPercentChart(rows) {
    const width = 1000;
    const height = 280;
    const paddingX = 0;
    const labelPaddingLeft = 80;
    const paddingTop = 38;
    const paddingBottom = 62;
    const series = [
      { key: "actual", label: "Actual", color: "#000000", strokeWidth: 5, dash: "" },
      { key: "budget", label: "Budget", color: "#B7B3AA", strokeWidth: 4, dash: "" },
      { key: "ly", label: "Last year", color: "#D1CEC7", strokeWidth: 4, dash: "7 7" },
    ];
    const values = rows.flatMap((row) => [row.actual, row.budget, row.ly]);
    const minValue = Math.floor((Math.min(...values) - 0.7) * 2) / 2;
    const maxValue = Math.ceil((Math.max(...values) + 0.7) * 2) / 2;
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
        <svg viewBox="0 0 ${width} ${height}" width="100%" height="280" role="img" aria-label="Gross Margin percentage of revenues line chart">
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

  function renderGrossMarginLegend() {
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
    if (state.detailMetric === "Gross margin") return renderGrossMarginDetail(company);
    return originalRenderCompanyDetail();
  };

  bindEvents = function () {
    document.querySelector("[data-action='portfolio']")?.addEventListener("click", () => {
      state.view = "portfolio";
      state.detailMetric = null;
      render();
    });
    document.querySelector("[data-action='company']")?.addEventListener("click", () => {
      state.view = "company";
      render();
    });
    document.getElementById("company-select")?.addEventListener("change", (event) => {
      state.selectedCompanyId = event.target.value;
      state.view = "company";
      state.detailMetric = null;
      render();
    });
    document.getElementById("period-select")?.addEventListener("change", (event) => {
      state.period = event.target.value;
      render();
    });
    document.querySelectorAll("[data-company-tile]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedCompanyId = button.dataset.companyTile;
        state.view = "company";
        state.detailMetric = null;
        render();
      });
    });
    document.querySelectorAll("[data-open-detail]").forEach((button) => {
      button.addEventListener("click", () => {
        const metric = button.dataset.openDetail;
        state.selectedMetric = metric;
        state.detailMode = button.dataset.mode || "YTD";
        state.detailMetric = ["Revenues", "Gross margin", "Adjusted EBITDA"].includes(metric) ? metric : null;
        render();
      });
    });
    document.querySelector("[data-back-detail]")?.addEventListener("click", () => {
      state.detailMetric = null;
      render();
    });
    document.querySelectorAll("[data-revenue-chart]").forEach((button) => {
      button.addEventListener("click", () => {
        state.revenueChartMode = button.dataset.revenueChart;
        render();
      });
    });
    document.querySelectorAll("[data-gross-margin-chart]").forEach((button) => {
      button.addEventListener("click", () => {
        state.grossMarginChartMode = button.dataset.grossMarginChart;
        render();
      });
    });
  };

  render();
})();
