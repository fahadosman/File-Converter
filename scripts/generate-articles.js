const fs = require("fs");
const path = require("path");

const publicDir = path.resolve(__dirname, "..", "public");
const articlesDir = path.join(publicDir, "articles");
const jsonPath = path.join(articlesDir, "articles.json");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function articleHtml(article) {
  const canonicalUrl = `https://filesconverter.org/articles/${article.slug}/`;
  const keywords = (article.keywords || []).join(", ");
  const authorName = article.author || "File Converters Team";
  const authorType = authorName === "File Converters Team" ? "Organization" : "Person";
  const articleSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    author: { "@type": authorType, name: authorName },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: canonicalUrl,
  });
  const faqSchema = Array.isArray(article.faqs) && article.faqs.length
    ? `<script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: article.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      })}</script>`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${article.title} | File Converters</title>
  <meta name="description" content="${article.description}" />
  <meta name="keywords" content="${keywords}" />
  <link rel="icon" type="image/png" href="/favicon-v2.png" />
  <link rel="preload" href="/styles.min.css" as="style" />
  <link rel="stylesheet" href="/styles.min.css" />
  <link rel="stylesheet" href="/articles/article-system.css" />
  <link rel="canonical" href="${canonicalUrl}" />
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${article.title}" />
  <meta property="og:description" content="${article.description}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="https://filesconverter.org/logo-v2.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${article.title}" />
  <meta name="twitter:description" content="${article.description}" />
  <script type="application/ld+json">${articleSchema}</script>
  ${faqSchema}
</head>
<body class="info-page" data-article-slug="${article.slug}">
  <div class="background-glow" aria-hidden="true"></div>
  <main class="app-shell">
    <header class="topbar"></header>
    <section class="info-section article-layout">
      <article class="card article-main">
        <p><a class="article-link" href="/articles/">← All Articles</a></p>
        <h1 id="articleTitle">${article.title}</h1>
        <p id="articleMeta" class="article-meta"></p>
        <div id="articleBody"></div>
      </article>
      <aside class="article-sidebar">
        <section class="card">
          <h3>Related Posts</h3>
          <ul id="relatedPosts"></ul>
        </section>
      </aside>
    </section>
  </main>
  <script defer src="/global-ui.js"></script>
  <script defer src="/articles/article-page.js"></script>
</body>
</html>`;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function generate() {
  const payload = readJson(jsonPath);
  const articles = payload.articles || [];
  articles.forEach((article) => {
    const slugDir = path.join(articlesDir, article.slug);
    ensureDir(slugDir);
    fs.writeFileSync(path.join(slugDir, "index.html"), articleHtml(article));
  });
  console.log(`Generated ${articles.length} article pages.`);
}

generate();

