const fs = require("fs");
const path = require("path");

const toolsDir = path.join(__dirname, "..", "public", "tools");
const SEO_TO_TOOL = {
  "powerpoint-to-pdf": "ppt-to-pdf",
  "pdf-to-powerpoint": "pdf-to-ppt",
  "pdf-compress": "compress-pdf",
};

const CTA_MARKER = "data-tool-cta";

function toolRouteFor(fileName) {
  const slug = fileName.replace(/\.html$/, "");
  const toolId = SEO_TO_TOOL[slug] || slug;
  return `/tool/${toolId}`;
}

function injectCta(html, route) {
  if (html.includes(CTA_MARKER)) return html;
  const block =
    `\n        <p ${CTA_MARKER} style="margin:1rem 0 1.25rem;"><a class="plan-btn plan-btn--primary" href="${route}" style="display:inline-block;text-decoration:none;">Open live converter →</a></p>`;
  return html.replace(/(<h1[^>]*>[\s\S]*?<\/h1>)/, `$1${block}`);
}

fs.readdirSync(toolsDir)
  .filter((name) => name.endsWith(".html") && name !== "index.html")
  .forEach((name) => {
    const filePath = path.join(toolsDir, name);
    const route = toolRouteFor(name);
    const next = injectCta(fs.readFileSync(filePath, "utf8"), route);
    if (next !== fs.readFileSync(filePath, "utf8")) {
      fs.writeFileSync(filePath, next);
      console.log("Updated", name, "->", route);
    }
  });
