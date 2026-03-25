
/*

// src/repo/repoScanner.js
const fs = require("fs");
const path = require("path");

const DEFAULT_IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "out",
  "target",
  ".idea",
  ".vscode",
  ".next",
  ".cache",
  "coverage",
  "playwright-report",
  "test-results",
  "cypress/videos",
  "cypress/screenshots",
]);

const DEFAULT_EXTS = new Set([
  ".js",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".json",
  ".yml",
  ".yaml",
  ".md",
  ".java",
  ".py",
  ".feature",
  ".xml",
  ".properties",
  ".gradle",
]);

function walk(dir, opts = {}, out = []) {
  const {
    ignoreDirs = DEFAULT_IGNORE_DIRS,
    exts = DEFAULT_EXTS,
    maxFileSizeBytes = 400_000, // keep it safe
  } = opts;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const e of entries) {
    const p = path.join(dir, e.name);
    const rel = path.relative(opts.repoDir || dir, p).replaceAll("\\", "/");

    // ignore dirs
    if (e.isDirectory()) {
      // skip if any segment matches ignore
      const segs = rel.split("/");
      if (segs.some((s) => ignoreDirs.has(s) || ignoreDirs.has(rel))) continue;
      walk(p, opts, out);
      continue;
    }

    // include only whitelisted extensions
    const ext = path.extname(e.name);
    if (!exts.has(ext) && e.name !== "package.json" && e.name !== "pom.xml")
      continue;

    try {
      const stat = fs.statSync(p);
      if (stat.size > maxFileSizeBytes) continue;
      const content = fs.readFileSync(p, "utf8");
      out.push({ path: rel, absPath: p, size: stat.size, content });
    } catch {
      // ignore unreadable files
    }
  }

  return out;
}

function scanRepo(repoDir, opts = {}) {
  return walk(repoDir, { ...opts, repoDir });
}

module.exports = { scanRepo };

*/

// src/repo/repoScanner.js
const fs = require("fs");
const path = require("path");

const DEFAULT_IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "out",
  "target",
  ".idea",
  ".vscode",
  ".next",
  ".cache",
  "coverage",
  "playwright-report",
  "test-results",
  "cypress/videos",
  "cypress/screenshots",
]);

const DEFAULT_EXTS = new Set([
  ".js",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".json",
  ".yml",
  ".yaml",
  ".md",
  ".java",
  ".py",
  ".feature",
  ".xml",
  ".properties",
  ".gradle",
]);

function walk(dir, opts, out) {
  const {
    repoDir,
    ignoreDirs = DEFAULT_IGNORE_DIRS,
    exts = DEFAULT_EXTS,
    maxFileSizeBytes = 400_000,
  } = opts;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const e of entries) {
    const abs = path.join(dir, e.name);
    const rel = path.relative(repoDir, abs).replaceAll("\\", "/");

    if (e.isDirectory()) {
      const segs = rel.split("/");
      if (segs.some((s) => ignoreDirs.has(s) || ignoreDirs.has(rel))) continue;
      walk(abs, opts, out);
      continue;
    }

    const ext = path.extname(e.name);
    const whitelisted =
      exts.has(ext) || e.name === "package.json" || e.name === "pom.xml";

    if (!whitelisted) continue;

    try {
      const stat = fs.statSync(abs);
      if (stat.size > maxFileSizeBytes) continue;
      const content = fs.readFileSync(abs, "utf8");
      out.push({ path: rel, absPath: abs, size: stat.size, content });
    } catch {
      // ignore
    }
  }
}

function scanRepo(repoDir, opts = {}) {
  const out = [];
  walk(repoDir, { ...opts, repoDir }, out);
  return out;
}

module.exports = { scanRepo };
