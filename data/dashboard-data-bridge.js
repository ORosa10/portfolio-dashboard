/*
  Minimal dashboard data bridge.
  First integration step: load anonymized EMG data and update company identity / period only.
  No chart or metric values are changed in this step.
*/
(function () {
  if (!window.ReportingAdapter || !window.ReportingDataExample || typeof companies === "undefined") {
    return;
  }

  const adapter = window.ReportingAdapter;
  const latestPeriod = adapter.getLatestPeriod("EMG");
  const company = adapter.getCompany("EMG");

  if (!latestPeriod || !company) return;

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

  if (typeof state !== "undefined") {
    state.period = `${monthName} ${year}`;
  }

  if (typeof render === "function") {
    render();
  }
})();
