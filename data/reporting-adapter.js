/*
  Reporting data adapter.
  This is a thin helper layer between the anonymized reporting dataset and the dashboard UI.
  It does not contain real company values.
*/
(function () {
  function getDataset() {
    if (typeof window !== "undefined" && window.ReportingDataExample) {
      return window.ReportingDataExample;
    }
    if (typeof module !== "undefined" && module.exports) {
      return require("./reporting-data.example.js");
    }
    throw new Error("ReportingDataExample is not loaded.");
  }

  function getLatestPeriod(companyCode = "EMG") {
    const dataset = getDataset();
    const periods = dataset.records
      .filter((record) => record.company_code === companyCode)
      .map((record) => record.period)
      .sort();
    return periods[periods.length - 1] || null;
  }

  function getCompany(companyCode = "EMG") {
    const dataset = getDataset();
    return dataset.companies.find((company) => company.company_code === companyCode) || null;
  }

  function getMetricDefinition(metricId) {
    const dataset = getDataset();
    return dataset.metrics.find((metric) => metric.id === metricId) || null;
  }

  function getMetricRecord(companyCode, period, metricId) {
    const dataset = getDataset();
    return dataset.records.find(
      (record) =>
        record.company_code === companyCode &&
        record.period === period &&
        record.metric_id === metricId
    ) || null;
  }

  function getRecordsForPeriod(companyCode, period) {
    const dataset = getDataset();
    return dataset.records.filter(
      (record) => record.company_code === companyCode && record.period === period
    );
  }

  function getSeries(companyCode, metricId, valueKey = "actual_ytd") {
    const dataset = getDataset();
    return dataset.records
      .filter((record) => record.company_code === companyCode && record.metric_id === metricId)
      .sort((a, b) => a.period.localeCompare(b.period))
      .map((record) => ({
        period: record.period,
        month: record.month,
        fiscal_year: record.fiscal_year,
        value: record[valueKey],
        actual_month: record.actual_month,
        budget_month: record.budget_month,
        last_year_month: record.last_year_month,
        actual_ytd: record.actual_ytd,
        budget_ytd: record.budget_ytd,
        last_year_ytd: record.last_year_ytd,
      }));
  }

  function variance(actual, compare, lowerIsBetter = false) {
    const delta = actual - compare;
    const pct = compare === 0 ? null : actual / compare - 1;
    const good = Math.abs(delta) < 0.000001 ? true : lowerIsBetter ? delta <= 0 : delta >= 0;
    return { delta, pct, good };
  }

  function getDashboardSnapshot(companyCode = "EMG", period = getLatestPeriod(companyCode)) {
    const dataset = getDataset();
    const mapping = dataset.dashboard_mapping;
    const metricIds = [
      mapping.revenue,
      mapping.gross_margin,
      mapping.gross_margin_pct,
      mapping.adjusted_ebitda,
      mapping.adjusted_ebitda_pct,
      mapping.capex,
      mapping.opcf,
      mapping.debt,
      mapping.cash,
      mapping.net_debt_ltm_ebitda,
    ];

    const metrics = Object.fromEntries(
      metricIds.map((metricId) => {
        const record = getMetricRecord(companyCode, period, metricId);
        if (!record) return [metricId, null];
        return [
          metricId,
          {
            ...record,
            budget_variance_ytd: variance(record.actual_ytd, record.budget_ytd, record.lower_is_better),
            last_year_variance_ytd: variance(record.actual_ytd, record.last_year_ytd, record.lower_is_better),
            budget_variance_month: variance(record.actual_month, record.budget_month, record.lower_is_better),
            last_year_variance_month: variance(record.actual_month, record.last_year_month, record.lower_is_better),
          },
        ];
      })
    );

    const revenueBreakdown = (mapping.revenue_breakdown || [])
      .map((metricId) => getMetricRecord(companyCode, period, metricId))
      .filter(Boolean);

    return {
      company: getCompany(companyCode),
      period,
      metrics,
      revenueBreakdown,
    };
  }

  const adapter = {
    getDataset,
    getLatestPeriod,
    getCompany,
    getMetricDefinition,
    getMetricRecord,
    getRecordsForPeriod,
    getSeries,
    getDashboardSnapshot,
    variance,
  };

  if (typeof window !== "undefined") {
    window.ReportingAdapter = adapter;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = adapter;
  }
})();
