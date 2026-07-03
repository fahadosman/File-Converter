(() => {
  let loaded = false;
  let loading = false;

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }

  function lazyLoadMedia() {
    document.querySelectorAll("img:not([loading])").forEach((img) => {
      img.setAttribute("loading", "lazy");
      img.setAttribute("decoding", "async");
    });
  }

  function sendRumMetric(payload) {
    if (!navigator.sendBeacon) return;
    navigator.sendBeacon(
      "/api/rum",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    );
  }

  function trackWebVitals() {
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
        if (lcp) sendRumMetric({ metric: "LCP", value: Math.round(lcp.startTime), path: location.pathname });
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const inp = entries[entries.length - 1];
        if (inp) sendRumMetric({ metric: "INP", value: Math.round(inp.duration || 0), path: location.pathname });
      }).observe({ type: "event", durationThreshold: 40, buffered: true });
      window.addEventListener("pagehide", () => {
        sendRumMetric({ metric: "CLS", value: Number(cls.toFixed(4)), path: location.pathname });
      });
    } catch (_) {}
  }

  function loadAppRuntime() {
    if (loaded || loading) return;
    loading = true;
    const script = document.createElement("script");
    script.src = "script.min.js?v=20260703b";
    script.defer = true;
    script.onload = () => {
      loaded = true;
      loading = false;
      detachEarlyTriggers();
    };
    script.onerror = () => {
      loading = false;
    };
    document.body.appendChild(script);
  }

  const earlyTriggers = ["pointerdown", "keydown", "touchstart"];

  function detachEarlyTriggers() {
    earlyTriggers.forEach((eventName) => {
      window.removeEventListener(eventName, loadAppRuntime, listenerOptions);
    });
  }

  const listenerOptions = { passive: true, once: true };
  earlyTriggers.forEach((eventName) => {
    window.addEventListener(eventName, loadAppRuntime, listenerOptions);
  });

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(loadAppRuntime, { timeout: 1200 });
  } else {
    setTimeout(loadAppRuntime, 250);
  }

  lazyLoadMedia();
  registerServiceWorker();
  trackWebVitals();
})();
