const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "public");

function walk(dir) {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(walk(full));
    else if (entry.isFile() && full.endsWith(".html")) out.push(full);
  }
  return out;
}

for (const file of walk(root)) {
  if (file.endsWith("index.min.html")) continue;
  let html = fs.readFileSync(file, "utf8");

  html = html.replace(/^\s*<lin\s*$/gm, "");
  html = html.replace(/\n{3,}/g, "\n\n");

  const hasHeadOpen = /<head>/i.test(html);
  const hasHeadClose = /<\/head>/i.test(html);
  const bodyMatch = html.match(/<body[\s\S]*?>/i);

  if (hasHeadOpen && !hasHeadClose && bodyMatch) {
    const bodyIdx = html.indexOf(bodyMatch[0]);
    html = `${html.slice(0, bodyIdx).trimEnd()}\n</head>\n${html.slice(bodyIdx)}`;
  }

  fs.writeFileSync(file, html);
}

console.log("HTML repair pass complete.");
