import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const target = process.argv[2];
if (!target || !["chrome", "firefox"].includes(target)) {
  console.error("Usage: node scripts/fix-manifest.js <chrome|firefox>");
  process.exit(1);
}

const dir = target === "chrome" ? "chrome-mv3-prod" : "firefox-mv3-prod";
const path = resolve("build", dir, "manifest.json");
const manifest = JSON.parse(readFileSync(path, "utf8"));

if (target === "chrome") {
  delete manifest.action?.default_popup;
} else {
  delete manifest.sidebar_action;
}

writeFileSync(path, JSON.stringify(manifest, null, 2));
console.log(`✓ Fixed ${dir}/manifest.json for ${target}`);
