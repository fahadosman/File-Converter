(function () {
  function formatDate(value) {
    if (!value) return "";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function renderList(payload) {
    var mount = document.getElementById("articleList");
    if (!mount || !payload || !Array.isArray(payload.articles)) return;
    var articles = payload.articles.slice().sort(function (a, b) {
      var aTime = new Date(a.updatedAt || a.publishedAt || 0).getTime();
      var bTime = new Date(b.updatedAt || b.publishedAt || 0).getTime();
      return bTime - aTime;
    });
    mount.innerHTML = articles.map(function (article) {
      var keywords = Array.isArray(article.keywords) && article.keywords.length
        ? (
          '<div class="article-tag-list">' +
          article.keywords.slice(0, 3).map(function (keyword) {
            return '<span class="article-tag">' + keyword + "</span>";
          }).join("") +
          "</div>"
        )
        : "";
      return (
        '<article class="card article-list-item">' +
        '<h3>' + article.title + "</h3>" +
        '<p>' + article.excerpt + "</p>" +
        keywords +
        '<p class="article-meta">Updated: ' + formatDate(article.updatedAt) + "</p>" +
        '<a class="article-link" href="/articles/' + article.slug + '/">Read article</a>' +
        "</article>"
      );
    }).join("");
  }

  fetch("/articles/articles.json")
    .then(function (response) { return response.json(); })
    .then(renderList)
    .catch(function () {
      var mount = document.getElementById("articleList");
      if (mount) mount.innerHTML = '<article class="card"><p>Unable to load articles right now.</p></article>';
    });
})();
