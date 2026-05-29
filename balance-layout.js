(function () {
  const previousRender = render;

  render = function () {
    previousRender();
    moveBalanceBridgeBelowOperatingSection();
  };

  function moveBalanceBridgeBelowOperatingSection() {
    const sections = [...document.querySelectorAll("section.section")];
    const balanceBridge = findSectionByTitle(sections, "Debt / Cash / Net Debt bridge");
    const operatingIndicators = findSectionByTitle(sections, "Operating financial indicators");

    if (!balanceBridge || !operatingIndicators) return;
    operatingIndicators.insertAdjacentElement("afterend", balanceBridge);
  }

  function findSectionByTitle(sections, title) {
    return sections.find((section) => section.querySelector("h2")?.textContent.trim() === title);
  }

  moveBalanceBridgeBelowOperatingSection();
})();
