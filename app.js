const months = ["Jan", "Feb", "Mar", "Apr", "May"];

const baseMetrics = [
  {
    label: "Revenues",
    unit: "EURm",
    ytdActual: "10,000.0",
    ytdBudgetAbs: "0.0",
    ytdBudgetPct: "0.0%",
    ytdLyAbs: "+476.2",
    ytdLyPct: "+5.0%",
    mtdActual: "10,000.0",
    mtdBudgetAbs: "0.0",
    mtdBudgetPct: "0.0%",
    mtdLyAbs: "+476.2",
    mtdLyPct: "+5.0%",
  },
  {
    label: "Gross margin",
    unit: "EURm / % of revenues",
    ytdActual: "3,800.0",
    ytdBudgetAbs: "+50.0",
    ytdBudgetPct: "+1.3%",
    ytdLyAbs: "+81.9",
    ytdLyPct: "+2.2%",
    mtdActual: "3,800.0",
    mtdBudgetAbs: "+50.0",
    mtdBudgetPct: "+1.3%",
    mtdLyAbs: "+81.9",
    mtdLyPct: "+2.2%",
    subRows: [
      {
        label: "% of revenues",
        ytdActual: "38.0%",
        ytdBudgetAbs: "+0.5pp",
        ytdBudgetPct: "+0.5pp",
        ytdLyAbs: "+0.4pp",
        ytdLyPct: "+0.4pp",
        mtdActual: "38.0%",
        mtdBudgetAbs: "+0.5pp",
        mtdBudgetPct: "+0.5pp",
        mtdLyAbs: "+0.4pp",
        mtdLyPct: "+0.4pp",
      },
    ],
  },
  {
    label: "Adjusted EBITDA",
    unit: "EURm / % of revenues",
    ytdActual: "2,000.0",
    ytdBudgetAbs: "0.0",
    ytdBudgetPct: "0.0%",
    ytdLyAbs: "+39.2",
    ytdLyPct: "+2.0%",
    mtdActual: "2,000.0",
    mtdBudgetAbs: "0.0",
    mtdBudgetPct: "0.0%",
    mtdLyAbs: "+39.2",
    mtdLyPct: "+2.0%",
    subRows: [
      {
        label: "% of revenues",
        ytdActual: "20.0%",
        ytdBudgetAbs: "0.0pp",
        ytdBudgetPct: "0.0pp",
        ytdLyAbs: "-0.3pp",
        ytdLyPct: "-0.3pp",
        ytdLyGood: false,
        mtdActual: "20.0%",
        mtdBudgetAbs: "0.0pp",
        mtdBudgetPct: "0.0pp",
        mtdLyAbs: "-0.3pp",
        mtdLyPct: "-0.3pp",
        mtdLyGood: false,
      },
    ],
  },
  {
    label: "CAPEX",
    unit: "EURm",
    ytdActual: "10.0",
    ytdBudgetAbs: "-2.0",
    ytdBudgetPct: "-16.7%",
    ytdBudgetGood: true,
    ytdLyAbs: "-0.9",
    ytdLyPct: "-8.0%",
    ytdLyGood: true,
    mtdActual: "10.0",
    mtdBudgetAbs: "-2.0",
    mtdBudgetPct: "-16.7%",
    mtdBudgetGood: true,
    mtdLyAbs: "-0.9",
    mtdLyPct: "-8.0%",
    mtdLyGood: true,
  },
  {
    label: "OpCF (EBITDA less Capex)",
    unit: "EURm",
    ytdActual: "1,990.0",
    ytdBudgetAbs: "+2.0",
    ytdBudgetPct: "+0.1%",
    ytdLyAbs: "+41.0",
    ytdLyPct: "+2.1%",
    mtdActual: "1,990.0",
    mtdBudgetAbs: "+2.0",
    mtdBudgetPct: "+0.1%",
    mtdLyAbs: "+41.0",
    mtdLyPct: "+2.1%",
  },
  {
    label: "Debt",
    unit: "EURm",
    ytdActual: "20.0",
    ytdBudgetAbs: "-2.0",
    ytdBudgetPct: "-9.1%",
    ytdBudgetGood: true,
    ytdLyAbs: "-0.6",
    ytdLyPct: "-3.0%",
    ytdLyGood: true,
    mtdActual: "20.0",
    mtdBudgetAbs: "-2.0",
    mtdBudgetPct: "-9.1%",
    mtdBudgetGood: true,
    mtdLyAbs: "-0.6",
    mtdLyPct: "-3.0%",
    mtdLyGood: true,
  },
  {
    label: "Cash",
    unit: "EURm",
    ytdActual: "10.0",
    ytdBudgetAbs: "+1.0",
    ytdBudgetPct: "+11.1%",
    ytdLyAbs: "+0.4",
    ytdLyPct: "+4.0%",
    mtdActual: "10.0",
    mtdBudgetAbs: "+1.0",
    mtdBudgetPct: "+11.1%",
    mtdLyAbs: "+0.4",
    mtdLyPct: "+4.0%",
  },
  {
    label: "Net debt / LTM EBITDA",
    unit: "x",
    ytdActual: "0.0x",
    ytdBudgetAbs: "-0.1x",
    ytdBudgetPct: "-0.1x",
    ytdBudgetGood: true,
    ytdLyAbs: "-0.2x",
    ytdLyPct: "-0.2x",
    ytdLyGood: true,
    mtdActual: "0.0x",
    mtdBudgetAbs: "-0.1x",
    mtdBudgetPct: "-0.1x",
    mtdBudgetGood: true,
    mtdLyAbs: "-0.2x",
    mtdLyPct: "-0.2x",
    mtdLyGood: true,
  },
];

const companies = [
  {
    id: "company_a",
    name: "EUROMEDIA",
    logoText: "EUROMEDIA",
    sector: "books",
    ownership: "100%",
    status: "On track",
    currency: "EURm",
    fy: "2026",
    month: "May",
    revenue: 10000,
    revenueBudget: 10000,
    ebitda: 2000,
    ebitdaBudget: 2000,
    cash: 10,
    netDebt: 10,
    trend: [8200, 8800, 9300, 9700, 10000],
    comment:
      "Revenue and EBITDA are broadly in line with budget. Cash position remains stable, with no major working capital movement during the month.",
    metrics: baseMetrics,
  },
  {
    id: "company_b",
    name: "VIVANTIS",
    logoText: "VIVANTIS",
    sector: "cosmetics",
    ownership: "100%",
    status: "Critical",
    currency: "EURm",
    fy: "2026",
    month: "May",
    revenue: 5000,
    revenueBudget: 5600,
    ebitda: 600,
    ebitdaBudget: 850,
    cash: 6,
    netDebt: 25,
    trend: [4700, 4900, 5100, 5300, 5000],
    comment: "Placeholder data. Vivantis is included only to demonstrate company selection in the dashboard.",
    metrics: baseMetrics,
  },
];

const revenueMonths = [
  { month: "Jan", actual: 8200, budget: 8000, ly: 7700 },
  { month: "Feb", actual: 8800, budget: 8700, ly: 8350 },
  { month: "Mar", actual: 9300, budget: 9400, ly: 8850 },
  { month: "Apr", actual: 9700, budget: 9800, ly: 9250 },
  { month: "May", actual: 10000, budget: 10000, ly: 9524 },
];

const state = {
  view: "portfolio",
  selectedCompanyId: companies[0].id,
  period: "May 2026",
  detailMetric: null,
  detailMode: "YTD",
  revenueChartMode: "YTD",
  selectedMetric: "Revenues",
};

function selectedCompany() {
  return companies.find((company) => company.id === state.selectedCompanyId) || companies[0];
}

function formatMoney(value) {
  return `€${Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 })}m`;
}

function variancePct(actual, budget) {
  return ((actual / budget - 1) * 100).toFixed(1);
}

function classifyVariance(pct, good = true) {
  const numeric = Number(String(pct).replace("%", "").replace("+", "").replace("pp", "").replace("x", ""));
  if (!Number.isNaN(numeric) && Math.abs(numeric) < 0.05) return "flat";
  return good ? "good" : "bad";
}

function varianceBadge({ label = "", pct, abs = "", good = true }) {
  const variant = classifyVariance(pct, good);
  const symbol = variant === "flat" ? "–" : variant === "good" ? "▲" : "▼";

  return `
    <div class="badge ${variant}">
      ${label ? `<div class="badge-label">${label}</div>` : ""}
      <div class="badge-row">
        <span>${abs}</span>
        <span>${symbol} ${pct}</span>
      </div>
    </div>
  `;
}

function section({ title, kicker = "", right = "", dark = false, body = "" }) {
  return `
    <section class="section ${dark ? "dark" : ""}">
      <div class="section-head">
        <div>
          ${kicker ? `<div class="kicker">${kicker}</div>` : ""}
          <h2>${title}</h2>
        </div>
        ${right}
      </div>
      ${body}
    </section>
  `;
}

function companyHeader(company) {
  return `
    <section class="company-header">
      <div class="company-header-inner">
        <div>
          <div class="eyebrow">Company detail · ${company.month} ${company.fy}</div>
          <h1>${company.name}</h1>
          <div class="company-meta">
            <div><strong>Ownership:</strong> <span>${company.ownership}</span></div>
            <div><strong>FY:</strong> <span>${company.fy}</span></div>
            <div><strong>Month:</strong> <span>${company.month}</span></div>
            <div><strong>Reporting unit:</strong> <span>${company.currency}</span></div>
          </div>
        </div>
        <div class="logo-text">${company.logoText}</div>
      </div>
    </section>
  `;
}

function renderTopbar() {
  return `
    <header class="topbar">
      <div>
        <div class="eyebrow">AI-enabled reporting cockpit · Phase 1 MVP</div>
        <div class="topline"></div>
      </div>
      <div class="toolbar">
        <select class="select" id="period-select">
          <option ${state.period === "May 2026" ? "selected" : ""}>May 2026</option>
          <option ${state.period === "Apr 2026" ? "selected" : ""}>Apr 2026</option>
          <option ${state.period === "Mar 2026" ? "selected" : ""}>Mar 2026</option>
        </select>
        <button class="refresh">Refresh</button>
      </div>
    </header>
  `;
}

function renderNav() {
  const company = selectedCompany();

  return `
    <nav class="nav">
      <button class="nav-btn ${state.view === "portfolio" ? "active" : ""}" data-action="portfolio">Portfolio overview</button>
      <div class="company-switch ${state.view === "company" ? "active" : ""}">
        <button class="nav-btn ${state.view === "company" ? "active" : ""}" data-action="company">Company detail</button>
        <select class="company-select" id="company-select">
          ${companies.map((item) => `<option value="${item.id}" ${item.id === company.id ? "selected" : ""}>${item.name}</option>`).join("")}
        </select>
      </div>
    </nav>
  `;
}

function kpiCard({ title, value, subtitle, pct, good }) {
  return `
    <div class="kpi">
      <div class="kpi-label">${title}</div>
      <div class="kpi-value">${value}</div>
      <div class="kpi-sub">${subtitle}</div>
      ${varianceBadge({ pct, abs: "vs budget", good })}
    </div>
  `;
}

function renderPortfolioOverview() {
  const totals = companies.reduce(
    (acc, company) => {
      acc.revenue += company.revenue;
      acc.revenueBudget += company.revenueBudget;
      acc.ebitda += company.ebitda;
      acc.ebitdaBudget += company.ebitdaBudget;
      acc.cash += company.cash;
      acc.netDebt += company.netDebt;
      return acc;
    },
    { revenue: 0, revenueBudget: 0, ebitda: 0, ebitdaBudget: 0, cash: 0, netDebt: 0 }
  );

  const trend = months.map((_, index) => companies.reduce((sum, company) => sum + company.trend[index], 0));
  const maxTrend = Math.max(...trend);

  return `
    <div class="page-title">
      <div class="eyebrow">Portfolio overview</div>
      <h1>Monthly performance cockpit</h1>
      <p>Portfolio-level view across companies. Company tiles drill down into the detailed metric-by-metric performance view.</p>
    </div>

    <div class="grid-4">
      ${kpiCard({ title: "Portfolio revenue", value: formatMoney(totals.revenue), subtitle: "YTD actual", pct: `${variancePct(totals.revenue, totals.revenueBudget)}%`, good: totals.revenue >= totals.revenueBudget })}
      ${kpiCard({ title: "Portfolio EBITDA", value: formatMoney(totals.ebitda), subtitle: `${((totals.ebitda / totals.revenue) * 100).toFixed(1)}% margin`, pct: `${variancePct(totals.ebitda, totals.ebitdaBudget)}%`, good: totals.ebitda >= totals.ebitdaBudget })}
      ${kpiCard({ title: "Cash balance", value: formatMoney(totals.cash), subtitle: "Across reporting entities", pct: "+4.0%", good: true })}
      ${kpiCard({ title: "Net debt", value: formatMoney(totals.netDebt), subtitle: "Gross debt minus cash", pct: "-3.0%", good: true })}
    </div>

    ${section({
      title: "Company performance",
      kicker: "Company tiles",
      right: `<span class="eyebrow">Click to drill down</span>`,
      body: `<div class="grid-3">${companies.map(renderCompanyTile).join("")}</div>`,
    })}

    ${section({
      title: "Portfolio revenue trend",
      kicker: "Unit of measure: EURm",
      body: `
        <div class="chart-grid">
          ${months.map((month, index) => `
            <div class="chart-month">
              <div class="bars">
                <div class="bar-wrap" style="width: 100%;">
                  <div class="bar ${index === months.length - 1 ? "actual" : "ly"}" style="height: ${(trend[index] / maxTrend) * 100}%;"></div>
                </div>
              </div>
              <div class="month-label">
                <strong>${month}</strong>
                <span>€${trend[index].toFixed(0)}m</span>
              </div>
            </div>
          `).join("")}
        </div>
      `,
    })}
  `;
}

function renderCompanyTile(company) {
  const selected = company.id === state.selectedCompanyId;
  const revenueVariance = Number(variancePct(company.revenue, company.revenueBudget));
  const ebitdaVariance = Number(variancePct(company.ebitda, company.ebitdaBudget));

  return `
    <button class="company-tile ${selected ? "active" : ""}" data-company-tile="${company.id}">
      <div class="tile-top">
        <div>
          <div class="company-tile-title">${company.name}</div>
          <div class="company-tile-sector">${company.sector}</div>
        </div>
        <span class="status ${company.status === "Critical" ? "critical" : ""}">${company.status}</span>
      </div>
      <div class="tile-metrics">
        <div>
          <div class="small-label">Revenue</div>
          <div class="small-value">${formatMoney(company.revenue)}</div>
          <div class="${revenueVariance >= 0 ? "positive" : "negative"}">${revenueVariance}% vs budget</div>
        </div>
        <div>
          <div class="small-label">EBITDA</div>
          <div class="small-value">${formatMoney(company.ebitda)}</div>
          <div class="${ebitdaVariance >= 0 ? "positive" : "negative"}">${ebitdaVariance}% vs budget</div>
        </div>
      </div>
    </button>
  `;
}

function renderCompanyDetail() {
  const company = selectedCompany();

  if (state.detailMetric === "Revenues") return renderRevenueDetail(company);
  if (state.detailMetric === "Adjusted EBITDA") return renderEbitdaDetail(company);

  return `
    ${companyHeader(company)}
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

function renderMetricRow(metric) {
  return `
    <div class="metric-row">
      <div class="metric-name">
        <div class="metric-unit">${metric.unit}</div>
        <button class="metric-title-btn" data-open-detail="${metric.label}" data-mode="YTD">${metric.label}</button>
      </div>
      <div>
        <div class="small-label">YTD development</div>
        <div class="actual-label">Actual</div>
        <div class="actual-value">${metric.ytdActual}</div>
        ${varianceBadge({ label: "vs budget", pct: metric.ytdBudgetPct, abs: metric.ytdBudgetAbs, good: metric.ytdBudgetGood ?? true })}
        ${varianceBadge({ label: "vs LY", pct: metric.ytdLyPct, abs: metric.ytdLyAbs, good: metric.ytdLyGood ?? true })}
        <button class="detail-link" data-open-detail="${metric.label}" data-mode="YTD">Detail YTD</button>
      </div>
      <div>
        <div class="small-label">Month development</div>
        <div class="actual-label">Actual</div>
        <div class="actual-value">${metric.mtdActual}</div>
        ${varianceBadge({ label: "vs budget", pct: metric.mtdBudgetPct, abs: metric.mtdBudgetAbs, good: metric.mtdBudgetGood ?? true })}
        ${varianceBadge({ label: "vs LY", pct: metric.mtdLyPct, abs: metric.mtdLyAbs, good: metric.mtdLyGood ?? true })}
        <button class="detail-link" data-open-detail="${metric.label}" data-mode="MTD">Detail MTD</button>
      </div>
      ${metric.subRows ? `<div class="subrows">${metric.subRows.map(renderSubRow).join("")}</div>` : ""}
    </div>
  `;
}

function renderSubRow(row) {
  return `
    <div class="subrow">
      <div><strong>↳ ${row.label}</strong></div>
      <div>
        <strong>${row.ytdActual}</strong>
        ${varianceBadge({ label: "vs budget", pct: row.ytdBudgetPct, abs: row.ytdBudgetAbs, good: row.ytdBudgetGood ?? true })}
        ${varianceBadge({ label: "vs LY", pct: row.ytdLyPct, abs: row.ytdLyAbs, good: row.ytdLyGood ?? true })}
      </div>
      <div>
        <strong>${row.mtdActual}</strong>
        ${varianceBadge({ label: "vs budget", pct: row.mtdBudgetPct, abs: row.mtdBudgetAbs, good: row.mtdBudgetGood ?? true })}
        ${varianceBadge({ label: "vs LY", pct: row.mtdLyPct, abs: row.mtdLyAbs, good: row.mtdLyGood ?? true })}
      </div>
    </div>
  `;
}

function cumulativeRevenueMonths() {
  let actual = 0;
  let budget = 0;
  let ly = 0;

  return revenueMonths.map((row) => {
    actual += row.actual;
    budget += row.budget;
    ly += row.ly;
    return { month: row.month, actual, budget, ly };
  });
}

function renderRevenueDetail(company) {
  const rows = state.revenueChartMode === "YTD" ? cumulativeRevenueMonths() : revenueMonths;
  const maxValue = Math.max(...rows.flatMap((row) => [row.actual, row.budget, row.ly]));
  const breakdown = [
    { segment: "Retail / bookstores", actual: "4,250", share: "42.5%", budget: "+80", ly: "+4.0%", good: true },
    { segment: "Online", actual: "2,850", share: "28.5%", budget: "+120", ly: "+9.5%", good: true },
    { segment: "Wholesale / distribution", actual: "1,900", share: "19.0%", budget: "-130", ly: "-2.1%", good: false },
    { segment: "Other", actual: "1,000", share: "10.0%", budget: "-70", ly: "+1.3%", good: false },
  ];

  return `
    ${companyHeader(company)}
    <button class="back" data-back-detail>Back to financial indicators</button>
    ${section({
      title: "Revenue detail",
      kicker: `${company.name} · ${company.month} ${company.fy}`,
      right: `<span class="eyebrow">EURm</span>`,
      body: `
        <div class="summary-box">
          <div class="summary-title">Summary</div>
          <p>Revenue is broadly on budget YTD and above last year. The only visible weakness is wholesale / distribution, partly offset by stronger online trading.</p>
        </div>
      `,
    })}
    ${section({
      title: "Revenue development",
      kicker: state.revenueChartMode === "YTD" ? "Cumulative actual vs budget vs last year" : "Monthly actual vs budget vs last year",
      right: renderRevenueToggle(),
      body: `${renderRevenueBars(rows, maxValue)}${renderRevenueLegend()}`,
    })}
    ${section({
      title: "Revenue breakdown",
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

function renderRevenueToggle() {
  return `
    <div class="toggle">
      <button class="${state.revenueChartMode === "YTD" ? "active" : ""}" data-revenue-chart="YTD">YTD</button>
      <button class="${state.revenueChartMode === "Monthly" ? "active" : ""}" data-revenue-chart="Monthly">Monthly</button>
    </div>
  `;
}

function renderRevenueBars(rows, maxValue) {
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

function renderRevenueLegend() {
  return `
    <div class="legend">
      <span><span class="legend-mark" style="background: var(--black);"></span>Actual</span>
      <span><span class="legend-mark" style="background: #B7B3AA;"></span>Budget</span>
      <span><span class="legend-mark" style="background: #D1CEC7;"></span>Last year</span>
    </div>
  `;
}

function renderEbitdaDetail(company) {
  const overview = [
    { label: "YTD Adjusted EBITDA", actual: "2,000.0", budget: "0.0", ly: "+39.2", budgetGood: true, lyGood: true },
    { label: "YTD EBITDA margin", actual: "20.0%", budget: "0.0pp", ly: "-0.3pp", budgetGood: true, lyGood: false },
    { label: "Monthly Adjusted EBITDA", actual: "2,000.0", budget: "0.0", ly: "+39.2", budgetGood: true, lyGood: true },
    { label: "Monthly EBITDA margin", actual: "20.0%", budget: "0.0pp", ly: "-0.3pp", budgetGood: true, lyGood: false },
  ];
  const bridge = [
    { label: "Revenue effect", value: "+95", good: true },
    { label: "Gross margin effect", value: "+50", good: true },
    { label: "Personnel costs", value: "-65", good: false },
    { label: "Marketing / sales costs", value: "-35", good: false },
    { label: "Other OPEX", value: "-45", good: false },
    { label: "Adjusted EBITDA variance", value: "0", good: true },
  ];
  const breakdown = [
    { segment: "Retail / bookstores", actual: "820", margin: "19.3%", budget: "+20", ly: "+0.2pp", good: true },
    { segment: "Online", actual: "610", margin: "21.4%", budget: "+35", ly: "+0.6pp", good: true },
    { segment: "Wholesale / distribution", actual: "310", margin: "16.3%", budget: "-40", ly: "-0.7pp", good: false },
    { segment: "Other / central", actual: "260", margin: "26.0%", budget: "-15", ly: "-0.4pp", good: false },
  ];

  return `
    ${companyHeader(company)}
    <button class="back" data-back-detail>Back to financial indicators</button>
    ${section({
      title: "Adjusted EBITDA detail",
      kicker: `${company.name} · ${company.month} ${company.fy} · ${state.detailMode} focus`,
      right: `<span class="eyebrow">EURm / % of revenues</span>`,
      body: `
        <div class="summary-box">
          <div class="summary-title">Summary</div>
          <p>Adjusted EBITDA is broadly in line with budget in absolute terms, while EBITDA margin is slightly below last year. The next drill-down should separate gross margin impact from personnel costs, marketing costs and other OPEX.</p>
        </div>
      `,
    })}
    ${section({
      title: "Adjusted EBITDA overview",
      kicker: "Absolute EBITDA and EBITDA margin",
      body: `<div class="grid-4">${overview.map(renderEbitdaOverviewCard).join("")}</div>`,
    })}
    <div class="grid-2">
      ${section({
        title: "EBITDA variance bridge",
        kicker: "Indicative cost driver view",
        body: bridge.map((row) => `<div class="bridge-row ${row.good ? "good" : "bad"}"><span>${row.label}</span><span>${row.value}</span></div>`).join(""),
      })}
      ${section({
        title: "Adjusted EBITDA breakdown",
        kicker: "Segment / channel view",
        body: renderTable(
          ["Segment", "YTD Adj. EBITDA", "EBITDA margin", "vs budget", "vs LY"],
          breakdown.map((row) => [
            row.segment,
            row.actual,
            row.margin,
            varianceBadge({ pct: row.budget, abs: "", good: row.good }),
            varianceBadge({ pct: row.ly, abs: "", good: row.ly.startsWith("+") }),
          ])
        ),
      })}
    </div>
  `;
}

function renderEbitdaOverviewCard(item) {
  return `
    <div class="kpi">
      <div class="kpi-label">${item.label}</div>
      <div class="kpi-value">${item.actual}</div>
      ${varianceBadge({ label: "vs budget", pct: item.budget, abs: "", good: item.budgetGood })}
      ${varianceBadge({ label: "vs LY", pct: item.ly, abs: "", good: item.lyGood })}
    </div>
  `;
}

function renderTable(headers, rows) {
  return `
    <table>
      <thead>
        <tr>${headers.map((header, index) => `<th class="${index > 0 ? "right" : ""}">${header}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${rows.map((row) => `<tr>${row.map((cell, index) => `<td class="${index > 0 ? "right" : ""}">${cell}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>
  `;
}

function renderFooter() {
  return `
    <footer class="footer">
      <div>
        <div>NOTE: Illustrative mockup based on standardized monthly portfolio reporting data.</div>
        <div>SOURCE: Portfolio company management reporting, budget and forecast files.</div>
      </div>
      <div class="rockaway-logo">
        <div style="letter-spacing: .42em;">rockaway</div>
        <div style="margin-top: 4px; font-weight: 900; letter-spacing: .2em;">ALPHA</div>
      </div>
    </footer>
  `;
}

function render() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="app">
      <div class="shell">
        ${renderTopbar()}
        ${renderNav()}
        ${state.view === "portfolio" ? renderPortfolioOverview() : renderCompanyDetail()}
        ${renderFooter()}
      </div>
    </div>
  `;
  bindEvents();
}

function bindEvents() {
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
      state.detailMetric = metric === "Revenues" || metric === "Adjusted EBITDA" ? metric : null;
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
}

render();
