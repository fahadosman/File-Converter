(() => {
  let loaded = false;
  let loading = false;

  function loadAppRuntime() {
    if (loaded || loading) return;
    loading = true;
    const script = document.createElement("script");
    script.src = "script.min.js";
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
})();
