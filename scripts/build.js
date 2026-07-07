const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

const files = [
  "index.html",
  "styles.css",
  "script.js",
  "site.webmanifest",
  "sw.js",
  ".nojekyll",
];

function copyFile(relativePath) {
  const source = path.join(root, relativePath);
  const target = path.join(dist, relativePath);

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const file of files) {
  copyFile(file);
}

fs.cpSync(path.join(root, "assets"), path.join(dist, "assets"), { recursive: true });

console.log("Built static PWA into dist/");
