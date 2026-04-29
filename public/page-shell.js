(() => {
  const THEME_KEY = "convertpro-theme";

  const getSavedTheme = () => {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (_) {
      return null;
    }
  };

  const saveTheme = (theme) => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (_) {}
  };

  const getResolvedTheme = () => {
    const saved = getSavedTheme();
    if (saved === "light" || saved === "dark") return saved;
    const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    return prefersLight ? "light" : "dark";
  };

  const applyTheme = (theme) => {
    if (theme !== "light" && theme !== "dark") return;
    document.documentElement.setAttribute("data-theme", theme);
    const btn = document.getElementById("themeBulb");
    if (!btn) return;
    btn.setAttribute("title", `Theme: ${theme === "light" ? "Light" : "Dark"}`);
    btn.setAttribute("aria-label", `Switch to ${theme === "light" ? "dark" : "light"} mode`);
  };

  const initThemeToggle = () => {
    const btn = document.getElementById("themeBulb");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next);
      saveTheme(next);
    });
  };

  const loadGlassEnhancements = () => {
    const isApple = /mac|iphone|ipad|ipod/i.test((navigator.platform || "") + " " + (navigator.userAgent || ""));
    if (isApple) return;

    if (!document.querySelector('link[data-glass-css="1"]')) {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "liquid-glass.css";
      css.dataset.glassCss = "1";
      document.head.appendChild(css);
    }
  };

  applyTheme(getResolvedTheme());
  initThemeToggle();
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(loadGlassEnhancements, { timeout: 1200 });
  } else {
    setTimeout(loadGlassEnhancements, 200);
  }
})();
