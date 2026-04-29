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
    mount.innerHTML = payload.articles.map(function (article) {
      return (
        '<article class="card article-list-item">' +
        '<h3>' + article.title + "</h3>" +
        '<p>' + article.excerpt + "</p>" +
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
