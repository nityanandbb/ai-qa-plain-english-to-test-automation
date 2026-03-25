// src/repo/frameworkDetector.js
const fs = require("fs");
const path = require("path");

function exists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function detectFramework(repoDir) {
  const pkgPath = path.join(repoDir, "package.json");
  const pkg = exists(pkgPath) ? readJson(pkgPath) : null;

  const deps = pkg?.dependencies || {};
  const devDeps = pkg?.devDependencies || {};
  const allDeps = { ...deps, ...devDeps };

  const hasPlaywrightConfig =
    exists(path.join(repoDir, "playwright.config.ts")) ||
    exists(path.join(repoDir, "playwright.config.js")) ||
    exists(path.join(repoDir, "playwright.config.mjs"));

  const hasCypressConfig =
    exists(path.join(repoDir, "cypress.config.ts")) ||
    exists(path.join(repoDir, "cypress.config.js")) ||
    exists(path.join(repoDir, "cypress"));

  const hasMaven = exists(path.join(repoDir, "pom.xml"));
  const hasGradle =
    exists(path.join(repoDir, "build.gradle")) ||
    exists(path.join(repoDir, "build.gradle.kts"));

  const hasPythonReq =
    exists(path.join(repoDir, "requirements.txt")) ||
    exists(path.join(repoDir, "pyproject.toml"));

  return {
    playwright: hasPlaywrightConfig || Boolean(allDeps["@playwright/test"]),
    cypress: hasCypressConfig || Boolean(allDeps["cypress"]),
    seleniumJava: hasMaven || hasGradle,
    seleniumPython: hasPythonReq,
    signals: {
      hasPlaywrightConfig,
      hasCypressConfig,
      hasMaven,
      hasGradle,
      hasPythonReq,
      nodeDeps: Object.keys(allDeps),
    },
  };
}

module.exports = { detectFramework };
