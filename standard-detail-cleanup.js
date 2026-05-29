(function () {
  const previousRender = render;

  render = function () {
    previousRender();
    removeStandardDetailPlaceholders();
  };

  function removeStandardDetailPlaceholders() {
    if (state.detailMetric) return;

    const grids = [...document.querySelectorAll(".grid-2")];
    grids.forEach((grid) => {
      const titles = [...grid.querySelectorAll("h2")].map((node) => node.textContent.trim());
      const hasPlaceholderDetail = titles.some((title) => title.endsWith(" detail"));
      const hasManagementCommentary = titles.includes("Management commentary");

      if (hasPlaceholderDetail && hasManagementCommentary) {
        grid.remove();
      }
    });
  }

  removeStandardDetailPlaceholders();
})();
