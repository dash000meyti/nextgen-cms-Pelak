/** Runs before React hydrate; reads config from `<html data-*>` attributes. */
export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var root = document.documentElement;
    var stored = localStorage.getItem(root.dataset.themeStorageKey || "");
    var fallback = root.dataset.defaultTheme;
    var theme =
      stored === "light" || stored === "dark"
        ? stored
        : fallback === "dark"
          ? "dark"
          : "light";
    if (theme === "dark") root.classList.add("dark");
  } catch (_) {}
})();
`.trim();
