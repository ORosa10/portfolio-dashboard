(function () {
  const originalRenderCompanyDetail = renderCompanyDetail;

  function renderGrossMarginDetail(company) {
    const overview = [
      { label: "YTD Gross Margin", actual: "3,800.0", budget: "+50.0", ly: "+81.9", budgetGood: true, lyGood: true },
      { label: "YTD GM % of revenues", actual: "38.0%", budget: "+0.5pp", ly: "+0.4pp", budgetGood: true, lyGood: true },
      { label: "Monthly Gross Margin", actual: "3,800.0", budget: "+50.0", ly: "+81.9", budgetGood: true, lyGood: true },
      { label: "Monthly GM % of revenues", actual: "38.0%", budget: "+0.5pp", ly: "+0.4pp", budgetGood: true, lyGood: true },
    ];

    const breakdown = [
      { segment: "Business line A", actual: "1,615", margin: "38.0%", budget: "+35", ly: "+0.3pp", good: true },
      { segment: "Business line B", actual: "1,140", margin: "40.0%", budget: "+55", ly: "+0.8pp", good: true },
      { segment: "Business line C", actual: "665", margin: "35.0%", budget: "-30", ly: "-0.5pp", good: false },
      { segment: "Other", actual: "380", margin: "38.0%", budget: "-10", ly: "+0.1pp", good: false },
    ];

    const questions = [
      "Is the margin movement driven by mix, pricing or input-cost pressure?",
      "Which business line explains the largest variance vs budget?",
      "Is the current YTD margin level consistent with the full-year plan?",
    ];

    return `
      ${companyHeader(company)}
      <button class="back" data-back-detail>Back to financial indicators</button>
      ${section({
        title: "Gross Margin detail",
        kicker: `${company.name} · ${company.month} ${company.fy} · ${state.detailMode} focus`,
        right: `<span class="eyebrow">EURm / % of revenues</span>`,
        body: `
          <div class="summary-box">
            <div class="summary-title">Summary</div>
            <p>Gross Margin is above budget both in absolute terms and as a percentage of revenues. The main positive contribution comes from Business line B, while Business line C remains below plan.</p>
          </div>
        `,
      })}
      ${section({
        title: "Gross Margin overview",
        kicker: "Absolute gross margin and margin percentage",
        body: `<div class="grid-4">${overview.map(renderGrossMarginOverviewCard).join("")}</div>`,
      })}
      <div class="grid-2">
        ${section({
          title: "Gross Margin breakdown",
          kicker: "Segment / channel view",
          body: renderTable(
            ["Segment", "YTD Gross Margin", "GM %", "vs budget", "vs LY"],
            breakdown.map((row) => [
              row.segment,
              row.actual,
              row.margin,
              varianceBadge({ pct: row.budget, abs: "", good: row.good }),
              varianceBadge({ pct: row.ly, abs: "", good: row.ly.startsWith("+") }),
            ])
          ),
        })}
        ${section({
          title: "Follow-up questions",
          kicker: "For management discussion",
          dark: true,
          body: `<ol class="question-list">${questions.map((question) => `<li>${question}</li>`).join("")}</ol>`,
        })}
      </div>
    `;
  }

  function renderGrossMarginOverviewCard(item) {
    return `
      <div class="kpi">
        <div class="kpi-label">${item.label}</div>
        <div class="kpi-value">${item.actual}</div>
        ${varianceBadge({ label: "vs budget", pct: item.budget, abs: "", good: item.budgetGood })}
        ${varianceBadge({ label: "vs LY", pct: item.ly, abs: "", good: item.lyGood })}
      </div>
    `;
  }

  renderCompanyDetail = function () {
    const company = selectedCompany();
    if (state.detailMetric === "Gross margin") return renderGrossMarginDetail(company);
    return originalRenderCompanyDetail();
  };

  bindEvents = function () {
    document.querySelector("[data-action='portfolio']")?.addEventListener("click", () => {
      state.view = "portfolio";
      state.detailMetric = null;
      render();
    });
    document.querySelector("[data-action='company']")?.addEventListener("click", () => {
      state.view = "company";
      render();
    });
    document.getElementById("company-select")?.addEventListener("change", (event) => {
      state.selectedCompanyId = event.target.value;
      state.view = "company";
      state.detailMetric = null;
      render();
    });
    document.getElementById("period-select")?.addEventListener("change", (event) => {
      state.period = event.target.value;
      render();
    });
    document.querySelectorAll("[data-company-tile]").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedCompanyId = button.dataset.companyTile;
        state.view = "company";
        state.detailMetric = null;
        render();
      });
    });
    document.querySelectorAll("[data-open-detail]").forEach((button) => {
      button.addEventListener("click", () => {
        const metric = button.dataset.openDetail;
        state.selectedMetric = metric;
        state.detailMode = button.dataset.mode || "YTD";
        state.detailMetric = ["Revenues", "Gross margin", "Adjusted EBITDA"].includes(metric) ? metric : null;
        render();
      });
    });
    document.querySelector("[data-back-detail]")?.addEventListener("click", () => {
      state.detailMetric = null;
      render();
    });
    document.querySelectorAll("[data-revenue-chart]").forEach((button) => {
      button.addEventListener("click", () => {
        state.revenueChartMode = button.dataset.revenueChart;
        render();
      });
    });
  };

  render();
})();
