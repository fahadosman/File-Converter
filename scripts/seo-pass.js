const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "public");
const base = "https://filesconverter.org";

function walk(dir) {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(walk(full));
    else if (entry.isFile() && full.endsWith(".html")) out.push(full);
  }
  return out;
}

function ensureTag(head, tag) {
  return head.includes(tag) ? head : `${head}\n${tag}`;
}

function escapeAttr(value) {
  return String(value).replace(/"/g, "&quot;");
}

const files = walk(root).filter((f) => !f.endsWith("index.min.html"));

for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  const headMatch = html.match(/<head>[\s\S]*?<\/head>/i);
  if (!headMatch) continue;

  let head = headMatch[0];
  const rel = `/${path.relative(root, file).replace(/\\/g, "/")}`;
  const url = rel === "/index.html" ? `${base}/` : `${base}${rel}`;
  const title =
    html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() || "Files Converter";
  const desc =
    html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i)?.[1] ||
    "Free online file converter tools.";

  if (/<link\s+rel=["']canonical["']/i.test(head)) {
    head = head.replace(
      /<link\s+rel=["']canonical["'][^>]*>/i,
      `  <link rel="canonical" href="${url}" />`
    );
  } else {
    head = ensureTag(head, `  <link rel="canonical" href="${url}" />`);
  }

  const hreflangs = [
    `  <link rel="alternate" hreflang="en" href="${url}" />`,
    `  <link rel="alternate" hreflang="x-default" href="${url}" />`,
  ];
  for (const tag of hreflangs) head = ensureTag(head, tag);

  const robotsTag =
    '  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />';
  if (/<meta\s+name=["']robots["']/i.test(head)) {
    head = head.replace(/<meta\s+name=["']robots["'][^>]*>/i, robotsTag);
  } else {
    head = ensureTag(head, robotsTag);
  }

  const metas = [
    ['property="og:type"', '  <meta property="og:type" content="website" />'],
    ['property="og:title"', `  <meta property="og:title" content="${escapeAttr(title)}" />`],
    ['property="og:description"', `  <meta property="og:description" content="${escapeAttr(desc)}" />`],
    ['property="og:url"', `  <meta property="og:url" content="${url}" />`],
    ['property="og:image"', `  <meta property="og:image" content="${base}/logo-v2.png" />`],
    ['name="twitter:card"', '  <meta name="twitter:card" content="summary_large_image" />'],
    ['name="twitter:title"', `  <meta name="twitter:title" content="${escapeAttr(title)}" />`],
    ['name="twitter:description"', `  <meta name="twitter:description" content="${escapeAttr(desc)}" />`],
  ];

  for (const [needle, replacement] of metas) {
    const regex = new RegExp(`<meta[^>]+${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^>]*>`, "i");
    if (regex.test(head)) head = head.replace(regex, replacement);
    else head = ensureTag(head, replacement);
  }

  if (rel.startsWith("/tools/")) {
    head = head.replace(
      /<link\s+rel=["']stylesheet["']\s+href=["']\/styles\.css["']\s*\/?>/i,
      '  <link rel="preload" href="/styles.min.css" as="style" />\n  <link rel="stylesheet" href="/styles.min.css" />'
    );

    if (!/"@type"\s*:\s*"WebApplication"/.test(head)) {
      const schema = [
        '  <script type="application/ld+json">',
        "    {",
        '      "@context": "https://schema.org",',
        '      "@type": "WebApplication",',
        `      "name": "${title.replace(/"/g, '\\"')}",`,
        `      "url": "${url}",`,
        '      "applicationCategory": "UtilitiesApplication",',
        '      "operatingSystem": "Any",',
        '      "offers": {',
        '        "@type": "Offer",',
        '        "price": "0",',
        '        "priceCurrency": "USD"',
        "      }",
        "    }",
        "  </script>",
      ].join("\n");
      head = ensureTag(head, schema);
    }
  }

  html = html.replace(headMatch[0], head);
  fs.writeFileSync(file, html);
}

let sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
sitemap = sitemap.replaceAll("https://fileconverter.pages.dev", base);
fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap);

console.log(`SEO pass complete for ${files.length} HTML files.`);

