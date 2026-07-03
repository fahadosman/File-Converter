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

  const enableLowPowerMode = () => {
    const ua = (navigator.userAgent || "").toLowerCase();
    const isAndroid = ua.includes("android");
    const isApple = /mac|iphone|ipad|ipod/i.test((navigator.platform || "") + " " + ua);
    const lowMemory = typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4;
    const path = window.location.pathname || "/";
    const isHome = path === "/" || path === "/index.html";
    if (!isAndroid && !isApple && !lowMemory && isHome) return;
    document.documentElement.classList.add("low-power-ui");
    const style = document.createElement("style");
    style.textContent = `
      .low-power-ui .background-glow { display: none !important; }
      .low-power-ui * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.08s !important; }
    `;
    document.head.appendChild(style);
  };

  const registerServiceWorker = () => {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  };

  const lazyLoadMedia = () => {
    document.querySelectorAll("img:not([loading])").forEach((img) => {
      img.setAttribute("loading", "lazy");
      img.setAttribute("decoding", "async");
    });
  };

  const sendRumMetric = (payload) => {
    if (!navigator.sendBeacon) return;
    const body = JSON.stringify(payload);
    navigator.sendBeacon("/api/rum", new Blob([body], { type: "application/json" }));
  };

  const trackWebVitals = () => {
    if (!("PerformanceObserver" in window)) return;
    let cls = 0;
    try {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) cls += entry.value || 0;
        }
      }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lcp = entries[entries.length - 1];
        if (lcp) {
          sendRumMetric({ metric: "LCP", value: Math.round(lcp.startTime), path: location.pathname });
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const inp = entries[entries.length - 1];
        if (inp) {
          sendRumMetric({ metric: "INP", value: Math.round(inp.duration || 0), path: location.pathname });
        }
      }).observe({ type: "event", durationThreshold: 40, buffered: true });
      window.addEventListener("pagehide", () => {
        sendRumMetric({ metric: "CLS", value: Number(cls.toFixed(4)), path: location.pathname });
      });
    } catch (_) {}
  };

  document.documentElement.classList.add("flat-ui");
  applyTheme(getResolvedTheme());
  enableLowPowerMode();
  initThemeToggle();
  lazyLoadMedia();
  registerServiceWorker();
  trackWebVitals();
})();
