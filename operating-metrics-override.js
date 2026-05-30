/* Operating metrics override loaded after data sources. */
(function () {
  if (!window.OperatingMetricData || !window.OperatingMetricData.records) return;

  const metricMap = {
    "Gross margin": "gross_margin",
    "Adjusted EBITDA": "adjusted_ebitda",
    "OpCF (EBITDA less Capex)": "opcf",
  };
  const allMetricMap = { ...metricMap, CAPEX: "capex" };
  const detailLabels = Object.keys(metricMap);

  const previousRenderCompanyDetail = renderCompanyDetail;
  const previousRender = render;

  renderRevenueBars = function (rows) {
    return renderMetricBars(rows);
  };

  renderCompanyDetail = function () {
    const company = selectedCompany();
    if (detailLabels.includes(state.detailMetric)) return renderOperatingDetail(company, state.detailMetric);
    return previousRenderCompanyDetail();
  };

  render = function () {
    applyOperatingMetrics();
    previousRender();
  };

  document.addEventListener("click", function (event) {
    const detailButton = event.target.closest("[data-open-detail], [data-bridge-detail], [data-detail-nav]");
    if (detailButton) {
      const metric = detailButton.dataset.openDetail || detailButton.dataset.bridgeDetail || detailButton.dataset.detailNav;
      if (detailLabels.includes(metric)) {
        event.preventDefault();
        event.stopPropagation();
        state.selectedMetric = metric;
        state.detailMetric = metric;
        state.detailMode = detailButton.dataset.mode || (state.companyBridgeMode === "Monthly" ? "MTD" : "YTD");
        if (!state.operatingMetricChartModes) state.operatingMetricChartModes = {};
        if (!state.operatingMetricChartModes[metric]) state.operatingMetricChartModes[metric] = "YTD";
        render();
      }
    }

    const toggle = event.target.closest("[data-operating-metric-chart]");
    if (toggle) {
      event.preventDefault();
      event.stopPropagation();
      const metric = toggle.dataset.operatingMetricChart;
      if (!state.operatingMetricChartModes) state.operatingMetricChartModes = {};
      state.operatingMetricChartModes[metric] = toggle.dataset.mode;
      render();
    }
  }, true);

  applyOperatingMetrics();
  render();

  function applyOperatingMetrics() {
    const reporting = getReportingRecord();
    if (!reporting) return;
    const monthNumber = Number(reporting.period.slice(5, 7));

    Object.entries(allMetricMap).forEach(([label, metricId]) => {
      const metric = baseMetrics.find((item) => item.label === label);
      if (!metric) return;

      const rows = metricRows(metricId, reporting.year, monthNumber);
      const ytdActual = sum(rows, "actual");
      const ytdBudget = sum(rows, "budget");
      const ytdLy = sum(rows, "ly");
      const mtd = rows[rows.length - 1] || {};
      const lowerIsBetter = window.OperatingMetricData.metrics[metricId]?.lowerIsBetter;

      metric.unit = ["gross_margin", "adjusted_ebitda", "opcf"].includes(metricId) ? "CZKm / % of revenues" : "CZKm";
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

      if (["gross_margin", "adjusted_ebitda", "opcf"].includes(metricId)) {
        const margin = marginSummary(metricId, reporting.year, monthNumber);
        metric.subRows = [{
          label: "% of revenues",
          ytdActual: percent(margin.ytd.actual),
          ytdBudgetAbs: pp(margin.ytd.actual, margin.ytd.budget),
          ytdBudgetPct: pp(margin.ytd.actual, margin.ytd.budget),
          ytdBudgetGood: margin.ytd.actual >= margin.ytd.budget,
          ytdLyAbs: pp(margin.ytd.actual, margin.ytd.ly),
          ytdLyPct: pp(margin.ytd.actual, margin.ytd.ly),
          ytdLyGood: margin.ytd.actual >= margin.ytd.ly,
          mtdActual: percent(margin.mtd.actual),
          mtdBudgetAbs: pp(margin.mtd.actual, margin.mtd.budget),
          mtdBudgetPct: pp(margin.mtd.actual, margin.mtd.budget),
          mtdBudgetGood: margin.mtd.actual >= margin.mtd.budget,
          mtdLyAbs: pp(margin.mtd.actual, margin.mtd.ly),
          mtdLyPct: pp(margin.mtd.actual, margin.mtd.ly),
          mtdLyGood: margin.mtd.actual >= margin.mtd.ly,
        }];
      }
    });
  }

  function renderOperatingDetail(company, label) {
    const metricId = metricMap[label];
    const reporting = getReportingRecord();
    const mode = state.operatingMetricChartModes?.[label] || "YTD";
    const monthNumber = Number(reporting.period.slice(5, 7));
    const rows = metricRows(metricId, reporting.year, monthNumber);
    const chartRows = mode === "YTD" ? cumulativeRows(rows) : rows;
    const marginRows = marginRowsFor(metricId, reporting.year, monthNumber, mode);
    const maxValue = Math.max(...chartRows.flatMap((row) => [num(row.actual), num(row.budget), num(row.ly)]), 1) * 1.1;
    const margin = marginSummary(metricId, reporting.year, monthNumber);

    return `
      ${companyHeader(company)}
      <button class="back" data-back-detail>Back to financial indicators</button>
      ${section({
        title: `${shortLabel(label)} detail`,
        kicker: `${company.name} · ${company.month} ${company.fy}`,
        right: `<span class="eyebrow">CZKm / % of revenues</span>`,
        body: `
          <div class="summary-box">
            <div class="summary-title">Formula</div>
            <p>${shortLabel(label)} margin is calculated dynamically as <strong>${shortLabel(label)} / Revenues</strong>. YTD uses cumulative numerator and cumulative revenues; Monthly uses the individual month.</p>
          </div>
        `,
      })}
      ${section({
        title: `${shortLabel(label)} development`,
        kicker: mode === "YTD" ? "Cumulative actual vs budget vs last year" : "Monthly actual vs budget vs last year",
        right: renderToggle(label, mode),
        body: `${renderMetricBars(chartRows, maxValue)}${renderRevenueLegend()}`,
      })}
      ${section({
        title: `${shortLabel(label)} % of revenues`,
        kicker: mode === "YTD" ? `Cumulative ${shortLabel(label)} / cumulative revenues` : `Monthly ${shortLabel(label)} / monthly revenues`,
        right: `<span class="eyebrow">Actual vs budget vs last year</span>`,
        body: `${renderMarginLineChart(marginRows)}${renderRevenueLegend()}`,
      })}
      ${section({
        title: `${shortLabel(label)} margin formula check`,
        kicker: "Calculated from data source, not hardcoded",
        body: renderTable(
          ["Metric", "Actual", "Budget", "Last year"],
          [
            ["YTD margin", percent(margin.ytd.actual), percent(margin.ytd.budget), percent(margin.ytd.ly)],
            ["Monthly margin", percent(margin.mtd.actual), percent(margin.mtd.budget), percent(margin.mtd.ly)],
          ]
        ),
      })}
    `;
  }

  function renderToggle(label, mode) {
    return `
      <div class="toggle">
        <button class="${mode === "YTD" ? "active" : ""}" data-operating-metric-chart="${label}" data-mode="YTD">YTD</button>
        <button class="${mode === "Monthly" ? "active" : ""}" data-operating-metric-chart="${label}" data-mode="Monthly">Monthly</button>
      </div>
    `;
  }

  function renderMetricBars(rows, forcedMaxValue) {
    const maxValue = forcedMaxValue || Math.max(...rows.flatMap((row) => [num(row.actual), num(row.budget), num(row.ly)]), 1) * 1.1;
    return `
      <div class="chart-grid">
        ${rows.map((row) => {
          const actual = num(row.actual);
          const budget = num(row.budget);
          const ly = num(row.ly);
          const budgetVariance = actual - budget;
          const lyVariance = actual - ly;
          const budgetPct = row.actual == null || !budget ? "n/a" : `${budgetVariance >= 0 ? "+" : ""}${((actual / budget - 1) * 100).toFixed(1)}%`;
          const lyPct = row.actual == null || !ly ? "n/a" : `${lyVariance >= 0 ? "+" : ""}${((actual / ly - 1) * 100).toFixed(1)}%`;
          return `
            <div class="chart-month">
              <div class="bars">
                <div class="bar-wrap"><div class="bar actual" style="height:${barHeight(actual, maxValue)}%;"></div></div>
                <div class="bar-wrap"><div class="bar budget" style="height:${barHeight(budget, maxValue)}%;"></div></div>
                <div class="bar-wrap"><div class="bar ly" style="height:${barHeight(ly, maxValue)}%;"></div></div>
              </div>
              <div class="month-label"><strong>${row.month}</strong><span>${row.actual == null ? "n/a" : fmt(row.actual)}</span></div>
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

  function renderMarginLineChart(rows) {
    const values = rows.flatMap((row) => [row.actual, row.budget, row.ly]).filter((value) => value != null && Number.isFinite(value));
    const minRaw = Math.min(...values, 0);
    const maxRaw = Math.max(...values, 0.01);
    const rangePadding = Math.max((maxRaw - minRaw) * 0.15, 0.01);
    const min = Math.max(0, minRaw - rangePadding);
    const max = maxRaw + rangePadding;
    const width = 980;
    const height = 340;
    const left = 105;
    const right = 50;
    const top = 40;
    const bottom = 70;
    const plotW = width - left - right;
    const plotH = height - top - bottom;
    const x = (index) => rows.length === 1 ? left + plotW / 2 : left + (plotW / (rows.length - 1)) * index;
    const y = (value) => top + (1 - ((value - min) / (max - min))) * plotH;
    const series = [
      { key: "actual", label: "Actual", color: "#000000", width: 5 },
      { key: "budget", label: "Budget", color: "#B7B3AA", width: 4 },
      { key: "ly", label: "Last year", color: "#D1CEC7", width: 4, dash: "8 8" },
    ];
    const ticks = [max, (max + min) / 2, min];

    return `
      <div class="margin-line-chart">
        <svg viewBox="0 0 ${width} ${height}" role="img">
          ${ticks.map((tick) => `<line x1="${left}" y1="${y(tick)}" x2="${width - right}" y2="${y(tick)}" stroke="#D8D6D0"/><text x="${left - 18}" y="${y(tick) + 5}" text-anchor="end" font-size="18" font-weight="800" fill="#817C75">${(tick * 100).toFixed(1)}%</text>`).join("")}
          ${rows.map((row, index) => `<line x1="${x(index)}" y1="${top}" x2="${x(index)}" y2="${height - bottom + 10}" stroke="#E6E5E1"/><text x="${x(index)}" y="${height - 18}" text-anchor="middle" font-size="22" font-weight="800" fill="#817C75">${row.month}</text>`).join("")}
          ${series.map((item) => {
            const points = rows.map((row, index) => row[item.key] == null ? null : `${x(index)},${y(row[item.key])}`).filter(Boolean).join(" ");
            return points ? `<polyline points="${points}" fill="none" stroke="${item.color}" stroke-width="${item.width}" stroke-linecap="round" stroke-linejoin="round" ${item.dash ? `stroke-dasharray="${item.dash}"` : ""}/>` : "";
          }).join("")}
          ${series.map((item) => rows.map((row, index) => row[item.key] == null ? "" : `<circle cx="${x(index)}" cy="${y(row[item.key])}" r="${item.key === "actual" ? 8 : 6}" fill="${item.color}"/>${item.key === "actual" ? `<text x="${x(index)}" y="${y(row[item.key]) - 16}" text-anchor="middle" font-size="18" font-weight="800" fill="#000">${(row[item.key] * 100).toFixed(1)}%</text>` : ""}`).join("")).join("")}
        </svg>
      </div>
    `;
  }

  function marginRowsFor(metricId, year, monthNumber, mode) {
    const metric = metricRows(metricId, year, monthNumber);
    const revenue = revenueRows(year, monthNumber);
    const metricBase = mode === "YTD" ? cumulativeRows(metric) : metric;
    const revenueBase = mode === "YTD" ? cumulativeRows(revenue) : revenue;
    return metricBase.map((row, index) => ({
      month: row.month,
      actual: ratio(row.actual, revenueBase[index]?.actual),
      budget: ratio(row.budget, revenueBase[index]?.budget),
      ly: ratio(row.ly, revenueBase[index]?.ly),
    }));
  }

  function marginSummary(metricId, year, monthNumber) {
    const metric = metricRows(metricId, year, monthNumber);
    const revenue = revenueRows(year, monthNumber);
    const m = metric[metric.length - 1] || {};
    const r = revenue[revenue.length - 1] || {};
    return {
      ytd: {
        actual: ratio(sum(metric, "actual"), sum(revenue, "actual")),
        budget: ratio(sum(metric, "budget"), sum(revenue, "budget")),
        ly: ratio(sum(metric, "ly"), sum(revenue, "ly")),
      },
      mtd: {
        actual: ratio(m.actual, r.actual),
        budget: ratio(m.budget, r.budget),
        ly: ratio(m.ly, r.ly),
      },
    };
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

  function metricRows(metricId, year, monthNumber) {
    return (window.OperatingMetricData.records[metricId] || []).filter((record) => record.year === year && Number(record.period.slice(5, 7)) <= monthNumber);
  }

  function revenueRows(year, monthNumber) {
    return (window.RevenueData?.records || []).filter((record) => record.year === year && Number(record.period.slice(5, 7)) <= monthNumber);
  }

  function cumulativeRows(rows) {
    let actual = 0;
    let budget = 0;
    let ly = 0;
    return rows.map((row) => {
      actual += num(row.actual);
      budget += num(row.budget);
      ly += num(row.ly);
      return { month: row.month, actual, budget, ly };
    });
  }

  function barHeight(value, maxValue) {
    return Math.max(value > 0 ? 3 : 0, (value / maxValue) * 100);
  }

  function periodToKey(label) {
    const monthMap = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
    const parts = String(label).split(" ");
    return `${parts[1] || "2026"}-${monthMap[parts[0]] || "05"}`;
  }

  function sum(rows, key) {
    return rows.reduce((total, row) => total + num(row[key]), 0);
  }

  function num(value) {
    return Number(value) || 0;
  }

  function ratio(numerator, denominator) {
    if (numerator == null || denominator == null || Number(denominator) === 0) return null;
    return Number(numerator) / Number(denominator);
  }

  function fmt(value) {
    return Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 });
  }

  function valueOrBlank(value) {
    return value === null || value === undefined || value === "" ? "n/a" : fmt(value);
  }

  function delta(actual, base) {
    if (actual == null || base == null) return "n/a";
    const value = Number(actual) - Number(base);
    return `${value >= 0 ? "+" : ""}${fmt(value)}`;
  }

  function pct(actual, base) {
    if (actual == null || !base) return "n/a";
    const value = Number(actual) / Number(base) - 1;
    return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
  }

  function pp(actual, base) {
    if (actual == null || base == null) return "n/a";
    const value = (Number(actual) - Number(base)) * 100;
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}pp`;
  }

  function percent(value) {
    return value == null ? "n/a" : `${(value * 100).toFixed(1)}%`;
  }

  function goodVariance(actual, base, lowerIsBetter) {
    if (actual == null || base == null) return true;
    return lowerIsBetter ? Number(actual) <= Number(base) : Number(actual) >= Number(base);
  }

  function shortLabel(label) {
    return label === "OpCF (EBITDA less Capex)" ? "OpCF" : label;
  }
})();
