(function () {
  const previousRender = render;

  const leverageData = {
    YTD: { actual: 0.5, budget: 0.7, ly: 0.6 },
    Monthly: { actual: 0.5, budget: 0.7, ly: 0.6 },
  };

  render = function () {
    previousRender();
    addLeverageOverlay();
  };

  function addLeverageOverlay() {
    const balanceSection = findSectionByTitle("Debt / Cash / Net Debt bridge");
    if (!balanceSection || balanceSection.dataset.leverageOverlay === "true") return;

    const chart = balanceSection.querySelector(".balance-bridge-chart");
    if (!chart) return;

    balanceSection.dataset.leverageOverlay = "true";
    chart.classList.add("with-leverage-overlay");

    const overlay = document.createElement("div");
    overlay.className = "leverage-overlay";
    overlay.innerHTML = `
      <div class="leverage-right-axis">
        <span>1.0x</span>
        <span>0.5x</span>
        <span>0.0x</span>
      </div>
      ${renderLeveragePoint("actual", leverageData[state.companyBridgeMode].actual)}
      ${renderLeveragePoint("budget", leverageData[state.companyBridgeMode].budget)}
      ${renderLeveragePoint("ly", leverageData[state.companyBridgeMode].ly)}
    `;

    chart.appendChild(overlay);

    overlay.querySelectorAll("[data-leverage-detail]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedMetric = "Net debt / LTM EBITDA";
        state.detailMetric = "Net debt / LTM EBITDA";
        state.detailMode = state.companyBridgeMode === "Monthly" ? "MTD" : "YTD";
        render();
      });
    });
  }

  function renderLeveragePoint(scenario, value) {
    const topPct = 100 - Math.max(0, Math.min(1, value / 1.0)) * 100;
    return `
      <button class="leverage-point ${scenario}" style="top:${topPct}%;" data-leverage-detail="Net debt / LTM EBITDA" title="Open Net debt / LTM EBITDA detail">
        <span class="leverage-dot"></span>
        <span class="leverage-value">${value.toFixed(1)}x</span>
      </button>
    `;
  }

  function findSectionByTitle(title) {
    return [...document.querySelectorAll("section.section")].find(
      (section) => section.querySelector("h2")?.textContent.trim() === title
    );
  }

  const style = document.createElement("style");
  style.textContent = `
    .balance-bridge-chart.with-leverage-overlay {
      position: relative;
      padding-right: 86px !important;
    }

    .leverage-overlay {
      position: absolute;
      top: 24px;
      bottom: 86px;
      left: 78px;
      right: 86px;
      pointer-events: none;
    }

    .leverage-right-axis {
      position: absolute;
      top: 0;
      bottom: 0;
      right: -62px;
      width: 48px;
      border-left: 1px solid #D8D6D0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;
      padding-left: 8px;
      color: #817C75;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: .04em;
    }

    .leverage-point {
      position: absolute;
      width: 44px;
      height: 32px;
      transform: translate(-50%, -50%);
      border: 0;
      background: transparent;
      padding: 0;
      cursor: pointer;
      pointer-events: auto;
    }

    .leverage-point.actual { left: 16.666%; }
    .leverage-point.budget { left: 50%; }
    .leverage-point.ly { left: 83.333%; }

    .leverage-dot {
      display: block;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #000000;
      border: 3px solid #06DB49;
      box-shadow: 0 0 0 3px rgba(6, 219, 73, .16);
      margin: 0 auto;
    }

    .leverage-value {
      display: block;
      margin-top: 4px;
      color: #000000;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: .05em;
      white-space: nowrap;
      text-align: center;
    }

    .leverage-point:hover .leverage-dot {
      transform: scale(1.16);
    }

    .balance-bridge-chart.with-leverage-overlay + .compact-bridge-legend::after {
      content: "Net Debt / EBITDA";
      display: inline-flex;
      align-items: center;
      margin-left: 22px;
      color: #000000;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: .14em;
      text-transform: uppercase;
    }
  `;
  document.head.appendChild(style);

  addLeverageOverlay();
})();
