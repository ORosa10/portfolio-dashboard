/* Operating metrics override loaded after data sources. */
(function () {
  if (!window.OperatingMetricData || !window.OperatingMetricData.records) return;

  const metricMap = {
    "Gross margin": "gross_margin",
    "Adjusted EBITDA": "adjusted_ebitda",
    "CAPEX": "capex",
    "OpCF (EBITDA less Capex)": "opcf",
  };

  const detailLabels = ["Gross margin", "Adjusted EBITDA", "OpCF (EBITDA less Capex)"];
  const originalRenderCompanyDetailForOps = renderCompanyDetail;
  const originalRenderRevenueBars = renderRevenueBars;

  renderRevenueBars = function (rows) {
    return renderMetricBars(rows);
  };

  renderCompanyDetail = function () {
    const company = selectedCompany();
    if (detailLabels.includes(state.detailMetric)) {
      return renderGenericOperatingMetricDetail(company, state.detailMetric);
    }
    return originalRenderCompanyDetailForOps();
  };

  const originalRenderForOps = render;
  render = function () {
    applyOperatingMetricData();
    originalRenderForOps();
  };

  document.addEventListener(
    "click",
    function (event) {
      const button = event.target.closest("[data-open-detail], [data-bridge-detail], [data-detail-nav]");
      if (!button) return;

      const metric = button.dataset.openDetail || button.dataset.bridgeDetail || button.dataset.detailNav;
      if (!detailLabels.includes(metric)) return;

      event.preventDefault();
      event.stopPropagation();

      state.selectedMetric = metric;
      state.detailMetric = metric;
      state.detailMode = button.dataset.mode || (state.companyBridgeMode === "Monthly" ? "MTD" : "YTD");
      if (!state.operatingMetricChartModes) state.operatingMetricChartModes = {};
      if (!state.operatingMetricChartModes[metric]) state.operatingMetricChartModes[metric] = "YTD";
      render();
    },
    true
  );

  document.addEventListener(
    "click",
    function (event) {
      const button = event.target.closest("[data-operating-metric-chart]");
      if (!button) return;

      event.preventDefault();
      event.stopPropagation();

      const metric = button.dataset.operatingMetricChart;
      if (!state.operatingMetricChartModes) state.operatingMetricChartModes = {};
      state.operatingMetricChartModes[metric] = button.dataset.mode;
      render();
    },
    true
  );

  applyOperatingMetricData();
  render();

  function applyOperatingMetricData() {
    const reporting = getReportingRecord();
    if (!reporting) return;

    Object.entries(metricMap).forEach(([label, metricId]) => {
      const metric = baseMetrics.find((item) => item.label === label);
      if (!metric) return;

      const rows = rowsForSelectedPeriod(metricId, reporting.year, Number(reporting.period.slice(5, 7)));
      const ytdActual = sum(rows, "actual");
      const ytdBudget = sum(rows, "budget");
      const ytdLy = sum(rows, "ly");
      const mtd = rows[rows.length - 1] || {};
      const lowerIsBetter = window.OperatingMetricData.metrics[metricId]?.lowerIsBetter;

      metric.unit = metricId === "gross_margin" || metricId === "adjusted_ebitda" ? "CZKm / % of revenues" : "CZKm";
      metric.ytdActual = valueOrBlank(ytdActual);
      metric.ytdBudgetAbs = delta(ytdActual, ytdBudget);
      metric.ytdBudgetPct = pct(ytdActual, ytdBudget);
      metric.ytdBudgetGood = goodVariance(ytdActual, ytdBudget, lowerIsBetter);
      metric.ytdLyAbs = delta(ytdActual, ytdLy);
      metric.ytdLyPct = pct(ytdActual, ytdLy);
      metric.ytdLyGood = goodVariance(ytdActual, ytdLy, lowerIsBetter);
      metric.mtdActual = valueOrBlank(mtd.actual);
      metric.mtdBudgetAbs = mtd.actual == null ? "n/a" : delta(mtd.actual, mtd.budget);
      metric.mtdBudgetPct = mtd.actual == null ? "n/a" : pct(mtd.actual, mtd.budget);
      metric.mtdBudgetGood = mtd.actual == null ? true : goodVariance(mtd.actual, mtd.budget, lowerIsBetter);
      metric.mtdLyAbs = mtd.actual == null ? "n/a" : delta(mtd.actual, mtd.ly);
      metric.mtdLyPct = mtd.actual == null ? "n/a" : pct(mtd.actual, mtd.ly);
      metric.mtdLyGood = mtd.actual == null ? true : goodVariance(mtd.actual, mtd.ly, lowerIsBetter);

      if (metricId === "gross_margin" || metricId === "adjusted_ebitda") {
        const revenueRows = currentRevenueRows(reporting.year, Number(reporting.period.slice(5, 7)));
        const revenueYtdActual = sum(revenueRows, "actual");
        const revenueYtdBudget = sum(revenueRows, "budget");
        const revenueYtdLy = sum(revenueRows, "ly");
        const revenueMtd = revenueRows[revenueRows.length - 1] || {};
        const ratioYtdActual = safeRatio(ytdActual, revenueYtdActual);
        const ratioYtdBudget = safeRatio(ytdBudget, revenueYtdBudget);
        const ratioYtdLy = safeRatio(ytdLy, revenueYtdLy);
        const ratioMtdActual = safeRatio(mtd.actual, revenueMtd.actual);
        const ratioMtdBudget = safeRatio(mtd.budget, revenueMtd.budget);
        const ratioMtdLy = safeRatio(mtd.ly, revenueMtd.ly);

        metric.subRows = [{
          label: "% of revenues",
          ytdActual: percentPoint(ratioYtdActual),
          ytdBudgetAbs: pp(ratioYtdActual, ratioYtdBudget),
          ytdBudgetPct: pp(ratioYtdActual, ratioYtdBudget),
          ytdBudgetGood: true,
          ytdLyAbs: pp(ratioYtdActual, ratioYtdLy),
          ytdLyPct: pp(ratioYtdActual, ratioYtdLy),
          ytdLyGood: ratioYtdActual >= ratioYtdLy,
          mtdActual: percentPoint(ratioMtdActual),
          mtdBudgetAbs: pp(ratioMtdActual, ratioMtdBudget),
          mtdBudgetPct: pp(ratioMtdActual, ratioMtdBudget),
          mtdBudgetGood: true,
          mtdLyAbs: pp(ratioMtdActual, ratioMtdLy),
          mtdLyPct: pp(ratioMtdActual, ratioMtdLy),
          mtdLyGood: ratioMtdActual >= ratioMtdLy,
        }];
      }
    });

    const emg = companies.find((company) => company.id === "company_a");
    const ebitda = baseMetrics.find((item) => item.label === "Adjusted EBITDA");
    if (emg && ebitda) {
      emg.ebitda = numberFromFormatted(ebitda.ytdActual);
      emg.ebitdaBudget = emg.ebitdaBudget || emg.ebitda;
    }
  }

  function renderGenericOperatingMetricDetail(company, label) {
    const metricId = metricMap[label];
    const reporting = getReportingRecord();
    const mode = state.operatingMetricChartModes?.[label] || "YTD";
    const monthNumber = Number(reporting.period.slice(5, 7));
    const rows = rowsForSelectedPeriod(metricId, reporting.year, monthNumber);
    const chartRows = mode === "YTD" ? cumulativeRows(rows) : rows;
    const maxValue = Math.max(...chartRows.flatMap((row) => [row.actual || 0, row.budget || 0, row.ly || 0]), 1) * 1.1;

    return `
      ${companyHeader(company)}
      <button class="back" data-back-detail>Back to financial indicators</button>
      ${section({
        title: `${shortLabel(label)} detail`,
        kicker: `${company.name} · ${company.month} ${company.fy}`,
        right: `<span class="eyebrow">CZKm</span>`,
        body: `
          <div class="summary-box">
            <div class="summary-title">Summary</div>
            <p>${shortLabel(label)} is loaded from data/operating-metrics-data.js. The values are mapped from EMG_act / EMG_bud and LY is calculated as actual minus 12 months.</p>
          </div>
        `,
      })}
      ${section({
        title: `${shortLabel(label)} development`,
        kicker: mode === "YTD" ? "Cumulative actual vs budget vs last year" : "Monthly actual vs budget vs last year",
        right: renderOperatingToggle(label, mode),
        body: `${renderMetricBars(chartRows, maxValue)}${renderRevenueLegend()}`,
      })}
    `;
  }

  function renderOperatingToggle(label, mode) {
    return `
      <div class="toggle">
        <button class="${mode === "YTD" ? "active" : ""}" data-operating-metric-chart="${label}" data-mode="YTD">YTD</button>
        <button class="${mode === "Monthly" ? "active" : ""}" data-operating-metric-chart="${label}" data-mode="Monthly">Monthly</button>
      </div>
    `;
  }

  function renderMetricBars(rows, forcedMaxValue) {
    const maxValue = forcedMaxValue || Math.max(...rows.flatMap((row) => [row.actual || 0, row.budget || 0, row.ly || 0]), 1) * 1.1;
    return `
      <div class="chart-grid">
        ${rows.map((row) => {
          const actual = Number(row.actual) || 0;
          const budget = Number(row.budget) || 0;
          const ly = Number(row.ly) || 0;
          const budgetVariance = actual - budget;
          const lyVariance = actual - ly;
          const budgetPct = row.actual == null || !budget ? "n/a" : `${budgetVariance >= 0 ? "+" : ""}${((actual / budget - 1) * 100).toFixed(1)}%`;
          const lyPct = row.actual == null || !ly ? "n/a" : `${lyVariance >= 0 ? "+" : ""}${((actual / ly - 1) * 100).toFixed(1)}%`;
          return `
            <div class="chart-month">
              <div class="bars">
                <div class="bar-wrap"><div class="bar actual" style="height:${height(actual, maxValue)}%;"></div></div>
                <div class="bar-wrap"><div class="bar budget" style="height:${height(budget, maxValue)}%;"></div></div>
                <div class="bar-wrap"><div class="bar ly" style="height:${height(ly, maxValue)}%;"></div></div>
              </div>
              <div class="month-label">
                <strong>${row.month}</strong>
                <span>${row.actual == null ? "n/a" : Number(row.actual).toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
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

  function getReportingRecord() {
    const key = periodToKey(state.period || "May 2026");
    const requested = window.RevenueData?.records?.find((record) => record.period === key);
    const latestActual = [...(window.RevenueData?.records || [])]
      .filter((record) => record.actual !== null && record.actual !== undefined && record.actual !== "")
      .sort((a, b) => a.period.localeCompare(b.period))
      .pop();
    return requested || latestActual;
  }

  function rowsForSelectedPeriod(metricId, year, monthNumber) {
    return (window.OperatingMetricData.records[metricId] || [])
      .filter((record) => record.year === year && Number(record.period.slice(5, 7)) <= monthNumber);
  }

  function currentRevenueRows(year, monthNumber) {
    return (window.RevenueData?.records || [])
      .filter((record) => record.year === year && Number(record.period.slice(5, 7)) <= monthNumber);
  }

  function cumulativeRows(rows) {
    let actual = 0;
    let budget = 0;
    let ly = 0;
    return rows.map((row) => {
      actual += Number(row.actual) || 0;
      budget += Number(row.budget) || 0;
      ly += Number(row.ly) || 0;
      return { month: row.month, actual, budget, ly };
    });
  }

  function height(value, maxValue) {
    return Math.max(value > 0 ? 3 : 0, (value / maxValue) * 100);
  }

  function periodToKey(label) {
    const monthMap = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
    const parts = String(label).split(" ");
    const month = monthMap[parts[0]] || "05";
    const year = parts[1] || "2026";
    return `${year}-${month}`;
  }

  function sum(rows, key) {
    return rows.reduce((total, item) => total + (Number(item[key]) || 0), 0);
  }

  function fmt(value) {
    return Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 });
  }

  function valueOrBlank(value) {
    return value === null || value === undefined || value === "" ? "n/a" : fmt(value);
  }

  function delta(actual, base) {
    if (actual == null || base == null) return "n/a";
    const value = actual - base;
    return `${value >= 0 ? "+" : ""}${fmt(value)}`;
  }

  function pct(actual, base) {
    if (actual == null || !base) return "n/a";
    const value = actual / base - 1;
    return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
  }

  function goodVariance(actual, base, lowerIsBetter) {
    if (actual == null || base == null) return true;
    return lowerIsBetter ? actual <= base : actual >= base;
  }

  function safeRatio(numerator, denominator) {
    if (numerator == null || !denominator) return null;
    return numerator / denominator;
  }

  function percentPoint(value) {
    return value == null ? "n/a" : `${(value * 100).toFixed(1)}%`;
  }

  function pp(value, base) {
    if (value == null || base == null) return "n/a";
    const diff = (value - base) * 100;
    return `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}pp`;
  }

  function numberFromFormatted(value) {
    return Number(String(value).replace(/[^0-9.-]/g, "")) || 0;
  }

  function shortLabel(label) {
    if (label === "OpCF (EBITDA less Capex)") return "OpCF";
    return label;
  }
})();