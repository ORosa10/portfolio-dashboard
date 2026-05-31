/* Balance sheet / leverage override loaded after data sources. */
(function () {
  if (!window.BalanceSheetData || !window.BalanceSheetData.records) return;

  const labelToMetric = {
    Debt: "debt",
    Cash: "cash",
    "Net debt / LTM EBITDA": "net_debt_ltm_ebitda",
  };
  const detailLabels = Object.keys(labelToMetric);
  const TABLE_VIEW_KEY = "__balance_table__";

  const previousRenderCompanyDetail = renderCompanyDetail;
  const previousRender = render;

  renderCompanyDetail = function () {
    const company = selectedCompany();
    if (state.detailMetric === TABLE_VIEW_KEY) return renderBalanceTableView(company);
    if (detailLabels.includes(state.detailMetric)) return renderBalanceDetail(company, state.detailMetric);
    return previousRenderCompanyDetail();
  };

  render = function () {
    applyBalanceMetrics();
    previousRender();
    addBalanceTableLink();
  };

  document.addEventListener("click", function (event) {
    const tableButton = event.target.closest("[data-open-balance-table]");
    if (tableButton) {
      event.preventDefault();
      event.stopPropagation();
      state.detailMetric = TABLE_VIEW_KEY;
      state.selectedMetric = "Balance table";
      if (!state.balanceTableMode) state.balanceTableMode = "Snapshot";
      render();
      window.scrollTo(0, 0);
      return;
    }

    const tableToggle = event.target.closest("[data-balance-table-mode]");
    if (tableToggle) {
      event.preventDefault();
      event.stopPropagation();
      state.balanceTableMode = tableToggle.dataset.balanceTableMode;
      render();
      return;
    }

    const chartToggle = event.target.closest("[data-balance-chart-mode]");
    if (chartToggle) {
      event.preventDefault();
      event.stopPropagation();
      if (!state.balanceChartModes) state.balanceChartModes = {};
      state.balanceChartModes[chartToggle.dataset.metric] = chartToggle.dataset.balanceChartMode;
      render();
      return;
    }

    const detailButton = event.target.closest("[data-open-detail], [data-detail-nav]");
    if (detailButton) {
      const metric = detailButton.dataset.openDetail || detailButton.dataset.detailNav;
      if (detailLabels.includes(metric)) {
        event.preventDefault();
        event.stopPropagation();
        state.detailMetric = metric;
        state.selectedMetric = metric;
        render();
        window.scrollTo(0, 0);
      }
    }
  }, true);

  applyBalanceMetrics();
  render();

  function applyBalanceMetrics() {
    const reporting = getReportingRecord();
    if (!reporting) return;
    const period = reporting.period;

    Object.entries(labelToMetric).forEach(([label, metricId]) => {
      const metric = baseMetrics.find((item) => item.label === label);
      if (!metric) return;

      const row = rowFor(metricId, period);
      const meta = window.BalanceSheetData.metrics[metricId];
      const isMultiple = meta.unit === "x";
      const lowerIsBetter = meta.lowerIsBetter;

      metric.unit = meta.unit;
      metric.ytdActual = format(row?.actual, isMultiple);
      metric.ytdBudgetAbs = varianceAbs(row?.actual, row?.budget, isMultiple);
      metric.ytdBudgetPct = variancePct(row?.actual, row?.budget, isMultiple);
      metric.ytdBudgetGood = goodVariance(row?.actual, row?.budget, lowerIsBetter);
      metric.ytdLyAbs = varianceAbs(row?.actual, row?.ly, isMultiple);
      metric.ytdLyPct = variancePct(row?.actual, row?.ly, isMultiple);
      metric.ytdLyGood = goodVariance(row?.actual, row?.ly, lowerIsBetter);
      metric.mtdActual = metric.ytdActual;
      metric.mtdBudgetAbs = metric.ytdBudgetAbs;
      metric.mtdBudgetPct = metric.ytdBudgetPct;
      metric.mtdBudgetGood = metric.ytdBudgetGood;
      metric.mtdLyAbs = metric.ytdLyAbs;
      metric.mtdLyPct = metric.ytdLyPct;
      metric.mtdLyGood = metric.ytdLyGood;
    });

    const company = companies.find((item) => item.id === "company_a");
    if (company) {
      const cash = rowFor("cash", period);
      const netDebt = rowFor("net_debt", period);
      company.cash = Number(cash?.actual) || company.cash;
      company.netDebt = Number(netDebt?.actual) || company.netDebt;
    }
  }

  function renderBalanceDetail(company, label) {
    const metricId = labelToMetric[label];
    const meta = window.BalanceSheetData.metrics[metricId];
    const reporting = getReportingRecord();
    const mode = state.balanceChartModes?.[metricId] || "Snapshot";
    const rows = rowsToPeriod(metricId, reporting.year, Number(reporting.period.slice(5, 7)));
    const chartRows = mode === "Change" ? changeRows(rows) : rows;
    const isMultiple = meta.unit === "x";
    const maxValue = Math.max(...chartRows.flatMap((row) => [num(row.actual), num(row.budget), num(row.ly)]), 1) * 1.1;

    return `
      ${companyHeader(company)}
      <button class="back" data-back-detail>Back to financial indicators</button>
      ${section({
        title: `${label} detail`,
        kicker: `${company.name} · ${company.month} ${company.fy}`,
        right: `<span class="eyebrow">${meta.unit}</span>`,
        body: `
          <div class="summary-box">
            <div class="summary-title">Source</div>
            <p>${label} is loaded from <strong>${meta.sourceLabel}</strong> in EMG_act / EMG_bud. Last year is calculated as actual minus 12 months.</p>
          </div>
        `,
      })}
      ${section({
        title: `${label} development`,
        kicker: mode === "Snapshot" ? "Balance sheet snapshot by month" : "Month-on-month change by month",
        right: renderBalanceToggle(metricId, mode),
        body: `${renderBars(chartRows, maxValue, isMultiple)}${renderLegend()}`,
      })}
    `;
  }

  function renderBalanceTableView(company) {
    const mode = state.balanceTableMode || "Snapshot";
    const reporting = getReportingRecord();
    const periods = revenuePeriods(reporting.year, Number(reporting.period.slice(5, 7)));
    const metrics = [
      { id: "debt", label: "Debt" },
      { id: "cash", label: "Cash" },
      { id: "net_debt", label: "Net debt" },
      { id: "net_debt_ltm_ebitda", label: "Net debt / LTM EBITDA" },
    ];

    return `
      ${companyHeader(company)}
      <button class="back" data-back-detail>Back to financial indicators</button>
      ${section({
        title: "Balance sheet / leverage table",
        kicker: mode === "Snapshot" ? `Snapshot table as of ${company.month}` : `Month-on-month change as of ${company.month}`,
        right: renderTableToggle(mode),
        body: `
          <div class="financial-table-scroll">
            <table class="financial-table-view">
              <thead>
                <tr><th class="sticky-col">Metric</th><th>Scenario</th>${periods.map((p) => `<th>${p.month}</th>`).join("")}</tr>
              </thead>
              <tbody>${metrics.map((metric) => renderMetricRows(metric, periods, mode)).join("")}</tbody>
            </table>
          </div>
        `,
      })}
    `;
  }

  function renderMetricRows(metric, periods, mode) {
    return ["actual", "budget", "ly"].map((scenario, index) => `
      <tr class="${index === 0 ? "metric-start" : ""}">
        <td class="sticky-col metric-cell">${index === 0 ? metric.label : ""}</td>
        <td class="scenario-cell">${scenarioLabel(scenario)}</td>
        ${periods.map((period) => `<td>${format(tableValue(metric.id, period.period, scenario, mode), window.BalanceSheetData.metrics[metric.id].unit === "x")}</td>`).join("")}
      </tr>
    `).join("");
  }

  function tableValue(metricId, period, scenario, mode) {
    const row = rowFor(metricId, period);
    if (!row) return null;
    if (mode === "Snapshot") return row[scenario];
    const previous = previousRowFor(metricId, period);
    if (!previous || row[scenario] == null || previous[scenario] == null) return null;
    return Number(row[scenario]) - Number(previous[scenario]);
  }

  function addBalanceTableLink() {
    if (state.detailMetric) return;
    if (document.querySelector("[data-open-balance-table]")) return;
    const sections = [...document.querySelectorAll("section.section")];
    const target = sections.find((section) => section.querySelector("h2")?.textContent.trim() === "Balance sheet / leverage indicators");
    if (!target) return;
    const sectionHead = target.querySelector(".section-head");
    if (!sectionHead) return;
    let right = sectionHead.querySelector(".section-head > div:last-child");
    if (!right || right === sectionHead.firstElementChild) {
      right = document.createElement("div");
      sectionHead.appendChild(right);
    }
    right.insertAdjacentHTML("beforeend", `<button class="table-view-link" data-open-balance-table>Table view</button>`);
  }

  function renderBalanceToggle(metricId, mode) {
    return `
      <div class="toggle">
        <button class="${mode === "Snapshot" ? "active" : ""}" data-metric="${metricId}" data-balance-chart-mode="Snapshot">Snapshot</button>
        <button class="${mode === "Change" ? "active" : ""}" data-metric="${metricId}" data-balance-chart-mode="Change">Change</button>
      </div>
    `;
  }

  function renderTableToggle(mode) {
    return `
      <div class="toggle">
        <button class="${mode === "Snapshot" ? "active" : ""}" data-balance-table-mode="Snapshot">Snapshot</button>
        <button class="${mode === "Change" ? "active" : ""}" data-balance-table-mode="Change">Change</button>
      </div>
    `;
  }

  function renderBars(rows, maxValue, isMultiple) {
    return `
      <div class="chart-grid">
        ${rows.map((row) => {
          const actual = num(row.actual), budget = num(row.budget), ly = num(row.ly);
          return `
            <div class="chart-month">
              <div class="bars">
                <div class="bar-wrap"><div class="bar actual" style="height:${barHeight(actual, maxValue)}%;"></div></div>
                <div class="bar-wrap"><div class="bar budget" style="height:${barHeight(budget, maxValue)}%;"></div></div>
                <div class="bar-wrap"><div class="bar ly" style="height:${barHeight(ly, maxValue)}%;"></div></div>
              </div>
              <div class="month-label"><strong>${row.month}</strong><span>${format(row.actual, isMultiple)}</span></div>
              <div class="mini-variance">
                <div class="mini-badge ${actual <= budget ? "good" : "bad"}">BUD<br>${variancePct(row.actual, row.budget, isMultiple)}</div>
                <div class="mini-badge ${actual <= ly ? "good" : "bad"}">LY<br>${variancePct(row.actual, row.ly, isMultiple)}</div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderLegend() {
    return `<div class="legend"><span><span class="legend-mark actual-mark"></span>Actual</span><span><span class="legend-mark budget-mark"></span>Budget</span><span><span class="legend-mark ly-mark"></span>Last year</span></div>`;
  }

  function getReportingRecord() {
    const key = periodToKey(state.period || "May 2026");
    const requested = window.RevenueData?.records?.find((r) => r.period === key);
    const latestActual = [...(window.RevenueData?.records || [])].filter((r) => r.actual != null).sort((a, b) => a.period.localeCompare(b.period)).pop();
    return requested || latestActual;
  }

  function rowsToPeriod(metricId, year, monthNumber) {
    return (window.BalanceSheetData.records[metricId] || []).filter((r) => r.year === year && Number(r.period.slice(5, 7)) <= monthNumber);
  }

  function revenuePeriods(year, monthNumber) {
    return (window.RevenueData?.records || []).filter((r) => r.year === year && Number(r.period.slice(5, 7)) <= monthNumber);
  }

  function rowFor(metricId, period) {
    return (window.BalanceSheetData.records[metricId] || []).find((r) => r.period === period);
  }

  function previousRowFor(metricId, period) {
    const rows = window.BalanceSheetData.records[metricId] || [];
    const index = rows.findIndex((r) => r.period === period);
    return index > 0 ? rows[index - 1] : null;
  }

  function changeRows(rows) {
    return rows.map((row, index) => {
      const previous = index > 0 ? rows[index - 1] : null;
      return {
        month: row.month,
        actual: previous && row.actual != null && previous.actual != null ? row.actual - previous.actual : null,
        budget: previous && row.budget != null && previous.budget != null ? row.budget - previous.budget : null,
        ly: previous && row.ly != null && previous.ly != null ? row.ly - previous.ly : null,
      };
    });
  }

  function periodToKey(label) {
    const monthMap = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
    const parts = String(label).split(" ");
    return `${parts[1] || "2026"}-${monthMap[parts[0]] || "05"}`;
  }

  function num(value) { return Number(value) || 0; }
  function barHeight(value, maxValue) { return Math.max(value > 0 ? 3 : 0, (value / maxValue) * 100); }
  function format(value, isMultiple) {
    if (value == null || value === "" || Number.isNaN(Number(value))) return "n/a";
    return isMultiple ? `${Number(value).toFixed(2)}x` : Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 });
  }
  function varianceAbs(actual, base, isMultiple) {
    if (actual == null || base == null) return "n/a";
    const value = Number(actual) - Number(base);
    return isMultiple ? `${value >= 0 ? "+" : ""}${value.toFixed(2)}x` : `${value >= 0 ? "+" : ""}${Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 })}`;
  }
  function variancePct(actual, base, isMultiple) {
    if (actual == null || base == null) return "n/a";
    if (isMultiple) return varianceAbs(actual, base, true);
    if (!Number(base)) return "n/a";
    const value = Number(actual) / Number(base) - 1;
    return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
  }
  function goodVariance(actual, base, lowerIsBetter) {
    if (actual == null || base == null) return true;
    return lowerIsBetter ? Number(actual) <= Number(base) : Number(actual) >= Number(base);
  }
  function scenarioLabel(scenario) { return scenario === "actual" ? "Actual" : scenario === "budget" ? "Budget" : "Last year"; }
})();
