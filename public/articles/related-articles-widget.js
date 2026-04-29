(function () {
  function getToolSlug(pathname) {
    var parts = (pathname || "").split("/");
    var last = parts[parts.length - 1] || "";
    return last.replace(".html", "");
  }

  function mountWidget(articles, toolSlug) {
    var host = document.querySelector(".app-shell");
    if (!host) return;
    var target = host.querySelector(".info-section");
    if (!target) return;

    var related = articles.filter(function (article) {
      return Array.isArray(article.toolSlugs) && article.toolSlugs.indexOf(toolSlug) >= 0;
    }).slice(0, 4);
    if (!related.length) return;

    var section = document.createElement("section");
    section.className = "info-section related-articles-widget";
    section.innerHTML =
      "<h3>Related Articles</h3>" +
      "<ul>" +
      related.map(function (article) {
        return '<li><a class="article-link" href="/articles/' + article.slug + '/">' + article.title + "</a></li>";
      }).join("") +
      "</ul>";
    target.insertAdjacentElement("afterend", section);
  }

  function ensureStyles() {
    if (document.querySelector('link[data-article-system="1"]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/articles/article-system.css";
    link.dataset.articleSystem = "1";
    document.head.appendChild(link);
  }

  var slug = getToolSlug(window.location.pathname);
  if (!slug) return;
  ensureStyles();
  fetch("/articles/articles.json")
    .then(function (response) { return response.json(); })
    .then(function (payload) {
      if (!payload || !Array.isArray(payload.articles)) return;
      mountWidget(payload.articles, slug);
    });
})();
