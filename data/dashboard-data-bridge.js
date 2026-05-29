/*
  Dashboard data bridge.
  Loads anonymized EMG reporting data into the existing dashboard shape.
  This file is loaded last and overrides only rendering/data helpers needed for the data-import-v1 branch.
  No values in the source dataset represent actual company performance.
*/
(function () {
  if (!window.ReportingAdapter || !window.ReportingDataExample || typeof companies === "undefined") return;

  const adapter = window.ReportingAdapter;
  const latestPeriod = adapter.getLatestPeriod("EMG");
  const sourceCompany = adapter.getCompany("EMG");
  const snapshot = adapter.getDashboardSnapshot("EMG", latestPeriod);
  if (!latestPeriod || !sourceCompany || !snapshot) return;

  const [latestYear, latestMonthNumber] = latestPeriod.split("-").map(Number);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const latestMonthName = monthNames[latestMonthNumber - 1];

  const metricMap = {
    "Revenues": "consolidated_revenues",
    "Gross margin": "gross_margin",
    "Gross margin %": "gross_margin_pct",
    "Adjusted EBITDA": "adjusted_ebitda",
    "Adjusted EBITDA %": "adjusted_ebitda_pct",
    "CAPEX": "capex",
    "OpCF (EBITDA less Capex)": "opcf",
    "Debt": "debt",
    "Cash": "cash",
    "Net debt / LTM EBITDA": "net_debt_ltm_ebitda",
  };

  const flow = ["Revenues", "Gross margin", "Adjusted EBITDA", "OpCF (EBITDA less Capex)"];
  const balanceFlow = ["Debt", "Cash", "Net debt / LTM EBITDA"];

  if (!state.dataChartModes) state.dataChartModes = {};
  Object.keys(metricMap).forEach((label) => {
    if (!state.dataChartModes[label]) state.dataChartModes[label] = "YTD";
  });

  const previousBindEvents = bindEvents;

  applyCompanyData();
  renderCompanyDetail = renderDataCompanyDetail;
  bindEvents = bindDataEvents;
  render();

  function applyCompanyData() {
    const companyA = companies.find((item) => item.id === "company_a") || companies[0];
    if (!companyA) return null;

    companyA.name = sourceCompany.display_name || "Euromedia";
    companyA.logoText = "EUROMEDIA";
    companyA.sector = "Books / Media";
    companyA.month = latestMonthName;
    companyA.fy = String(latestYear);
    companyA.currency = "CZKm";

    const revenue = record("consolidated_revenues");
    const ebitda = record("adjusted_ebitda");
    const debt = record("debt");
    const cash = record("cash");

    companyA.revenue = revenue?.actual_ytd ?? companyA.revenue;
    companyA.revenueBudget = revenue?.budget_ytd ?? companyA.revenueBudget;
    companyA.ebitda = ebitda?.actual_ytd ?? companyA.ebitda;
    companyA.ebitdaBudget = ebitda?.budget_ytd ?? companyA.ebitdaBudget;
    companyA.cash = cash?.actual_ytd ?? companyA.cash;
    companyA.netDebt = debt && cash ? debt.actual_ytd - cash.actual_ytd : companyA.netDebt;

    companyA.metrics = [
      createMetric("Revenues", record("consolidated_revenues")),
      {
        ...createMetric("Gross margin", record("gross_margin")),
        unit: "CZKm / % of revenues",
        subRows: [createPercentSubMetric("% of revenues", record("gross_margin_pct"))],
      },
      {
        ...createMetric("Adjusted EBITDA", record("adjusted_ebitda")),
        unit: "CZKm / % of revenues",
        subRows: [createPercentSubMetric("% of revenues", record("adjusted_ebitda_pct"))],
      },
      createMetric("CAPEX", record("capex")),
      createMetric("OpCF (EBITDA less Capex)", record("opcf")),
      createMetric("Debt", record("debt")),
      createMetric("Cash", record("cash")),
      createMetric("Net debt / LTM EBITDA", record("net_debt_ltm_ebitda")),
    ].filter(Boolean);

    if (typeof state !== "undefined") state.period = `${latestMonthName} ${latestYear}`;
    return companyA;
  }

  function renderDataCompanyDetail() {
    const company = applyCompanyData() || selectedCompany();
    if (state.detailMetric) return renderDataMetricDetail(company, state.detailMetric);

    const operatingMetrics = company.metrics.filter((metric) => ["Revenues", "Gross margin", "Adjusted EBITDA", "CAPEX", "OpCF (EBITDA less Capex)"].includes(metric.label));
    const balanceMetrics = company.metrics.filter((metric) => ["Debt", "Cash", "Net debt / LTM EBITDA"].includes(metric.label));

    return `
      ${companyHeader(company)}
      ${renderRevenueToOpCFBridge(company)}
      ${renderMetricSection("Operating financial indicators", "YTD and MTD performance by operating metric", operatingMetrics)}
      ${renderBalanceBridge(company)}
      ${renderMetricSection("Balance sheet / leverage indicators", "Debt, cash and leverage position", balanceMetrics)}
    `;
  }

  function renderDataMetricDetail(company, label) {
    const metricId = metricMap[label];
    if (!metricId) return renderDataCompanyDetail();

    const metricRecord = record(metricId);
    const isBalance = balanceFlow.includes(label);
    const mode = isBalance ? "YTD" : state.dataChartModes[label] || state.revenueChartMode || "YTD";
    const rows = getChartRows(metricId, mode, isBalance);
    const maxValue = Math.max(...rows.flatMap((row) => [row.actual, row.budget, row.ly, 0.0001]));
    const nav = renderDataDetailNav(label, isBalance ? balanceFlow : flow);

    return `
      ${companyHeader(company)}
      <button class="back" data-back-detail>Back to financial indicators</button>
      ${nav}
      ${section({
        title: detailTitle(label),
        kicker: `${company.name} · ${company.month} ${company.fy}`,
        right: `<span class="eyebrow">${unitLabel(metricRecord)}</span>`,
        body: `<div class="summary-box"><div class="summary-title">Summary</div><p>${summaryText(label, metricRecord)}</p></div>`,
      })}
      ${section({
        title: `${shortLabel(label)} development`,
        kicker: isBalance ? "Position actual vs budget vs last year" : mode === "YTD" ? "Cumulative actual vs budget vs last year" : "Monthly actual vs budget vs last year",
        right: isBalance ? "" : renderDataToggle(label, mode),
        body: `${renderDataBars(rows, maxValue, metricRecord?.lower_is_better)}${renderStandardLegend()}`,
      })}
      ${renderOptionalPercentSection(label, mode)}
      ${renderOptionalBreakdown(label)}
    `;
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

  function renderRevenueToOpCFBridge(company) {
    const values = {
      actual: {
        label: "Actual",
        values: {
          Revenue: record("consolidated_revenues")?.actual_ytd || 0,
          "Gross Margin": record("gross_margin")?.actual_ytd || 0,
          "Adj. EBITDA": record("adjusted_ebitda")?.actual_ytd || 0,
          OpCF: record("opcf")?.actual_ytd || 0,
        },
      },
      budget: {
        label: "Budget",
        values: {
          Revenue: record("consolidated_revenues")?.budget_ytd || 0,
          "Gross Margin": record("gross_margin")?.budget_ytd || 0,
          "Adj. EBITDA": record("adjusted_ebitda")?.budget_ytd || 0,
          OpCF: record("opcf")?.budget_ytd || 0,
        },
      },
      ly: {
        label: "Last year",
        values: {
          Revenue: record("consolidated_revenues")?.last_year_ytd || 0,
          "Gross Margin": record("gross_margin")?.last_year_ytd || 0,
          "Adj. EBITDA": record("adjusted_ebitda")?.last_year_ytd || 0,
          OpCF: record("opcf")?.last_year_ytd || 0,
        },
      },
    };

    return section({
      title: "Revenue to OpCF bridge",
      kicker: `YTD snapshot as of ${company.month}`,
      right: `<span class="eyebrow">CZKm</span>`,
      body: `${renderCompactBridge(values, ["Revenue", "Gross Margin", "Adj. EBITDA", "OpCF"], {
        Revenue: "#000000",
        "Gross Margin": "#8D8982",
        "Adj. EBITDA": "#C7C4BD",
        OpCF: "#06DB49",
      }, {
        Revenue: "Revenues",
        "Gross Margin": "Gross margin",
        "Adj. EBITDA": "Adjusted EBITDA",
        OpCF: "OpCF (EBITDA less Capex)",
      })}`,
    });
  }

  function renderBalanceBridge(company) {
    const debt = record("debt");
    const cash = record("cash");
    const leverage = record("net_debt_ltm_ebitda");
    const values = {
      actual: { label: "Actual", values: { Debt: debt?.actual_ytd || 0, Cash: cash?.actual_ytd || 0, "Net Debt": (debt?.actual_ytd || 0) - (cash?.actual_ytd || 0) }, leverage: leverage?.actual_ytd || 0 },
      budget: { label: "Budget", values: { Debt: debt?.budget_ytd || 0, Cash: cash?.budget_ytd || 0, "Net Debt": (debt?.budget_ytd || 0) - (cash?.budget_ytd || 0) }, leverage: leverage?.budget_ytd || 0 },
      ly: { label: "Last year", values: { Debt: debt?.last_year_ytd || 0, Cash: cash?.last_year_ytd || 0, "Net Debt": (debt?.last_year_ytd || 0) - (cash?.last_year_ytd || 0) }, leverage: leverage?.last_year_ytd || 0 },
    };

    return section({
      title: "Debt / Cash / Net Debt bridge",
      kicker: `Balance sheet snapshot as of ${company.month}`,
      right: `<span class="eyebrow">CZKm / x</span>`,
      body: `${renderCompactBridge(values, ["Debt", "Cash", "Net Debt"], {
        Debt: "#000000",
        Cash: "#06DB49",
        "Net Debt": "#8D8982",
      }, {}, true)}`,
    });
  }

  function renderCompactBridge(data, order, colors, detailMap, includeLeverage) {
    const scenarios = ["actual", "budget", "ly"];
    const max = Math.max(...scenarios.flatMap((scenario) => order.map((metric) => data[scenario].values[metric])), 1);
    return `
      <div class="compact-bridge-chart ${includeLeverage ? "balance-bridge-chart with-leverage-overlay" : ""}">
        ${scenarios.map((scenario) => `
          <div class="compact-scenario-group ${scenario}">
            <div class="compact-bars">
              ${order.map((metric) => {
                const height = Math.max(data[scenario].values[metric] > 0 ? 5 : 0, (data[scenario].values[metric] / max) * 100);
                const target = detailMap[metric];
                const bar = `<div class="compact-bar" style="height:${height}%; background:${colors[metric]};"></div>`;
                return target ? `<button class="compact-bar-slot" data-open-detail="${target}" data-mode="YTD">${bar}</button>` : `<div class="compact-bar-slot non-clickable">${bar}</div>`;
              }).join("")}
            </div>
            <div class="compact-scenario-label">${data[scenario].label}</div>
            <div class="compact-values-row">${order.map((metric) => `<span>${formatNumber(data[scenario].values[metric], "CZKm")}</span>`).join("")}</div>
          </div>
        `).join("")}
        ${includeLeverage ? renderLeverageOverlay(data) : ""}
      </div>
      <div class="legend compact-bridge-legend">
        ${order.map((metric) => `<span><span class="legend-mark" style="background:${colors[metric]};"></span>${metric}</span>`).join("")}
        ${includeLeverage ? `<button class="legend-link" data-open-detail="Net debt / LTM EBITDA" data-mode="YTD"><span class="legend-dot"></span>Net Debt / EBITDA</button>` : ""}
      </div>
    `;
  }

  function renderLeverageOverlay(data) {
    const max = Math.max(data.actual.leverage, data.budget.leverage, data.ly.leverage, 1);
    const axisMax = Math.ceil(max * 10) / 10;
    return `
      <div class="leverage-right-axis"><span>${axisMax.toFixed(1)}x</span><span>${(axisMax / 2).toFixed(1)}x</span><span>0.0x</span></div>
      <div class="leverage-overlay">
        ${["actual", "budget", "ly"].map((scenario) => {
          const value = data[scenario].leverage;
          const top = 100 - Math.max(0, Math.min(1, value / axisMax)) * 100;
          return `<button class="leverage-point ${scenario}" style="top:${top}%;" data-open-detail="Net debt / LTM EBITDA" data-mode="YTD"><span class="leverage-dot"></span><span class="leverage-value">${value.toFixed(1)}x</span></button>`;
        }).join("")}
      </div>
    `;
  }

  function renderDataBars(rows, maxValue, lowerIsBetter) {
    return `
      <div class="chart-grid">
        ${rows.map((row) => {
          const budgetGood = lowerIsBetter ? row.actual <= row.budget : row.actual >= row.budget;
          const lyGood = lowerIsBetter ? row.actual <= row.ly : row.actual >= row.ly;
          return `
            <div class="chart-month">
              <div class="bars">
                <div class="bar-wrap"><div class="bar actual" style="height:${(row.actual / maxValue) * 100}%;"></div></div>
                <div class="bar-wrap"><div class="bar budget" style="height:${(row.budget / maxValue) * 100}%;"></div></div>
                <div class="bar-wrap"><div class="bar ly" style="height:${(row.ly / maxValue) * 100}%;"></div></div>
              </div>
              <div class="month-label"><strong>${row.month}</strong><span>${formatNumber(row.actual, row.unit)}</span></div>
              <div class="mini-variance">
                <div class="mini-badge ${budgetGood ? "good" : "bad"}">BUD<br>${formatVariance(row.actual, row.budget, row.unit)}</div>
                <div class="mini-badge ${lyGood ? "good" : "bad"}">LY<br>${formatVariance(row.actual, row.ly, row.unit)}</div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderDataToggle(label, mode) {
    return `
      <div class="toggle">
        <button class="${mode === "YTD" ? "active" : ""}" data-data-chart="${label}" data-data-mode="YTD">YTD</button>
        <button class="${mode === "Monthly" ? "active" : ""}" data-data-chart="${label}" data-data-mode="Monthly">Monthly</button>
      </div>
    `;
  }

  function renderDataDetailNav(label, navFlow) {
    const index = navFlow.indexOf(label);
    if (index < 0) return "";
    const prev = navFlow[index - 1];
    const next = navFlow[index + 1];
    return `
      <div class="detail-page-nav">
        <div>${prev ? `<button class="detail-nav-link" data-open-detail="${prev}" data-mode="YTD">← ${shortLabel(prev)}</button>` : ""}</div>
        <div>${next ? `<button class="detail-nav-link" data-open-detail="${next}" data-mode="YTD">${shortLabel(next)} →</button>` : ""}</div>
      </div>
    `;
  }

  function renderOptionalPercentSection(label, mode) {
    const percentMetric = label === "Gross margin" ? "gross_margin_pct" : label === "Adjusted EBITDA" ? "adjusted_ebitda_pct" : null;
    if (!percentMetric) return "";
    const rows = getChartRows(percentMetric, mode, false).map((row) => ({ ...row, actual: row.actual * 100, budget: row.budget * 100, ly: row.ly * 100 }));
    return section({
      title: `${shortLabel(label)} % of revenues`,
      kicker: mode === "YTD" ? "Cumulative percentage of revenues" : "Monthly percentage of revenues",
      right: `<span class="eyebrow">Actual vs budget vs last year</span>`,
      body: renderPercentLine(rows),
    });
  }

  function renderPercentLine(rows) {
    const width = 1000;
    const height = 280;
    const top = 38;
    const bottom = 62;
    const values = rows.flatMap((row) => [row.actual, row.budget, row.ly]);
    const min = Math.floor((Math.min(...values) - 1) * 2) / 2;
    const max = Math.ceil((Math.max(...values) + 1) * 2) / 2;
    const x = (index) => width * ((index + 0.5) / rows.length);
    const y = (value) => top + ((max - value) / (max - min || 1)) * (height - top - bottom);
    const series = [
      { key: "actual", label: "Actual", color: "#000000", stroke: 5 },
      { key: "budget", label: "Budget", color: "#B7B3AA", stroke: 4 },
      { key: "ly", label: "Last year", color: "#D1CEC7", stroke: 4, dash: "7 7" },
    ];

    return `
      <div class="line-chart-wrap">
        <svg viewBox="0 0 ${width} ${height}" width="100%" height="280">
          <rect x="0" y="0" width="${width}" height="${height}" fill="white"></rect>
          ${[max, (max + min) / 2, min].map((tick) => `<line x1="96" y1="${y(tick)}" x2="960" y2="${y(tick)}" stroke="#D8D6D0"/><text x="80" y="${y(tick) + 4}" text-anchor="end" font-size="19" fill="#817C75">${tick.toFixed(1)}%</text>`).join("")}
          ${rows.map((row, index) => `<line x1="${x(index)}" y1="${top}" x2="${x(index)}" y2="${height - bottom + 10}" stroke="#E6E5E1"/><text x="${x(index)}" y="${height - 16}" text-anchor="middle" font-size="22" font-weight="800" fill="#817C75">${row.month}</text>`).join("")}
          ${series.map((serie) => `<polyline points="${rows.map((row, index) => `${x(index)},${y(row[serie.key])}`).join(" ")}" fill="none" stroke="${serie.color}" stroke-width="${serie.stroke}" stroke-linejoin="round" stroke-linecap="round" ${serie.dash ? `stroke-dasharray="${serie.dash}"` : ""}/>`).join("")}
          ${series.flatMap((serie) => rows.map((row, index) => `<circle cx="${x(index)}" cy="${y(row[serie.key])}" r="${serie.key === "actual" ? 8 : 6}" fill="${serie.color}"/>`)).join("")}
          ${rows.map((row, index) => `<text x="${x(index)}" y="${y(row.actual) - 15}" text-anchor="middle" font-size="18" font-weight="800">${row.actual.toFixed(1)}%</text>`).join("")}
        </svg>
      </div>
      <div class="legend">
        ${series.map((serie) => `<span><span class="legend-mark" style="background:${serie.color};"></span>${serie.label}</span>`).join("")}
      </div>
    `;
  }

  function renderOptionalBreakdown(label) {
    if (label === "Revenues") return renderRevenueBreakdown();
    if (label === "Debt") return renderSingleMetricBreakdown("Debt breakdown", "Composition view", "Debt", record("debt"));
    if (label === "Net debt / LTM EBITDA") return renderLeverageBreakdown();
    return "";
  }

  function renderRevenueBreakdown() {
    const revenue = record("consolidated_revenues");
    const rows = snapshot.revenueBreakdown.map((item) => {
      const share = revenue?.actual_ytd ? item.actual_ytd / revenue.actual_ytd : 0;
      return [
        item.metric_label,
        formatNumber(item.actual_ytd, item.unit),
        formatNumber(share, "%"),
        varianceBadge({ pct: formatDelta(item.actual_ytd - item.budget_ytd, item.unit), abs: "", good: item.actual_ytd >= item.budget_ytd }),
        varianceBadge({ pct: formatVariance(item.actual_ytd, item.last_year_ytd, item.unit), abs: "", good: item.actual_ytd >= item.last_year_ytd }),
      ];
    });
    return section({ title: "Revenue breakdown", kicker: "Segment / channel view", body: renderTable(["Segment", "YTD actual", "Share", "vs budget", "vs LY"], rows) });
  }

  function renderSingleMetricBreakdown(title, kicker, metricLabel, metricRecord) {
    if (!metricRecord) return "";
    return section({
      title,
      kicker,
      body: renderTable(["Component", "Actual", "Budget", "Last year"], [[
        metricLabel,
        formatNumber(metricRecord.actual_ytd, metricRecord.unit),
        formatNumber(metricRecord.budget_ytd, metricRecord.unit),
        formatNumber(metricRecord.last_year_ytd, metricRecord.unit),
      ]]),
    });
  }

  function renderLeverageBreakdown() {
    const debt = record("debt");
    const cash = record("cash");
    const leverage = record("net_debt_ltm_ebitda");
    if (!debt || !cash || !leverage) return "";
    const actualNetDebt = debt.actual_ytd - cash.actual_ytd;
    const budgetNetDebt = debt.budget_ytd - cash.budget_ytd;
    const lyNetDebt = debt.last_year_ytd - cash.last_year_ytd;
    return section({
      title: "Net debt / LTM EBITDA breakdown",
      kicker: "Bridge from debt and cash to leverage",
      body: renderTable(["Component", "Actual", "Budget", "Last year"], [
        ["Debt", formatNumber(debt.actual_ytd, debt.unit), formatNumber(debt.budget_ytd, debt.unit), formatNumber(debt.last_year_ytd, debt.unit)],
        ["Cash", formatNumber(cash.actual_ytd, cash.unit), formatNumber(cash.budget_ytd, cash.unit), formatNumber(cash.last_year_ytd, cash.unit)],
        ["Net debt", formatNumber(actualNetDebt, "CZKm"), formatNumber(budgetNetDebt, "CZKm"), formatNumber(lyNetDebt, "CZKm")],
        ["Net debt / LTM EBITDA", formatNumber(leverage.actual_ytd, "x"), formatNumber(leverage.budget_ytd, "x"), formatNumber(leverage.last_year_ytd, "x")],
      ]),
    });
  }

  function bindDataEvents() {
    previousBindEvents();

    document.querySelectorAll("[data-data-chart]").forEach((button) => {
      button.addEventListener("click", () => {
        state.dataChartModes[button.dataset.dataChart] = button.dataset.dataMode;
        if (button.dataset.dataChart === "Revenues") state.revenueChartMode = button.dataset.dataMode;
        render();
      });
    });
  }

  function getChartRows(metricId, mode, isBalance) {
    return adapter
      .getSeries("EMG", metricId)
      .filter((row) => row.fiscal_year === latestYear && row.period <= latestPeriod)
      .map((row) => ({
        month: row.month,
        unit: adapter.getMetricRecord("EMG", row.period, metricId)?.unit || "CZKm",
        actual: isBalance || mode === "YTD" ? row.actual_ytd : row.actual_month,
        budget: isBalance || mode === "YTD" ? row.budget_ytd : row.budget_month,
        ly: isBalance || mode === "YTD" ? row.last_year_ytd : row.last_year_month,
      }));
  }

  function record(metricId) {
    return snapshot.metrics[metricId] || adapter.getMetricRecord("EMG", latestPeriod, metricId);
  }

  function createMetric(label, metricRecord) {
    if (!metricRecord) return null;
    return {
      label,
      unit: unitLabel(metricRecord),
      ytdActual: formatNumber(metricRecord.actual_ytd, metricRecord.unit),
      ytdBudgetAbs: formatDelta(metricRecord.actual_ytd - metricRecord.budget_ytd, metricRecord.unit),
      ytdBudgetPct: formatVariance(metricRecord.actual_ytd, metricRecord.budget_ytd, metricRecord.unit),
      ytdBudgetGood: metricRecord.budget_variance_ytd.good,
      ytdLyAbs: formatDelta(metricRecord.actual_ytd - metricRecord.last_year_ytd, metricRecord.unit),
      ytdLyPct: formatVariance(metricRecord.actual_ytd, metricRecord.last_year_ytd, metricRecord.unit),
      ytdLyGood: metricRecord.last_year_variance_ytd.good,
      mtdActual: formatNumber(metricRecord.actual_month, metricRecord.unit),
      mtdBudgetAbs: formatDelta(metricRecord.actual_month - metricRecord.budget_month, metricRecord.unit),
      mtdBudgetPct: formatVariance(metricRecord.actual_month, metricRecord.budget_month, metricRecord.unit),
      mtdBudgetGood: metricRecord.budget_variance_month.good,
      mtdLyAbs: formatDelta(metricRecord.actual_month - metricRecord.last_year_month, metricRecord.unit),
      mtdLyPct: formatVariance(metricRecord.actual_month, metricRecord.last_year_month, metricRecord.unit),
      mtdLyGood: metricRecord.last_year_variance_month.good,
    };
  }

  function createPercentSubMetric(label, metricRecord) {
    if (!metricRecord) return null;
    return {
      label,
      ytdActual: formatNumber(metricRecord.actual_ytd, "%"),
      ytdBudgetAbs: formatDelta(metricRecord.actual_ytd - metricRecord.budget_ytd, "%"),
      ytdBudgetPct: formatDelta(metricRecord.actual_ytd - metricRecord.budget_ytd, "%"),
      ytdBudgetGood: metricRecord.budget_variance_ytd.good,
      ytdLyAbs: formatDelta(metricRecord.actual_ytd - metricRecord.last_year_ytd, "%"),
      ytdLyPct: formatDelta(metricRecord.actual_ytd - metricRecord.last_year_ytd, "%"),
      ytdLyGood: metricRecord.last_year_variance_ytd.good,
      mtdActual: formatNumber(metricRecord.actual_month, "%"),
      mtdBudgetAbs: formatDelta(metricRecord.actual_month - metricRecord.budget_month, "%"),
      mtdBudgetPct: formatDelta(metricRecord.actual_month - metricRecord.budget_month, "%"),
      mtdBudgetGood: metricRecord.budget_variance_month.good,
      mtdLyAbs: formatDelta(metricRecord.actual_month - metricRecord.last_year_month, "%"),
      mtdLyPct: formatDelta(metricRecord.actual_month - metricRecord.last_year_month, "%"),
      mtdLyGood: metricRecord.last_year_variance_month.good,
    };
  }

  function unitLabel(metricRecord) {
    if (!metricRecord) return "";
    if (metricRecord.unit === "CZKm") return "CZKm";
    if (metricRecord.unit === "%") return "%";
    if (metricRecord.unit === "x") return "x";
    return metricRecord.unit;
  }

  function formatNumber(value, unit) {
    if (unit === "%") return `${(value * 100).toFixed(1)}%`;
    if (unit === "x") return `${value.toFixed(1)}x`;
    if (unit === "count") return Math.round(value).toLocaleString();
    return Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 });
  }

  function formatDelta(value, unit) {
    const prefix = value >= 0 ? "+" : "";
    if (unit === "%") return `${prefix}${(value * 100).toFixed(1)}pp`;
    if (unit === "x") return `${prefix}${value.toFixed(1)}x`;
    if (unit === "count") return `${prefix}${Math.round(value).toLocaleString()}`;
    return `${prefix}${Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 })}`;
  }

  function formatVariance(actual, compare, unit) {
    if (unit === "%" || unit === "x") return formatDelta(actual - compare, unit);
    if (!compare) return "0.0%";
    const value = actual / compare - 1;
    const prefix = value >= 0 ? "+" : "";
    return `${prefix}${(value * 100).toFixed(1)}%`;
  }

  function shortLabel(label) {
    if (label === "Revenues") return "Revenue";
    if (label === "Gross margin") return "Gross Margin";
    if (label === "OpCF (EBITDA less Capex)") return "OpCF";
    if (label === "Net debt / LTM EBITDA") return "Net debt / EBITDA";
    return label;
  }

  function detailTitle(label) {
    return `${shortLabel(label)} detail`;
  }

  function summaryText(label, metricRecord) {
    const actual = metricRecord ? formatNumber(metricRecord.actual_ytd, metricRecord.unit) : "n/a";
    const budget = metricRecord ? formatNumber(metricRecord.budget_ytd, metricRecord.unit) : "n/a";
    const ly = metricRecord ? formatNumber(metricRecord.last_year_ytd, metricRecord.unit) : "n/a";
    return `${shortLabel(label)} is loaded from the anonymized EMG reporting dataset for ${latestMonthName} ${latestYear}. Current YTD actual is ${actual}, compared with budget ${budget} and last year ${ly}.`;
  }
})();
