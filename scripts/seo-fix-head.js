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

const files = walk(root).filter((f) => !f.endsWith("index.min.html"));

for (const file of files) {
  let html = fs.readFileSync(file, "utf8");
  const headMatch = html.match(/<head>[\s\S]*?<\/head>/i);
  const bodyMatch = html.match(/<body[\s\S]*?>/i);
  if (!headMatch || !bodyMatch) continue;

  let head = headMatch[0];
  const headEnd = html.indexOf(headMatch[0]) + headMatch[0].length;
  const bodyStart = html.indexOf(bodyMatch[0]);
  if (bodyStart <= headEnd) continue;

  let between = html.slice(headEnd, bodyStart);

  const patterns = [
    /<link\s+rel="canonical"[^>]*>\s*/gi,
    /<link\s+rel="alternate"[^>]*>\s*/gi,
    /<meta\s+name="robots"[^>]*>\s*/gi,
    /<meta\s+property="og:[^"]+"[^>]*>\s*/gi,
    /<meta\s+name="twitter:[^"]+"[^>]*>\s*/gi,
    /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi,
  ];

  const collected = [];
  for (const pattern of patterns) {
    const inBetween = between.match(pattern) || [];
    const inHead = head.match(pattern) || [];
    collected.push(...inBetween, ...inHead);
    between = between.replace(pattern, "");
    head = head.replace(pattern, "");
  }

  const unique = [];
  for (const tag of collected.map((t) => t.trim()).filter(Boolean)) {
    if (!unique.includes(tag)) unique.push(tag);
  }

  const insert = unique.length ? `\n  ${unique.join("\n  ")}\n` : "\n";
  head = head.replace(/<\/head>/i, `${insert}</head>`);

  html = html.replace(headMatch[0], head);
  html = html.slice(0, headEnd) + between + html.slice(bodyStart);
  fs.writeFileSync(file, html);
}

console.log(`Head normalization complete for ${files.length} files.`);
