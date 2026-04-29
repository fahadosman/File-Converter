(function () {
  function bySlug(items, slug) {
    for (var i = 0; i < items.length; i += 1) {
      if (items[i].slug === slug) return items[i];
    }
    return null;
  }

  function formatDate(value) {
    if (!value) return "";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function renderArticle(article) {
    var title = document.getElementById("articleTitle");
    var meta = document.getElementById("articleMeta");
    var body = document.getElementById("articleBody");
    if (!title || !meta || !body) return;
    title.textContent = article.title;
    meta.textContent = "By " + (article.author || "File Converters Team") + " • Updated " + formatDate(article.updatedAt);
    body.innerHTML = (article.sections || []).map(function (section) {
      var paragraphs = (section.paragraphs || []).map(function (text) {
        return "<p>" + text + "</p>";
      }).join("");
      var bullets = (section.bullets || []).length
        ? "<ul>" + section.bullets.map(function (bullet) { return "<li>" + bullet + "</li>"; }).join("") + "</ul>"
        : "";
      return '<section class="article-section"><h2>' + section.heading + "</h2>" + paragraphs + bullets + "</section>";
    }).join("");
  }

  function renderSidebar(payload, article) {
    var list = document.getElementById("relatedPosts");
    if (!list || !payload || !Array.isArray(payload.articles)) return;
    var related = payload.articles.filter(function (item) {
      if (item.slug === article.slug) return false;
      var sameTool = (item.toolSlugs || []).some(function (slug) { return (article.toolSlugs || []).indexOf(slug) >= 0; });
      return sameTool;
    }).slice(0, 5);
    if (!related.length) {
      list.innerHTML = "<li>No related posts yet.</li>";
      return;
    }
    list.innerHTML = related.map(function (item) {
      return '<li><a class="article-link" href="/articles/' + item.slug + '/">' + item.title + "</a></li>";
    }).join("");
  }

  function slugFromPath() {
    var marker = document.body.getAttribute("data-article-slug");
    if (marker) return marker;
    var parts = (window.location.pathname || "").split("/").filter(Boolean);
    return parts.length >= 2 ? parts[1] : "";
  }

  var slug = slugFromPath();
  if (!slug) return;

  fetch("/articles/articles.json")
    .then(function (response) { return response.json(); })
    .then(function (payload) {
      var article = bySlug(payload.articles || [], slug);
      if (!article) return;
      renderArticle(article);
      renderSidebar(payload, article);
    });
})();
