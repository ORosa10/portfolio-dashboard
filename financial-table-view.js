/* Financial table view for all operating metrics. */
(function () {
  if (!window.RevenueData || !window.OperatingMetricData) return;

  const TABLE_VIEW_KEY = "__financial_table__";
  const metricConfig = [
    { id: "revenues", label: "Revenues", type: "absolute" },
    { id: "gross_margin", label: "Gross Margin", type: "absolute" },
    { id: "gross_margin_margin", label: "Gross Margin %", type: "margin", numerator: "gross_margin" },
    { id: "adjusted_ebitda", label: "Adjusted EBITDA", type: "absolute" },
    { id: "adjusted_ebitda_margin", label: "EBITDA %", type: "margin", numerator: "adjusted_ebitda" },
    { id: "capex", label: "CAPEX", type: "absolute" },
    { id: "opcf", label: "OpCF", type: "absolute" },
    { id: "opcf_margin", label: "OpCF %", type: "margin", numerator: "opcf" },
  ];

  if (!state.financialTableMode) state.financialTableMode = "YTD";

  const previousRenderCompanyDetail = renderCompanyDetail;
  const previousRender = render;

  renderCompanyDetail = function () {
    if (state.detailMetric === TABLE_VIEW_KEY) return renderFinancialTableView(selectedCompany());
    return previousRenderCompanyDetail();
  };

  render = function () {
    previousRender();
    addFinancialTableLink();
  };

  document.addEventListener("click", function (event) {
    const openButton = event.target.closest("[data-open-financial-table]");
    if (openButton) {
      event.preventDefault();
      event.stopPropagation();
      state.detailMetric = TABLE_VIEW_KEY;
      state.selectedMetric = "Financial table";
      render();
      window.scrollTo(0, 0);
      return;
    }

    const tableToggle = event.target.closest("[data-financial-table-mode]");
    if (tableToggle) {
      event.preventDefault();
      event.stopPropagation();
      state.financialTableMode = tableToggle.dataset.financialTableMode;
      render();
    }
  }, true);

  addFinancialTableLink();

  function addFinancialTableLink() {
    if (state.detailMetric) return;
    if (document.querySelector("[data-open-financial-table]")) return;

    const sections = [...document.querySelectorAll("section.section")];
    const operatingSection = sections.find((section) => section.querySelector("h2")?.textContent.trim() === "Operating financial indicators");
    if (!operatingSection) return;

    const sectionHead = operatingSection.querySelector(".section-head");
    if (!sectionHead) return;

    let right = sectionHead.querySelector(".section-head > div:last-child");
    if (!right || right === sectionHead.firstElementChild) {
      right = document.createElement("div");
      sectionHead.appendChild(right);
    }

    right.insertAdjacentHTML("beforeend", `
      <button class="table-view-link" data-open-financial-table>Table view</button>
    `);
  }

  function renderFinancialTableView(company) {
    const mode = state.financialTableMode || "YTD";
    const reporting = getReportingRecord();
    const year = reporting.year;
    const monthNumber = Number(reporting.period.slice(5, 7));
    const periods = revenueRows(year, monthNumber);

    return `
      ${companyHeader(company)}
      <button class="back" data-back-detail>Back to financial indicators</button>
      ${section({
        title: "Financial indicators table",
        kicker: mode === "YTD" ? `Cumulative table as of ${company.month}` : `Monthly table as of ${company.month}`,
        right: renderTableToggle(mode),
        body: `
          <div class="financial-table-scroll">
            <table class="financial-table-view">
              <thead>
                <tr>
                  <th class="sticky-col">Metric</th>
                  <th>Scenario</th>
                  ${periods.map((period) => `<th>${period.month}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${metricConfig.map((metric) => renderMetricBlock(metric, periods, mode)).join("")}
              </tbody>
            </table>
          </div>
        `,
      })}
    `;
  }

  function renderTableToggle(mode) {
    return `
      <div class="toggle">
        <button class="${mode === "YTD" ? "active" : ""}" data-financial-table-mode="YTD">YTD</button>
        <button class="${mode === "Monthly" ? "active" : ""}" data-financial-table-mode="Monthly">Monthly</button>
      </div>
    `;
  }

  function renderMetricBlock(metric, periods, mode) {
    const scenarios = ["actual", "budget", "ly"];
    return scenarios.map((scenario, scenarioIndex) => `
      <tr class="${scenarioIndex === 0 ? "metric-start" : ""}">
        <td class="sticky-col metric-cell">${scenarioIndex === 0 ? metric.label : ""}</td>
        <td class="scenario-cell">${scenarioLabel(scenario)}</td>
        ${periods.map((period) => `<td>${formatValue(valueFor(metric, period, scenario, mode), metric.type)}</td>`).join("")}
      </tr>
    `).join("");
  }

  function valueFor(metric, period, scenario, mode) {
    if (metric.type === "margin") return marginValue(metric.numerator, period, scenario, mode);
    return absoluteValue(metric.id, period, scenario, mode);
  }

  function absoluteValue(metricId, period, scenario, mode) {
    const rows = sourceRows(metricId, period.year, Number(period.period.slice(5, 7)));
    if (mode === "Monthly") {
      const row = rows[rows.length - 1];
      return row ? row[scenario] : null;
    }
    return rows.reduce((total, row) => total + (Number(row[scenario]) || 0), 0);
  }

  function marginValue(metricId, period, scenario, mode) {
    const numerator = absoluteValue(metricId, period, scenario, mode);
    const denominator = absoluteValue("revenues", period, scenario, mode);
    if (numerator == null || denominator == null || Number(denominator) === 0) return null;
    return Number(numerator) / Number(denominator);
  }

  function sourceRows(metricId, year, monthNumber) {
    const source = metricId === "revenues" ? window.RevenueData.records : window.OperatingMetricData.records[metricId] || [];
    return source.filter((record) => record.year === year && Number(record.period.slice(5, 7)) <= monthNumber);
  }

  function revenueRows(year, monthNumber) {
    return window.RevenueData.records.filter((record) => record.year === year && Number(record.period.slice(5, 7)) <= monthNumber);
  }

  function getReportingRecord() {
    const key = periodToKey(state.period || "May 2026");
    const requested = window.RevenueData.records.find((record) => record.period === key);
    const latestActual = [...window.RevenueData.records]
      .filter((record) => record.actual !== null && record.actual !== undefined && record.actual !== "")
      .sort((a, b) => a.period.localeCompare(b.period))
      .pop();
    return requested || latestActual || window.RevenueData.records[window.RevenueData.records.length - 1];
  }

  function periodToKey(label) {
    const monthMap = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
    const parts = String(label).split(" ");
    return `${parts[1] || "2026"}-${monthMap[parts[0]] || "05"}`;
  }

  function scenarioLabel(scenario) {
    if (scenario === "actual") return "Actual";
    if (scenario === "budget") return "Budget";
    return "Last year";
  }

  function formatValue(value, type) {
    if (value === null || value === undefined || value === "" || Number.isNaN(Number(value))) return "n/a";
    if (type === "margin") return `${(Number(value) * 100).toFixed(1)}%`;
    return Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 });
  }

  const style = document.createElement("style");
  style.textContent = `
    .table-view-link {
      border: 1px solid var(--line);
      background: var(--white);
      color: var(--ink);
      padding: 11px 16px;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: .16em;
      text-transform: uppercase;
      cursor: pointer;
    }

    .table-view-link:hover {
      background: var(--black);
      color: var(--white);
    }

    .financial-table-scroll {
      overflow-x: auto;
      border: 1px solid var(--line);
      background: var(--white);
    }

    .financial-table-view {
      width: 100%;
      min-width: 980px;
      border-collapse: collapse;
      font-size: 14px;
    }

    .financial-table-view th {
      background: #D9D7D0;
      color: #817C75;
      text-align: right;
      padding: 13px 14px;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: .14em;
      text-transform: uppercase;
      border-bottom: 1px solid var(--line);
      white-space: nowrap;
    }

    .financial-table-view th:first-child,
    .financial-table-view th:nth-child(2) {
      text-align: left;
    }

    .financial-table-view td {
      text-align: right;
      padding: 12px 14px;
      border-bottom: 1px solid var(--line);
      white-space: nowrap;
    }

    .financial-table-view .sticky-col {
      position: sticky;
      left: 0;
      background: var(--white);
      text-align: left;
      z-index: 1;
      font-weight: 900;
    }

    .financial-table-view th.sticky-col {
      background: #D9D7D0;
      z-index: 2;
    }

    .financial-table-view .scenario-cell {
      text-align: left;
      color: #817C75;
      font-weight: 800;
    }

    .financial-table-view .metric-start td {
      border-top: 2px solid #CFCBC3;
    }
  `;
  document.head.appendChild(style);
})();
