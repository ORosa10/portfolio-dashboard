/* Revenue data source for dashboard testing. No confidential values. */
window.RevenueData = {
  metricId: "revenues",
  label: "Revenues",
  sourceLabel: "Consolidated Revenues",
  unit: "CZKm",
  records: [
    { period: "2024-01", month: "Jan", year: 2024, actual: 160, budget: 158 },
    { period: "2024-02", month: "Feb", year: 2024, actual: 168, budget: 165 },
    { period: "2024-03", month: "Mar", year: 2024, actual: 176, budget: 172 },
    { period: "2024-04", month: "Apr", year: 2024, actual: 182, budget: 180 },
    { period: "2024-05", month: "May", year: 2024, actual: 195, budget: 190 },
    { period: "2024-06", month: "Jun", year: 2024, actual: 188, budget: 185 },
    { period: "2024-07", month: "Jul", year: 2024, actual: 170, budget: 172 },
    { period: "2024-08", month: "Aug", year: 2024, actual: 174, budget: 176 },
    { period: "2024-09", month: "Sep", year: 2024, actual: 205, budget: 198 },
    { period: "2024-10", month: "Oct", year: 2024, actual: 215, budget: 210 },
    { period: "2024-11", month: "Nov", year: 2024, actual: 245, budget: 238 },
    { period: "2024-12", month: "Dec", year: 2024, actual: 310, budget: 300 },

    { period: "2025-01", month: "Jan", year: 2025, actual: 180, budget: 178 },
    { period: "2025-02", month: "Feb", year: 2025, actual: 190, budget: 188 },
    { period: "2025-03", month: "Mar", year: 2025, actual: 200, budget: 198 },
    { period: "2025-04", month: "Apr", year: 2025, actual: 205, budget: 205 },
    { period: "2025-05", month: "May", year: 2025, actual: 250, budget: 240 },
    { period: "2025-06", month: "Jun", year: 2025, actual: 215, budget: 212 },
    { period: "2025-07", month: "Jul", year: 2025, actual: 198, budget: 202 },
    { period: "2025-08", month: "Aug", year: 2025, actual: 202, budget: 205 },
    { period: "2025-09", month: "Sep", year: 2025, actual: 228, budget: 225 },
    { period: "2025-10", month: "Oct", year: 2025, actual: 240, budget: 238 },
    { period: "2025-11", month: "Nov", year: 2025, actual: 275, budget: 270 },
    { period: "2025-12", month: "Dec", year: 2025, actual: 340, budget: 330 },

    { period: "2026-01", month: "Jan", year: 2026, actual: 200, budget: 200 },
    { period: "2026-02", month: "Feb", year: 2026, actual: 210, budget: 210 },
    { period: "2026-03", month: "Mar", year: 2026, actual: 220, budget: 220 },
    { period: "2026-04", month: "Apr", year: 2026, actual: 230, budget: 230 },
    { period: "2026-05", month: "May", year: 2026, actual: 270, budget: 270 }
  ]
};

(function enrichLastYearValues() {
  const byPeriod = new Map(window.RevenueData.records.map((record) => [record.period, record]));
  window.RevenueData.records.forEach((record) => {
    const lastYearPeriod = `${record.year - 1}-${String(Number(record.period.slice(5, 7))).padStart(2, "0")}`;
    const lastYearRecord = byPeriod.get(lastYearPeriod);
    record.ly = lastYearRecord ? lastYearRecord.actual : null;
  });
})();
