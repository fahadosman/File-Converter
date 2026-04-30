(function () {
  var THEME_KEY = "convertpro-theme";
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
    var prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    applyTheme(saved || (prefersLight ? "light" : "dark"));
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
        '<a href="/index.html" class="brand brand-link"><span class="brand-logo-wrap"><img class="brand-logo" src="/favicon-v2.png" alt="File Converters logo" /></span><span>File Converters</span></a>' +
        '<nav class="topbar-nav">' + buildNav(currentPath) + "</nav>" +
        '<button type="button" class="nav-toggle" aria-expanded="false">Menu</button>' +
        '<div class="topbar-controls"><button id="themeBulb" class="theme-toggle" type="button" aria-label="Switch to light mode" title="Theme: Dark"><span class="theme-toggle__track"><span class="theme-toggle__sun" aria-hidden="true">☀</span><span class="theme-toggle__knob" aria-hidden="true"><span class="theme-toggle__moon">☾</span></span></span></button></div>';
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
    if (brandLabel) brandLabel.textContent = "File Converters";

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
      controls.innerHTML = '<button id="themeBulb" class="theme-toggle" type="button" aria-label="Switch to light mode" title="Theme: Dark"><span class="theme-toggle__track"><span class="theme-toggle__sun" aria-hidden="true">☀</span><span class="theme-toggle__knob" aria-hidden="true"><span class="theme-toggle__moon">☾</span></span></span></button>';
      header.appendChild(controls);
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
    if (footer) return;
    footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.innerHTML =
      '<div class="footer-grid footer-grid--clean">' +
      '<section class="footer-col footer-col--brand"><h4>Files Converter</h4><p class="footer-tagline">Fast, secure, and simple document tools built to save your time.</p></section>' +
      '<section class="footer-col"><h4>Product</h4><a href="/index.html">Home</a><a href="/features.html">Features</a><a href="/tools.html">Tools</a><a href="/faq.html">FAQ</a></section>' +
      '<section class="footer-col"><h4>Legal</h4><a href="/security.html">Security</a><a href="/privacy.html">Privacy policy</a><a href="/terms.html">Terms &amp; conditions</a></section>' +
      '<section class="footer-col"><h4>Company</h4><a href="/about.html">About us</a><a href="/contact.html">Contact us</a></section>' +
      "</div>" +
      '<div class="footer-copyline">Copyright ©2026 fahad usman All Rights Reserved.</div>';
    document.body.appendChild(footer);
  }

  function boot() {
    ensureHeader();
    ensureFooter();
    initTheme();
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
