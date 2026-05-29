(function () {
  const previousRender = render;
  const balanceFlow = ["Debt", "Cash", "Net debt / LTM EBITDA"];

  render = function () {
    if (balanceFlow.includes(state.detailMetric)) {
      state.debtChartMode = "YTD";
      state.cashChartMode = "YTD";
      state.leverageChartMode = "YTD";
    }

    previousRender();
    polishBalanceDetailPages();
  };

  function polishBalanceDetailPages() {
    if (!balanceFlow.includes(state.detailMetric)) return;

    removeBalanceMonthlyToggle();
    addBalanceDetailNavigation();
    removeCashBreakdown();
    removeLeverageCommentColumn();
  }

  function removeBalanceMonthlyToggle() {
    const developmentSection = findSectionByTitle(`${detailTitleBase(state.detailMetric)} development`);
    developmentSection?.querySelector(".toggle")?.remove();
  }

  function addBalanceDetailNavigation() {
    if (document.querySelector(".balance-detail-nav")) return;

    const currentIndex = balanceFlow.indexOf(state.detailMetric);
    const previousMetric = balanceFlow[currentIndex - 1];
    const nextMetric = balanceFlow[currentIndex + 1];
    const anchor = document.querySelector(".back[data-back-detail]");
    if (!anchor) return;

    const nav = document.createElement("div");
    nav.className = "detail-page-nav balance-detail-nav";
    nav.innerHTML = `
      <div>
        ${previousMetric ? `<button class="detail-nav-link left" data-balance-detail-nav="${previousMetric}">← ${shortLabel(previousMetric)}</button>` : ""}
      </div>
      <div>
        ${nextMetric ? `<button class="detail-nav-link right" data-balance-detail-nav="${nextMetric}">${shortLabel(nextMetric)} →</button>` : ""}
      </div>
    `;

    anchor.insertAdjacentElement("afterend", nav);

    nav.querySelectorAll("[data-balance-detail-nav]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedMetric = button.dataset.balanceDetailNav;
        state.detailMetric = button.dataset.balanceDetailNav;
        state.detailMode = "YTD";
        render();
      });
    });
  }

  function removeCashBreakdown() {
    if (state.detailMetric !== "Cash") return;
    findSectionByTitle("Cash breakdown")?.remove();
  }

  function removeLeverageCommentColumn() {
    if (state.detailMetric !== "Net debt / LTM EBITDA") return;

    const section = findSectionByTitle("Net debt / LTM EBITDA breakdown");
    const table = section?.querySelector("table");
    if (!table || table.dataset.commentRemoved === "true") return;

    table.dataset.commentRemoved = "true";
    table.querySelectorAll("tr").forEach((row) => {
      row.lastElementChild?.remove();
    });
  }

  function findSectionByTitle(title) {
    return [...document.querySelectorAll("section.section")].find(
      (section) => section.querySelector("h2")?.textContent.trim() === title
    );
  }

  function detailTitleBase(metric) {
    if (metric === "Net debt / LTM EBITDA") return "Net debt / LTM EBITDA";
    return metric;
  }

  function shortLabel(metric) {
    if (metric === "Net debt / LTM EBITDA") return "Net debt / EBITDA";
    return metric;
  }

  polishBalanceDetailPages();
})();
