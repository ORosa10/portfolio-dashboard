/* Manual data override that reads Revenues from data/revenues-data.js. No confidential values. */
(function () {
  if (!window.RevenueData || !Array.isArray(window.RevenueData.records)) return;

  let initialised = false;
  const originalRender = render;

  render = function () {
    applyRevenueData({ keepRequestedPeriod: true });
    originalRender();
  };

  document.addEventListener(
    "click",
    function (event) {
      const revenueChartButton = event.target.closest("[data-revenue-chart]");
      if (revenueChartButton) {
        event.preventDefault();
        event.stopPropagation();
        state.revenueChartMode = revenueChartButton.dataset.revenueChart;
        render();
        return;
      }

      const bridgeButton = event.target.closest("[data-bridge-detail]");
      if (bridgeButton && bridgeButton.dataset.bridgeDetail === "Revenues") {
        event.preventDefault();
        event.stopPropagation();
        state.selectedMetric = "Revenues";
        state.detailMetric = "Revenues";
        state.detailMode = state.companyBridgeMode === "Monthly" ? "MTD" : "YTD";
        render();
        return;
      }

      const detailButton = event.target.closest("[data-open-detail]");
      if (detailButton && detailButton.dataset.openDetail === "Revenues") {
        event.preventDefault();
        event.stopPropagation();
        state.selectedMetric = "Revenues";
        state.detailMetric = "Revenues";
        state.detailMode = detailButton.dataset.mode || "YTD";
        render();
      }
    },
    true
  );

  applyRevenueData({ keepRequestedPeriod: false });
  render();

  function applyRevenueData(options) {
    const keepRequestedPeriod = options && options.keepRequestedPeriod;
    const latestActualRecord = [...window.RevenueData.records]
      .filter((record) => record.actual !== null && record.actual !== undefined && record.actual !== "")
      .sort((a, b) => a.period.localeCompare(b.period))
      .pop();

    const requestedPeriod = periodToKey(state.period || "May 2026");
    const requestedRecord = window.RevenueData.records.find((record) => record.period === requestedPeriod);
    const selectedRecord = requestedRecord || latestActualRecord || window.RevenueData.records[window.RevenueData.records.length - 1];

    const shouldUseLatestActual =
      !initialised &&
      !keepRequestedPeriod &&
      (state.period || "May 2026") === "May 2026" &&
      selectedRecord &&
      selectedRecord.actual == null &&
      latestActualRecord;

    const reportingRecord = shouldUseLatestActual ? latestActualRecord : selectedRecord;
    initialised = true;

    if (!reportingRecord) return;

    state.period = `${reportingRecord.month} ${reportingRecord.year}`;

    const selectedYear = reportingRecord.year;
    const selectedMonthNumber = Number(reportingRecord.period.slice(5, 7));

    const revenueSeries = window.RevenueData.records
      .filter((record) => record.year === selectedYear && Number(record.period.slice(5, 7)) <= selectedMonthNumber)
      .map((record) => ({
        month: record.month,
        actual: record.actual,
        budget: record.budget,
        ly: record.ly,
      }));

    const ytdActual = sum(revenueSeries, "actual");
    const ytdBudget = sum(revenueSeries, "budget");
    const ytdLy = sum(revenueSeries, "ly");
    const mtd = revenueSeries[revenueSeries.length - 1];

    revenueMonths.splice(0, revenueMonths.length, ...revenueSeries);

    const revenueMetric = baseMetrics.find((metric) => metric.label === "Revenues");
    if (revenueMetric) {
      revenueMetric.unit = window.RevenueData.unit;
      revenueMetric.ytdActual = fmt(ytdActual);
      revenueMetric.ytdBudgetAbs = abs(ytdActual, ytdBudget);
      revenueMetric.ytdBudgetPct = pct(ytdActual, ytdBudget);
      revenueMetric.ytdLyAbs = abs(ytdActual, ytdLy);
      revenueMetric.ytdLyPct = pct(ytdActual, ytdLy);
      revenueMetric.mtdActual = valueOrBlank(mtd.actual);
      revenueMetric.mtdBudgetAbs = mtd.actual == null ? "n/a" : abs(mtd.actual, mtd.budget);
      revenueMetric.mtdBudgetPct = mtd.actual == null ? "n/a" : pct(mtd.actual, mtd.budget);
      revenueMetric.mtdLyAbs = mtd.actual == null ? "n/a" : abs(mtd.actual, mtd.ly);
      revenueMetric.mtdLyPct = mtd.actual == null ? "n/a" : pct(mtd.actual, mtd.ly);
    }

    const emg = companies.find((company) => company.id === "company_a");
    if (emg) {
      emg.currency = window.RevenueData.unit;
      emg.month = reportingRecord.month;
      emg.fy = String(reportingRecord.year);
      emg.revenue = ytdActual;
      emg.revenueBudget = ytdBudget;
      emg.trend = revenueSeries.map((item) => item.actual || 0);
      emg.comment = "Revenue values are loaded from data/revenues-data.js. Values are illustrative only and do not represent actual company performance.";
    }

    if (typeof formatMoney === "function") {
      formatMoney = function (value) {
        return `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 })} ${window.RevenueData.unit}`;
      };
    }
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

  function pct(actual, base) {
    if (!base) return "0.0%";
    const value = actual / base - 1;
    return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
  }

  function abs(actual, base) {
    const value = actual - base;
    return `${value >= 0 ? "+" : ""}${fmt(value)}`;
  }
})();
