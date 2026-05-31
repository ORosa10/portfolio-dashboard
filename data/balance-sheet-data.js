/* Balance sheet and leverage data source generated from 202604_ROC Alpha Portfolio Onepagers_Dummy.xlsx.
   Actuals: EMG_act; Budget: EMG_bud; dates in row 11; LY = actual - 12M. */
(function () {
  const periods = ["2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06", "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const metrics = {"net_debt": {"label": "Net debt", "sourceLabel": "NET DEBT", "actualRow": 22, "budgetRow": 22, "unit": "CZKm", "lowerIsBetter": true}, "debt": {"label": "Debt", "sourceLabel": "Debt", "actualRow": 23, "budgetRow": 23, "unit": "CZKm", "lowerIsBetter": true}, "cash": {"label": "Cash", "sourceLabel": "Cash", "actualRow": 24, "budgetRow": 24, "unit": "CZKm", "lowerIsBetter": false}, "net_debt_ltm_ebitda": {"label": "Net debt / LTM EBITDA", "sourceLabel": "Net Debt / LTM EBITDA", "actualRow": 25, "budgetRow": 25, "unit": "x", "lowerIsBetter": true}};
  const raw = {"net_debt": {"actual": [965.0, 928.0, 965.0, 968.0, 918.0, 933.0, 914.0, 940.0, 962.0, 950.0, 945.0, 959.0, 970.0, 893.0, null, null, null, null, null, null, null, null, null, null], "budget": [965.0, 928.0, 965.0, 968.0, 918.0, 933.0, 914.0, 940.0, 962.0, 950.0, 945.0, 959.0, 970.0, 893.0, 1310.8842, 1351.532, 1397.2632, 1401.7795, 1411.593, 1415.1972, 1386.6752, 1359.4494, 1334.4361, 841.9263], "ly": [956.0, 895.0, 933.0, 876.0, 884.0, 925.0, 913.0, 943.0, 915.0, 934.0, 883.0, 957.0, 965.0, 928.0, 965.0, 968.0, 918.0, 933.0, 914.0, 940.0, 962.0, 950.0, 945.0, 959.0]}, "debt": {"actual": [972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, null, null, null, null, null, null, null, null, null, null], "budget": [972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 1324.1974, 1364.1974, 1414.1974, 1419.6382, 1429.6382, 1429.6382, 1409.6382, 1389.6382, 1364.6382, 905.9605], "ly": [972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0, 972.0]}, "cash": {"actual": [7.0, 44.0, 7.0, 4.0, 54.0, 39.0, 58.0, 32.0, 10.0, 22.0, 27.0, 13.0, 2.0, 79.0, null, null, null, null, null, null, null, null, null, null], "budget": [7.0, 44.0, 7.0, 4.0, 54.0, 39.0, 58.0, 32.0, 10.0, 22.0, 27.0, 13.0, 2.0, 79.0, 13.3132, 12.6654, 16.9342, 17.8587, 18.0452, 14.441, 22.963, 30.1887, 30.202, 64.0343], "ly": [16.0, 77.0, 39.0, 96.0, 88.0, 47.0, 59.0, 29.0, 57.0, 38.0, 89.0, 15.0, 7.0, 44.0, 7.0, 4.0, 54.0, 39.0, 58.0, 32.0, 10.0, 22.0, 27.0, 13.0]}, "net_debt_ltm_ebitda": {"actual": [2.8511, 2.7748, 2.8174, 2.8524, 2.5331, 2.7853, 2.6989, 2.8005, 2.7325, 2.5539, 2.9423, 2.9424, 3.3541, 3.1409, null, null, null, null, null, null, null, null, null, null], "budget": [2.8511, 2.7748, 2.8174, 2.8524, 2.5331, 2.7853, 2.6989, 2.8005, 2.7325, 2.5539, 2.9423, 2.9424, 3.3541, 3.1409, 4.6795, 4.7709, 4.6939, 4.6611, 4.5344, 4.3167, 4.1498, 3.8152, 3.6966, 2.0759], "ly": [4.6219, 4.1551, 3.9671, 3.108, 2.8368, 2.6495, 2.2194, 2.1986, 2.0869, 2.0054, 2.024, 3.1115, 2.8511, 2.7748, 2.8174, 2.8524, 2.5331, 2.7853, 2.6989, 2.8005, 2.7325, 2.5539, 2.9423, 2.9424]}};

  function build(metricId) {
    const metric = raw[metricId];
    return periods.map((period, index) => ({
      period,
      month: months[index],
      year: Number(period.slice(0, 4)),
      actual: metric.actual[index],
      budget: metric.budget[index],
      ly: metric.ly[index],
    }));
  }

  window.BalanceSheetData = {
    metadata: {
      unit: "CZKm",
      sourceWorkbook: "202604_ROC Alpha Portfolio Onepagers_Dummy.xlsx",
      actualSheet: "EMG_act",
      budgetSheet: "EMG_bud",
      dateRow: 11,
      lyRule: "actual_minus_12m",
    },
    metrics,
    records: Object.fromEntries(Object.keys(raw).map((metricId) => [metricId, build(metricId)])),
  };
})();
