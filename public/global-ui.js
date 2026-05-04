(function () {
  var THEME_KEY = "convertpro-theme";
  var DEFAULT_LOCALE = "en-us";
  var LOCALE_ALIASES = {
    en: "en",
    "en-us": "en",
    "en-gb": "en",
    "en-ca": "en",
    "en-au": "en",
    ru: "ru",
    "ru-ru": "ru",
    es: "es",
    "es-es": "es",
    "es-mx": "es",
    ur: "ur",
    "ur-pk": "ur",
    hi: "hi",
    "hi-in": "hi",
    ar: "ar",
    fr: "fr",
    "fr-fr": "fr",
    "fr-ca": "fr",
    de: "de",
    "de-de": "de"
  };
  var COUNTRY_TO_LOCALE = {
    pk: "ur-pk",
    in: "hi-in",
    es: "es-es",
    mx: "es-mx",
    fr: "fr-fr",
    de: "de-de",
    gb: "en-gb",
    uk: "en-gb",
    us: "en-us",
    au: "en-au",
    ca: "en-ca",
    ae: "ar",
    sa: "ar",
    qa: "ar",
    kw: "ar",
    bh: "ar",
    om: "ar"
  };
  var LANGUAGE_OPTIONS_HTML = '<option value="en-us">English (US)</option><option value="en-gb">English (UK)</option><option value="en-ca">English (CA)</option><option value="en-au">English (AU)</option><option value="ru-ru">Русский</option><option value="ur-pk">اردو (Pakistan)</option><option value="hi-in">हिन्दी (India)</option><option value="es-es">Español (España)</option><option value="es-mx">Español (México)</option><option value="ar">العربية</option><option value="fr-fr">Français (France)</option><option value="fr-ca">Français (Canada)</option><option value="de-de">Deutsch (Deutschland)</option>';
  var SEO_META_BY_PATH = {
    "/index.html": {
      en: { title: "File Converters - Free Online File Conversion Tools", description: "Convert PDF, Word, Excel, images, audio, video and more — free, fast, and secure. 100+ converters all in your browser." },
      es: { title: "Convertidores de Archivos - Herramientas Gratis en Linea", description: "Convierte PDF, Word, Excel, imagenes, audio y video en linea. Gratis, rapido y seguro." },
      ur: { title: "فائل کنورٹرز - مفت آن لائن فائل کنورژن ٹولز", description: "PDF، Word، Excel، تصاویر، آڈیو اور ویڈیو فائلیں مفت، تیز اور محفوظ طریقے سے کنورٹ کریں۔" },
      hi: { title: "फाइल कन्वर्टर - मुफ्त ऑनलाइन फाइल कन्वर्ज़न टूल्स", description: "PDF, Word, Excel, इमेज, ऑडियो और वीडियो फाइलों को ऑनलाइन मुफ्त, तेज और सुरक्षित तरीके से कन्वर्ट करें।" },
      ar: { title: "محول الملفات - ادوات تحويل ملفات اونلاين مجانا", description: "حوّل ملفات PDF وWord وExcel والصور والصوت والفيديو بسرعة وامان عبر المتصفح." },
      fr: { title: "Convertisseur de Fichiers - Outils Gratuits en Ligne", description: "Convertissez PDF, Word, Excel, images, audio et video gratuitement en ligne, rapidement et en securite." },
      de: { title: "Dateikonverter - Kostenlose Online Konvertierungstools", description: "PDF, Word, Excel, Bilder, Audio und Video online kostenlos, schnell und sicher konvertieren." }
    },
    "/tools.html": {
      en: { title: "Free File Converter Tools - Convert PDF, Word, Images Online", description: "Free file converter for PDF, Word, Excel, images, audio, video, and more. Convert files online fast with secure processing and 100+ tools." },
      es: { title: "Herramientas de Conversion Gratis - PDF, Word e Imagenes", description: "Convierte archivos PDF, Word, Excel, imagenes, audio y video en linea con mas de 100 herramientas." },
      ur: { title: "مفت فائل کنورٹر ٹولز - PDF، Word اور تصاویر", description: "100+ ٹولز کے ساتھ PDF، Word، Excel، تصاویر، آڈیو اور ویڈیو فائلیں آسانی سے کنورٹ کریں۔" },
      hi: { title: "मुफ्त फाइल कन्वर्टर टूल्स - PDF, Word, इमेज कन्वर्ट करें", description: "100+ टूल्स के साथ PDF, Word, Excel, इमेज, ऑडियो और वीडियो फाइलों को ऑनलाइन कन्वर्ट करें।" },
      ar: { title: "ادوات تحويل ملفات مجانية - PDF وWord والصور", description: "حوّل ملفات PDF وWord وExcel والصور والصوت والفيديو عبر 100+ اداة." },
      fr: { title: "Outils de Conversion Gratuits - PDF, Word, Images", description: "Convertissez PDF, Word, Excel, images, audio et video en ligne avec plus de 100 outils." },
      de: { title: "Kostenlose Dateikonverter Tools - PDF, Word, Bilder", description: "Konvertieren Sie PDF, Word, Excel, Bilder, Audio und Video online mit 100+ Tools." }
    },
    "/tools/pdf-to-word.html": {
      en: { title: "PDF to Word Converter Online Free - Fast & Secure", description: "Convert PDF to Word online for free in seconds. Keep document structure readable with a fast, secure PDF to DOCX workflow." },
      es: { title: "Convertidor PDF a Word Gratis en Linea", description: "Convierte PDF a Word gratis en linea en segundos con un flujo rapido y seguro." },
      ur: { title: "PDF سے Word کنورٹر - مفت آن لائن", description: "PDF کو Word میں مفت، تیز اور محفوظ طریقے سے آن لائن کنورٹ کریں۔" },
      hi: { title: "PDF to Word कन्वर्टर ऑनलाइन फ्री", description: "PDF फाइल को Word में ऑनलाइन मुफ्त, तेज और सुरक्षित तरीके से कन्वर्ट करें।" },
      ar: { title: "تحويل PDF الى Word مجانا اونلاين", description: "حوّل ملف PDF الى Word بسرعة وامان عبر الانترنت." },
      fr: { title: "Convertisseur PDF en Word Gratuit en Ligne", description: "Convertissez un PDF en Word gratuitement en ligne avec un processus rapide et securise." },
      de: { title: "PDF zu Word Konverter Kostenlos Online", description: "PDF online kostenlos in Word umwandeln - schnell und sicher." }
    },
    "/tools/word-to-pdf.html": {
      en: { title: "Word to PDF Converter Online Free - Fast & Secure", description: "Convert Word to PDF online for free in a few clicks. Create shareable PDF files quickly with a secure DOCX to PDF converter." },
      es: { title: "Convertidor Word a PDF Gratis en Linea", description: "Convierte Word a PDF gratis en linea en pocos clics con una conversion rapida y segura." },
      ur: { title: "Word سے PDF کنورٹر - مفت آن لائن", description: "Word فائل کو PDF میں چند کلکس کے ساتھ مفت آن لائن کنورٹ کریں۔" },
      hi: { title: "Word to PDF कन्वर्टर ऑनलाइन फ्री", description: "Word डॉक्यूमेंट को PDF में ऑनलाइन मुफ्त और तेज तरीके से कन्वर्ट करें।" },
      ar: { title: "تحويل Word الى PDF مجانا اونلاين", description: "حوّل ملفات Word الى PDF بسرعة وامان عبر الانترنت." },
      fr: { title: "Convertisseur Word en PDF Gratuit en Ligne", description: "Convertissez Word en PDF gratuitement en ligne en quelques clics." },
      de: { title: "Word zu PDF Konverter Kostenlos Online", description: "Word-Dokumente online kostenlos und sicher in PDF konvertieren." }
    }
  };
  var NAV_ITEMS = [
    { href: "/index.html", label: "Home" },
    { href: "/features.html", label: "Features" },
    { href: "/tools.html", label: "Tools" },
    { href: "/faq.html", label: "FAQ" },
    { href: "/about.html", label: "About Us" },
    { href: "/contact.html", label: "Contact Us" },
  ];

  function safeGetTheme() {
    try {
      var raw = localStorage.getItem(THEME_KEY);
      return raw === "light" || raw === "dark" ? raw : null;
    } catch (e) {
      return null;
    }
  }

  function safeSetTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      // Ignore storage write failures.
    }
  }

  function applyTheme(theme) {
    if (theme !== "light" && theme !== "dark") return;
    document.documentElement.setAttribute("data-theme", theme);
    var toggle = document.getElementById("themeBulb");
    if (!toggle) return;
    toggle.setAttribute("title", "Theme: " + (theme === "light" ? "Light" : "Dark"));
    toggle.setAttribute("aria-label", "Switch to " + (theme === "light" ? "dark" : "light") + " mode");
  }

  function initTheme() {
    var saved = safeGetTheme();
    applyTheme(saved || "light");
    var toggle = document.getElementById("themeBulb");
    if (!toggle || toggle.dataset.globalThemeBound === "1") return;
    toggle.dataset.globalThemeBound = "1";
    toggle.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      var next = current === "light" ? "dark" : "light";
      applyTheme(next);
      safeSetTheme(next);
    });
  }

  function buildNav(currentPath) {
    return NAV_ITEMS.map(function (item) {
      var active = currentPath === item.href || (item.href === "/index.html" && currentPath === "/");
      return '<a href="' + item.href + '"' + (active ? ' aria-current="page"' : "") + ">" + item.label + "</a>";
    }).join("");
  }

  function toDisplayLocale(locale) {
    var normalized = String(locale || "").toLowerCase();
    if (normalized === "en") return "en-us";
    if (normalized === "es") return "es-es";
    if (normalized === "ru") return "ru-ru";
    if (normalized === "ur") return "ur-pk";
    if (normalized === "hi") return "hi-in";
    if (normalized === "fr") return "fr-fr";
    if (normalized === "de") return "de-de";
    return normalized || DEFAULT_LOCALE;
  }

  function normalizePath(pathname) {
    var path = pathname || "/";
    if (path === "/") return "/index.html";
    return path;
  }

  function setSeoMetadataForLocale(locale) {
    var path = normalizePath(window.location.pathname || "/");
    var dictLocale = LOCALE_ALIASES[String(locale || "").toLowerCase()] || "en";
    var pathMeta = SEO_META_BY_PATH[path];
    if (!pathMeta) return;
    var meta = pathMeta[dictLocale] || pathMeta.en;
    if (!meta) return;
    if (meta.title) document.title = meta.title;
    var desc = document.querySelector('meta[name="description"]');
    if (desc && meta.description) desc.setAttribute("content", meta.description);
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && meta.title) ogTitle.setAttribute("content", meta.title);
    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && meta.description) ogDesc.setAttribute("content", meta.description);
    var twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle && meta.title) twTitle.setAttribute("content", meta.title);
    var twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc && meta.description) twDesc.setAttribute("content", meta.description);
  }

  function getPreferredLanguage() {
    try {
      var saved = localStorage.getItem("convertpro-language");
      var savedNormalized = String(saved || "").toLowerCase();
      if (LOCALE_ALIASES[savedNormalized]) return toDisplayLocale(savedNormalized);
    } catch (e) {}
    var candidates = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages
      : [navigator.language || "en-US"];
    for (var i = 0; i < candidates.length; i += 1) {
      var normalized = String(candidates[i] || "").toLowerCase();
      if (LOCALE_ALIASES[normalized]) return toDisplayLocale(normalized);
      var base = normalized.split("-")[0];
      if (base === "ur") return "ur-pk";
      if (base === "hi") return "hi-in";
      if (base === "ar") return "ar";
      if (base === "fr") return "fr-fr";
      if (base === "de") return "de-de";
      if (base === "es") return "es-es";
      if (base === "en") return "en-us";
    }
    return DEFAULT_LOCALE;
  }

  async function detectGeoLocale() {
    try {
      var controller = new AbortController();
      var timeoutId = setTimeout(function () { controller.abort(); }, 1500);
      var response = await fetch("https://ipapi.co/json/", {
        signal: controller.signal,
        headers: { Accept: "application/json" }
      });
      clearTimeout(timeoutId);
      if (!response.ok) return "";
      var data = await response.json();
      var country = String(data && data.country_code || "").toLowerCase();
      return COUNTRY_TO_LOCALE[country] || "";
    } catch (e) {
      return "";
    }
  }

  function ensureHeader() {
    var currentPath = window.location.pathname || "/";
    var header = document.querySelector(".topbar");
    if (!header) {
      var existingHeader = document.querySelector("header");
      var main = document.querySelector("main");
      var shell = document.querySelector(".app-shell");
      var host = shell || main || document.body;
      var wrapper = document.createElement("header");
      wrapper.className = "topbar global-topbar glass-navbar";
      wrapper.innerHTML =
        '<a href="/index.html" class="brand brand-link"><span class="brand-logo-wrap"><img class="brand-logo" src="/logo-v2.png" alt="Files Converter logo" /></span><span>Files Converter</span></a>' +
        '<nav class="topbar-nav">' + buildNav(currentPath) + "</nav>" +
        '<button type="button" class="nav-toggle" aria-expanded="false">Menu</button>' +
        '<div class="topbar-controls"><select id="languageSelect" class="language-select" aria-label="Select language">' + LANGUAGE_OPTIONS_HTML + '</select><button id="themeBulb" class="theme-toggle" type="button" aria-label="Switch to light mode" title="Theme: Dark"><span class="theme-toggle__track"><span class="theme-toggle__sun" aria-hidden="true">☀</span><span class="theme-toggle__knob" aria-hidden="true"><span class="theme-toggle__moon">☾</span></span></span></button></div>';
      if (existingHeader) {
        existingHeader.replaceWith(wrapper);
      } else {
        host.insertBefore(wrapper, host.firstChild);
      }
      header = wrapper;
    }
    header.classList.add("global-topbar", "glass-navbar");
    header.setAttribute("data-glass-navbar", "");

    var brandLabel = header.querySelector(".brand span:last-child");
    if (brandLabel) brandLabel.textContent = "Files Converter";

    var nav = header.querySelector(".topbar-nav");
    if (!nav) {
      nav = document.createElement("nav");
      nav.className = "topbar-nav";
      var controls = header.querySelector(".topbar-controls");
      if (controls) header.insertBefore(nav, controls);
      else header.appendChild(nav);
    }
    nav.innerHTML = buildNav(currentPath);

    var controls = header.querySelector(".topbar-controls");
    if (!controls) {
      controls = document.createElement("div");
      controls.className = "topbar-controls";
      controls.innerHTML = '<select id="languageSelect" class="language-select" aria-label="Select language">' + LANGUAGE_OPTIONS_HTML + '</select><button id="themeBulb" class="theme-toggle" type="button" aria-label="Switch to light mode" title="Theme: Dark"><span class="theme-toggle__track"><span class="theme-toggle__sun" aria-hidden="true">☀</span><span class="theme-toggle__knob" aria-hidden="true"><span class="theme-toggle__moon">☾</span></span></span></button>';
      header.appendChild(controls);
    }
    if (!controls.querySelector("#languageSelect") || !controls.querySelector("#themeBulb")) {
      controls.innerHTML = '<select id="languageSelect" class="language-select" aria-label="Select language">' + LANGUAGE_OPTIONS_HTML + '</select><button id="themeBulb" class="theme-toggle" type="button" aria-label="Switch to light mode" title="Theme: Dark"><span class="theme-toggle__track"><span class="theme-toggle__sun" aria-hidden="true">☀</span><span class="theme-toggle__knob" aria-hidden="true"><span class="theme-toggle__moon">☾</span></span></span></button>';
    }
    var languageSelect = controls.querySelector("#languageSelect");
    if (languageSelect) {
      languageSelect.value = getPreferredLanguage();
      setSeoMetadataForLocale(languageSelect.value);
      if (languageSelect.dataset.globalLanguageBound !== "1") {
        languageSelect.dataset.globalLanguageBound = "1";
        languageSelect.addEventListener("change", function (event) {
          var selected = String(event.target && event.target.value || "").toLowerCase();
          if (!LOCALE_ALIASES[selected]) return;
          var displayLocale = toDisplayLocale(selected);
          try { localStorage.setItem("convertpro-language", displayLocale); } catch (e) {}
          document.documentElement.lang = displayLocale;
          setSeoMetadataForLocale(displayLocale);
        });
      }
    }

    if (controls && !header.querySelector(".nav-toggle")) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "nav-toggle";
      btn.textContent = "Menu";
      btn.setAttribute("aria-expanded", "false");
      btn.addEventListener("click", function () {
        var open = header.classList.toggle("nav-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
      header.insertBefore(btn, controls);
    }
  }

  function ensureFooter() {
    var footer = document.querySelector(".site-footer");
    var footerHtml =
      '<div class="footer-grid footer-grid--clean">' +
      '<section class="footer-col footer-col--brand"><h4>Files Converter</h4><p class="footer-tagline">Fast, secure, and simple document tools built to save your time.</p><p class="footer-tagline" style="margin-top:0.75rem;">Premium checkout is processed by Paddle. <a href="/terms.html">Terms &amp; conditions</a> · <a href="/privacy.html">Privacy policy</a> · <a href="/refund.html">Refund policy</a></p></section>' +
      '<section class="footer-col"><h4>Product</h4><a href="/index.html">Home</a><a href="/features.html">Features</a><a href="/tools.html">Tools</a><a href="/faq.html">FAQ</a></section>' +
      '<section class="footer-col"><h4>Legal</h4><a href="/terms.html">Terms &amp; conditions</a><a href="/privacy.html">Privacy policy</a><a href="/refund.html">Refund policy</a><a href="/security.html">Security</a></section>' +
      '<section class="footer-col"><h4>Company</h4><a href="/about.html">About us</a><a href="/contact.html">Contact us</a></section>' +
      "</div>" +
      '<div class="footer-copyline">Copyright ©2026 fahad usman All Rights Reserved.</div>';
    if (footer) {
      footer.innerHTML = footerHtml;
      return;
    }
    footer = document.querySelector("footer");
    if (footer) {
      footer.className = "site-footer";
      footer.innerHTML = footerHtml;
      return;
    }
    footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.innerHTML = footerHtml;
    document.body.appendChild(footer);
  }

  function boot() {
    ensureHeader();
    ensureFooter();
    initTheme();
    var hasSavedLocale = false;
    try { hasSavedLocale = Boolean(localStorage.getItem("convertpro-language")); } catch (e) {}
    if (!hasSavedLocale) {
      detectGeoLocale().then(function (geoLocale) {
        if (!geoLocale || !LOCALE_ALIASES[geoLocale]) return;
        var displayGeoLocale = toDisplayLocale(geoLocale);
        try { localStorage.setItem("convertpro-language", displayGeoLocale); } catch (e) {}
        var select = document.getElementById("languageSelect");
        if (select) select.value = displayGeoLocale;
        document.documentElement.lang = displayGeoLocale;
        setSeoMetadataForLocale(displayGeoLocale);
      });
    }
    if ((window.location.pathname || "").indexOf("/tools/") === 0) {
      var script = document.createElement("script");
      script.src = "/articles/related-articles-widget.js";
      script.defer = true;
      document.body.appendChild(script);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

