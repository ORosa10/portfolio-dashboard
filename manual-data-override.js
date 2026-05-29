/* Manual data override for quick dashboard testing. No confidential values. */
(function () {
  const revenueSeries = [
    { month: "Jan", actual: 200, budget: 200, ly: 190 },
    { month: "Feb", actual: 210, budget: 210, ly: 200 },
    { month: "Mar", actual: 220, budget: 220, ly: 210 },
    { month: "Apr", actual: 230, budget: 230, ly: 220 },
    { month: "May", actual: 270, budget: 270, ly: 250 },
  ];

  const ytdActual = revenueSeries.reduce((sum, item) => sum + item.actual, 0);
  const ytdBudget = revenueSeries.reduce((sum, item) => sum + item.budget, 0);
  const ytdLy = revenueSeries.reduce((sum, item) => sum + item.ly, 0);
  const may = revenueSeries[revenueSeries.length - 1];

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

  revenueMonths.splice(0, revenueMonths.length, ...revenueSeries);

  const revenueMetric = baseMetrics.find((metric) => metric.label === "Revenues");
  if (revenueMetric) {
    revenueMetric.unit = "CZKm";
    revenueMetric.ytdActual = fmt(ytdActual);
    revenueMetric.ytdBudgetAbs = abs(ytdActual, ytdBudget);
    revenueMetric.ytdBudgetPct = pct(ytdActual, ytdBudget);
    revenueMetric.ytdLyAbs = abs(ytdActual, ytdLy);
    revenueMetric.ytdLyPct = pct(ytdActual, ytdLy);
    revenueMetric.mtdActual = fmt(may.actual);
    revenueMetric.mtdBudgetAbs = abs(may.actual, may.budget);
    revenueMetric.mtdBudgetPct = pct(may.actual, may.budget);
    revenueMetric.mtdLyAbs = abs(may.actual, may.ly);
    revenueMetric.mtdLyPct = pct(may.actual, may.ly);
  }

  const emg = companies.find((company) => company.id === "company_a");
  if (emg) {
    emg.currency = "CZKm";
    emg.revenue = ytdActual;
    emg.revenueBudget = ytdBudget;
    emg.trend = revenueSeries.map((item) => item.actual);
    emg.comment = "Manual test data loaded for Revenues. Values are illustrative only and do not represent actual company performance.";
  }

  if (typeof formatMoney === "function") {
    formatMoney = function (value) {
      return `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 })} CZKm`;
    };
  }

  if (typeof render === "function") render();
})();
