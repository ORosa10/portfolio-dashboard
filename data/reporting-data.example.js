/*
  Synthetic / anonymized reporting dataset for dashboard development.
  No values in this file represent actual company performance.
  EMG = Euromedia Group structure only.
*/
(function () {
  const START_YEAR = 2024;
  const END_YEAR = 2026;
  const END_MONTH_BY_YEAR = { 2024: 12, 2025: 12, 2026: 2 };
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const SEASONALITY = [0.78, 0.82, 0.92, 0.98, 1.03, 1.05, 0.90, 0.88, 1.08, 1.15, 1.28, 1.55];

  const metrics = [
    { id: "retail_revenue", label: "Retail", unit: "CZKm", section: "Revenue breakdown", type: "flow", lowerIsBetter: false },
    { id: "distribution_revenue", label: "Distribution", unit: "CZKm", section: "Revenue breakdown", type: "flow", lowerIsBetter: false },
    { id: "publishing_revenue", label: "Publishing", unit: "CZKm", section: "Revenue breakdown", type: "flow", lowerIsBetter: false },
    { id: "elimination_revenue", label: "Elimination", unit: "CZKm", section: "Revenue breakdown", type: "flow", lowerIsBetter: false },
    { id: "consolidated_revenues", label: "Consolidated Revenues", unit: "CZKm", section: "Financial Indicators", type: "flow", lowerIsBetter: false },
    { id: "gross_margin", label: "Gross Margin", unit: "CZKm", section: "Financial Indicators", type: "flow", lowerIsBetter: false },
    { id: "gross_margin_pct", label: "% of Revenues", unit: "%", section: "Financial Indicators", type: "margin", lowerIsBetter: false },
    { id: "adjusted_ebitda", label: "Adjusted EBITDA", unit: "CZKm", section: "Financial Indicators", type: "flow", lowerIsBetter: false },
    { id: "adjusted_ebitda_pct", label: "% of Revenues", unit: "%", section: "Financial Indicators", type: "margin", lowerIsBetter: false },
    { id: "capex", label: "CAPEX", unit: "CZKm", section: "Financial Indicators", type: "flow", lowerIsBetter: true },
    { id: "opcf", label: "OpCF (EBITDA less Capex)", unit: "CZKm", section: "Financial Indicators", type: "flow", lowerIsBetter: false },
    { id: "debt", label: "Debt", unit: "CZKm", section: "Balance Sheet / Leverage", type: "stock", lowerIsBetter: true },
    { id: "cash", label: "Cash", unit: "CZKm", section: "Balance Sheet / Leverage", type: "stock", lowerIsBetter: false },
    { id: "net_debt_ltm_ebitda", label: "Net Debt / LTM EBITDA", unit: "x", section: "Balance Sheet / Leverage", type: "ratio", lowerIsBetter: true },
    { id: "published_titles", label: "# of published titles", unit: "count", section: "KPIs", type: "flow", lowerIsBetter: false },
  ];

  function createRandom(seed) {
    let value = seed;
    return function random() {
      value = (value * 1664525 + 1013904223) % 4294967296;
      return value / 4294967296;
    };
  }

  const random = createRandom(20260529);
  const between = (min, max) => min + (max - min) * random();
  const rounded = (value, decimals = 4) => Number(value.toFixed(decimals));
  const period = (year, month) => `${year}-${String(month).padStart(2, "0")}`;

  function generateMonthValues(year, month) {
    const monthIndex = month - 1;
    const yearGrowth = 1 + 0.055 * (year - START_YEAR);
    const seasonality = SEASONALITY[monthIndex];
    const noise = (range) => between(1 - range, 1 + range);
    const lyFactor = 1 / 1.055;

    const retail = 120 * yearGrowth * seasonality * noise(0.08);
    const distribution = 92 * yearGrowth * seasonality * noise(0.10);
    const publishing = 31 * yearGrowth * seasonality * noise(0.14);
    const elimination = -11 * yearGrowth * seasonality * noise(0.08);
    const revenue = retail + distribution + publishing + elimination;
    const grossMargin = revenue * between(0.365, 0.405);
    const ebitda = revenue * between(0.055, 0.095);
    const capex = between(6.5, 14.5) * (1 + 0.02 * (year - START_YEAR));
    const opcf = ebitda - capex;
    const monthNumber = (year - START_YEAR) * 12 + month;
    const debt = Math.max(250, 560 - 4 * monthNumber + between(-45, 45));
    const cash = Math.max(30, 110 + 1.8 * monthNumber + between(-25, 35));
    const netDebt = debt - cash;
    const leverage = Math.max(0.2, Math.min(3.5, netDebt / Math.max(80, ebitda * 12)));
    const titles = Math.round(Math.max(70, 155 * seasonality * noise(0.15)));

    const budgetRetail = 118 * yearGrowth * seasonality * noise(0.04);
    const budgetDistribution = 91 * yearGrowth * seasonality * noise(0.05);
    const budgetPublishing = 32 * yearGrowth * seasonality * noise(0.06);
    const budgetElimination = -10.8 * yearGrowth * seasonality * noise(0.03);
    const budgetRevenue = budgetRetail + budgetDistribution + budgetPublishing + budgetElimination;
    const budgetGrossMargin = budgetRevenue * between(0.370, 0.400);
    const budgetEbitda = budgetRevenue * between(0.060, 0.090);
    const budgetCapex = between(7.5, 15.0) * (1 + 0.02 * (year - START_YEAR));
    const budgetDebt = Math.max(260, 555 - 3 * monthNumber + between(-30, 30));
    const budgetCash = Math.max(25, 100 + 1.5 * monthNumber + between(-20, 25));
    const budgetNetDebt = budgetDebt - budgetCash;
    const budgetLeverage = Math.max(0.2, Math.min(3.5, budgetNetDebt / Math.max(80, budgetEbitda * 12)));

    const lyRetail = 120 * yearGrowth * lyFactor * seasonality * noise(0.08);
    const lyDistribution = 92 * yearGrowth * lyFactor * seasonality * noise(0.10);
    const lyPublishing = 31 * yearGrowth * lyFactor * seasonality * noise(0.14);
    const lyElimination = -11 * yearGrowth * lyFactor * seasonality * noise(0.08);
    const lyRevenue = lyRetail + lyDistribution + lyPublishing + lyElimination;
    const lyGrossMargin = lyRevenue * between(0.360, 0.400);
    const lyEbitda = lyRevenue * between(0.050, 0.090);
    const lyCapex = between(6.8, 14.8) * (1 + 0.02 * (year - START_YEAR));
    const lyDebt = Math.max(250, 570 - 4 * (monthNumber - 12) + between(-45, 45));
    const lyCash = Math.max(30, 105 + 1.6 * (monthNumber - 12) + between(-25, 35));
    const lyNetDebt = lyDebt - lyCash;
    const lyLeverage = Math.max(0.2, Math.min(3.5, lyNetDebt / Math.max(80, lyEbitda * 12)));
    const lyTitles = Math.round(Math.max(70, 150 * seasonality * noise(0.12)));

    return {
      actual: {
        retail_revenue: retail,
        distribution_revenue: distribution,
        publishing_revenue: publishing,
        elimination_revenue: elimination,
        consolidated_revenues: revenue,
        gross_margin: grossMargin,
        gross_margin_pct: grossMargin / revenue,
        adjusted_ebitda: ebitda,
        adjusted_ebitda_pct: ebitda / revenue,
        capex,
        opcf,
        debt,
        cash,
        net_debt_ltm_ebitda: leverage,
        published_titles: titles,
      },
      budget: {
        retail_revenue: budgetRetail,
        distribution_revenue: budgetDistribution,
        publishing_revenue: budgetPublishing,
        elimination_revenue: budgetElimination,
        consolidated_revenues: budgetRevenue,
        gross_margin: budgetGrossMargin,
        gross_margin_pct: budgetGrossMargin / budgetRevenue,
        adjusted_ebitda: budgetEbitda,
        adjusted_ebitda_pct: budgetEbitda / budgetRevenue,
        capex: budgetCapex,
        opcf: budgetEbitda - budgetCapex,
        debt: budgetDebt,
        cash: budgetCash,
        net_debt_ltm_ebitda: budgetLeverage,
        published_titles: Math.round(Math.max(70, 160 * seasonality * noise(0.10))),
      },
      lastYear: {
        retail_revenue: lyRetail,
        distribution_revenue: lyDistribution,
        publishing_revenue: lyPublishing,
        elimination_revenue: lyElimination,
        consolidated_revenues: lyRevenue,
        gross_margin: lyGrossMargin,
        gross_margin_pct: lyGrossMargin / lyRevenue,
        adjusted_ebitda: lyEbitda,
        adjusted_ebitda_pct: lyEbitda / lyRevenue,
        capex: lyCapex,
        opcf: lyEbitda - lyCapex,
        debt: lyDebt,
        cash: lyCash,
        net_debt_ltm_ebitda: lyLeverage,
        published_titles: lyTitles,
      },
    };
  }

  function generateReportingData() {
    const periods = [];
    const records = [];
    const cumulative = new Map();

    for (let year = START_YEAR; year <= END_YEAR; year += 1) {
      const endMonth = END_MONTH_BY_YEAR[year];
      for (let month = 1; month <= endMonth; month += 1) {
        const periodKey = period(year, month);
        const values = generateMonthValues(year, month);
        periods.push(periodKey);

        metrics.forEach((metric) => {
          const metricKey = `${year}-${metric.id}`;
          const actualMonth = values.actual[metric.id];
          const budgetMonth = values.budget[metric.id];
          const lastYearMonth = values.lastYear[metric.id];
          let actualYtd = actualMonth;
          let budgetYtd = budgetMonth;
          let lastYearYtd = lastYearMonth;

          if (metric.type === "flow") {
            const running = cumulative.get(metricKey) || { actual: 0, budget: 0, lastYear: 0 };
            running.actual += actualMonth;
            running.budget += budgetMonth;
            running.lastYear += lastYearMonth;
            cumulative.set(metricKey, running);
            actualYtd = running.actual;
            budgetYtd = running.budget;
            lastYearYtd = running.lastYear;
          }

          if (metric.id === "gross_margin_pct") {
            const gm = cumulative.get(`${year}-gross_margin`);
            const rev = cumulative.get(`${year}-consolidated_revenues`);
            actualYtd = gm.actual / rev.actual;
            budgetYtd = gm.budget / rev.budget;
            lastYearYtd = gm.lastYear / rev.lastYear;
          }

          if (metric.id === "adjusted_ebitda_pct") {
            const ebitda = cumulative.get(`${year}-adjusted_ebitda`);
            const rev = cumulative.get(`${year}-consolidated_revenues`);
            actualYtd = ebitda.actual / rev.actual;
            budgetYtd = ebitda.budget / rev.budget;
            lastYearYtd = ebitda.lastYear / rev.lastYear;
          }

          records.push({
            company_code: "EMG",
            company_name: "Euromedia Group",
            period: periodKey,
            month: MONTHS[month - 1],
            fiscal_year: year,
            metric_id: metric.id,
            metric_label: metric.label,
            section: metric.section,
            type: metric.type,
            unit: metric.unit,
            lower_is_better: metric.lowerIsBetter,
            actual_month: rounded(actualMonth),
            budget_month: rounded(budgetMonth),
            last_year_month: rounded(lastYearMonth),
            actual_ytd: rounded(actualYtd),
            budget_ytd: rounded(budgetYtd),
            last_year_ytd: rounded(lastYearYtd),
          });
        });
      }
    }

    return {
      metadata: {
        dataset_type: "generated_anonymized_reporting_example",
        confidentiality: "All numeric values are randomly generated and do not represent actual company performance.",
        source_workbook_used_for_structure_only: "202604_ROC Alpha Portfolio Onepagers_OR.xlsx",
        source_sheet_used_for_structure_only: "EMG",
        history_start_period: "2024-01",
        history_end_period: "2026-02",
        current_period: "2026-02",
      },
      companies: [{ company_code: "EMG", company_name: "Euromedia Group", display_name: "Euromedia" }],
      periods,
      metrics,
      records,
      dashboard_mapping: {
        revenue: "consolidated_revenues",
        gross_margin: "gross_margin",
        gross_margin_pct: "gross_margin_pct",
        adjusted_ebitda: "adjusted_ebitda",
        adjusted_ebitda_pct: "adjusted_ebitda_pct",
        capex: "capex",
        opcf: "opcf",
        debt: "debt",
        cash: "cash",
        net_debt_ltm_ebitda: "net_debt_ltm_ebitda",
        revenue_breakdown: ["retail_revenue", "distribution_revenue", "publishing_revenue", "elimination_revenue"],
      },
    };
  }

  const generated = generateReportingData();

  if (typeof window !== "undefined") {
    window.ReportingDataExample = generated;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = generated;
  }
})();
