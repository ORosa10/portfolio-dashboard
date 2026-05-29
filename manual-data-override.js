/* Manual data override that reads Revenues from data/revenues-data.js. No confidential values. */
(function () {
  if (!window.RevenueData || !Array.isArray(window.RevenueData.records)) return;

  const selectedPeriod = periodToKey(state.period || "May 2026");
  const selectedRecord = window.RevenueData.records.find((record) => record.period === selectedPeriod) || window.RevenueData.records[window.RevenueData.records.length - 1];
  const selectedYear = selectedRecord.year;
  const selectedMonthNumber = Number(selectedRecord.period.slice(5, 7));

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
    revenueMetric.mtdActual = fmt(mtd.actual);
    revenueMetric.mtdBudgetAbs = abs(mtd.actual, mtd.budget);
    revenueMetric.mtdBudgetPct = pct(mtd.actual, mtd.budget);
    revenueMetric.mtdLyAbs = abs(mtd.actual, mtd.ly);
    revenueMetric.mtdLyPct = pct(mtd.actual, mtd.ly);
  }

  const emg = companies.find((company) => company.id === "company_a");
  if (emg) {
    emg.currency = window.RevenueData.unit;
    emg.month = selectedRecord.month;
    emg.fy = String(selectedYear);
    emg.revenue = ytdActual;
    emg.revenueBudget = ytdBudget;
    emg.trend = revenueSeries.map((item) => item.actual);
    emg.comment = "Revenue values are loaded from data/revenues-data.js. Values are illustrative only and do not represent actual company performance.";
  }

  if (typeof formatMoney === "function") {
    formatMoney = function (value) {
      return `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 })} ${window.RevenueData.unit}`;
    };
  }

  if (typeof render === "function") render();

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
