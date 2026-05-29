(function () {
  const previousRender = render;

  const detailFlow = [
    "Revenues",
    "Gross margin",
    "Adjusted EBITDA",
    "OpCF (EBITDA less Capex)",
  ];

  render = function () {
    previousRender();
    addDetailNavigation();
  };

  function addDetailNavigation() {
    if (!detailFlow.includes(state.detailMetric)) return;
    if (document.querySelector(".detail-page-nav")) return;

    const currentIndex = detailFlow.indexOf(state.detailMetric);
    const previousMetric = detailFlow[currentIndex - 1];
    const nextMetric = detailFlow[currentIndex + 1];
    const anchor = document.querySelector(".back[data-back-detail]");
    if (!anchor) return;

    const nav = document.createElement("div");
    nav.className = "detail-page-nav";
    nav.innerHTML = `
      <div>
        ${previousMetric ? `<button class="detail-nav-link left" data-detail-nav="${previousMetric}">← ${shortLabel(previousMetric)}</button>` : ""}
      </div>
      <div>
        ${nextMetric ? `<button class="detail-nav-link right" data-detail-nav="${nextMetric}">${shortLabel(nextMetric)} →</button>` : ""}
      </div>
    `;

    anchor.insertAdjacentElement("afterend", nav);

    nav.querySelectorAll("[data-detail-nav]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedMetric = button.dataset.detailNav;
        state.detailMetric = button.dataset.detailNav;
        render();
      });
    });
  }

  function shortLabel(metric) {
    if (metric === "Revenues") return "Revenue";
    if (metric === "Gross margin") return "Gross Margin";
    if (metric === "Adjusted EBITDA") return "Adjusted EBITDA";
    return "OpCF";
  }

  const style = document.createElement("style");
  style.textContent = `
    .detail-page-nav {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin: 0 0 18px;
    }

    .detail-page-nav > div:last-child {
      text-align: right;
    }

    .detail-nav-link {
      border: 0;
      background: transparent;
      padding: 0;
      color: var(--ink);
      font-size: 13px;
      font-weight: 900;
      letter-spacing: .14em;
      text-transform: uppercase;
      border-bottom: 2px solid var(--ink);
      cursor: pointer;
    }

    .detail-nav-link:hover {
      color: #06DB49;
      border-bottom-color: #06DB49;
    }
  `;
  document.head.appendChild(style);

  addDetailNavigation();
})();
