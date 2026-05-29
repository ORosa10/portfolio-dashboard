/*
  Dashboard data bridge.
  Loads anonymized EMG reporting data into the existing dashboard shape.
  This step updates company identity, period and top-level financial indicator values only.
  It does not change chart layouts or visual styling.
*/
(function () {
  if (!window.ReportingAdapter || !window.ReportingDataExample || typeof companies === "undefined") {
    return;
  }

  const adapter = window.ReportingAdapter;
  const latestPeriod = adapter.getLatestPeriod("EMG");
  const company = adapter.getCompany("EMG");
  const snapshot = adapter.getDashboardSnapshot("EMG", latestPeriod);

  if (!latestPeriod || !company || !snapshot) return;

  const [year, monthNumber] = latestPeriod.split("-").map(Number);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthName = monthNames[monthNumber - 1];

  const companyA = companies.find((item) => item.id === "company_a") || companies[0];
  if (!companyA) return;

  companyA.name = company.display_name || "Euromedia";
  companyA.logoText = "EUROMEDIA";
  companyA.sector = "Books / Media";
  companyA.month = monthName;
  companyA.fy = String(year);
  companyA.currency = "CZKm";

  const metrics = snapshot.metrics;
  const revenue = metrics.consolidated_revenues;
  const grossMargin = metrics.gross_margin;
  const grossMarginPct = metrics.gross_margin_pct;
  const ebitda = metrics.adjusted_ebitda;
  const ebitdaPct = metrics.adjusted_ebitda_pct;
  const capex = metrics.capex;
  const opcf = metrics.opcf;
  const debt = metrics.debt;
  const cash = metrics.cash;
  const leverage = metrics.net_debt_ltm_ebitda;

  companyA.revenue = revenue ? revenue.actual_ytd : companyA.revenue;
  companyA.revenueBudget = revenue ? revenue.budget_ytd : companyA.revenueBudget;
  companyA.ebitda = ebitda ? ebitda.actual_ytd : companyA.ebitda;
  companyA.ebitdaBudget = ebitda ? ebitda.budget_ytd : companyA.ebitdaBudget;
  companyA.cash = cash ? cash.actual_ytd : companyA.cash;
  companyA.netDebt = debt && cash ? debt.actual_ytd - cash.actual_ytd : companyA.netDebt;

  companyA.metrics = [
    createMetric("Revenues", revenue),
    {
      ...createMetric("Gross margin", grossMargin),
      unit: "CZKm / % of revenues",
      subRows: [createPercentSubMetric("% of revenues", grossMarginPct)],
    },
    {
      ...createMetric("Adjusted EBITDA", ebitda),
      unit: "CZKm / % of revenues",
      subRows: [createPercentSubMetric("% of revenues", ebitdaPct)],
    },
    createMetric("CAPEX", capex),
    createMetric("OpCF (EBITDA less Capex)", opcf),
    createMetric("Debt", debt),
    createMetric("Cash", cash),
    createMetric("Net debt / LTM EBITDA", leverage),
  ].filter(Boolean);

  if (typeof state !== "undefined") {
    state.period = `${monthName} ${year}`;
  }

  if (typeof render === "function") {
    render();
  }

  function createMetric(label, record) {
    if (!record) return null;

    return {
      label,
      unit: unitLabel(record),
      ytdActual: formatValue(record.actual_ytd, record.unit),
      ytdBudgetAbs: formatDelta(record.actual_ytd - record.budget_ytd, record.unit),
      ytdBudgetPct: formatVariance(record.actual_ytd, record.budget_ytd, record.unit),
      ytdBudgetGood: record.budget_variance_ytd.good,
      ytdLyAbs: formatDelta(record.actual_ytd - record.last_year_ytd, record.unit),
      ytdLyPct: formatVariance(record.actual_ytd, record.last_year_ytd, record.unit),
      ytdLyGood: record.last_year_variance_ytd.good,
      mtdActual: formatValue(record.actual_month, record.unit),
      mtdBudgetAbs: formatDelta(record.actual_month - record.budget_month, record.unit),
      mtdBudgetPct: formatVariance(record.actual_month, record.budget_month, record.unit),
      mtdBudgetGood: record.budget_variance_month.good,
      mtdLyAbs: formatDelta(record.actual_month - record.last_year_month, record.unit),
      mtdLyPct: formatVariance(record.actual_month, record.last_year_month, record.unit),
      mtdLyGood: record.last_year_variance_month.good,
    };
  }

  function createPercentSubMetric(label, record) {
    if (!record) return null;

    return {
      label,
      ytdActual: formatValue(record.actual_ytd, "%"),
      ytdBudgetAbs: formatDelta(record.actual_ytd - record.budget_ytd, "%"),
      ytdBudgetPct: formatDelta(record.actual_ytd - record.budget_ytd, "%"),
      ytdBudgetGood: record.budget_variance_ytd.good,
      ytdLyAbs: formatDelta(record.actual_ytd - record.last_year_ytd, "%"),
      ytdLyPct: formatDelta(record.actual_ytd - record.last_year_ytd, "%"),
      ytdLyGood: record.last_year_variance_ytd.good,
      mtdActual: formatValue(record.actual_month, "%"),
      mtdBudgetAbs: formatDelta(record.actual_month - record.budget_month, "%"),
      mtdBudgetPct: formatDelta(record.actual_month - record.budget_month, "%"),
      mtdBudgetGood: record.budget_variance_month.good,
      mtdLyAbs: formatDelta(record.actual_month - record.last_year_month, "%"),
      mtdLyPct: formatDelta(record.actual_month - record.last_year_month, "%"),
      mtdLyGood: record.last_year_variance_month.good,
    };
  }

  function unitLabel(record) {
    if (record.unit === "CZKm") return "CZKm";
    if (record.unit === "%") return "%";
    if (record.unit === "x") return "x";
    return record.unit;
  }

  function formatValue(value, unit) {
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
})();
