// src/repo/indexBuilder.js
const path = require("path");
const { detectFramework } = require("./frameworkDetector");
const { scanRepo } = require("./repoScanner");

function guessConventions(files) {
  const paths = files.map((f) => f.path);

  const prefersDataTestId = files.some((f) =>
    /data-testid|dataTestId|getByTestId/i.test(f.content)
  );

  const prefersRole = files.some((f) => /getByRole\(/i.test(f.content));

  const hasPageObjects =
    paths.some((p) => /pageobjects|page-objects|pages\b|page\b/i.test(p)) ||
    files.some((f) =>
      /class\s+\w+Page|export\s+class\s+\w+Page/i.test(f.content)
    );

  const hasCucumber =
    paths.some((p) => p.endsWith(".feature")) ||
    files.some((f) => /cucumber|@Given|@When|@Then/i.test(f.content));

  const hasTestNG =
    paths.some((p) => p.endsWith("testng.xml")) ||
    files.some((f) => /org\.testng|@Test/i.test(f.content));

  return {
    locators: { prefersDataTestId, prefersRole },
    structure: { hasPageObjects, hasCucumber, hasTestNG },
  };
}

function buildRepoIndex(repoDir) {
  const detected = detectFramework(repoDir);
  const files = scanRepo(repoDir);

  const conventions = guessConventions(files);

  const fileIndex = files.map((f) => ({
    path: f.path,
    size: f.size,
    excerpt: f.content.slice(0, 1200),
  }));

  return {
    repoDir: path.resolve(repoDir),
    detected,
    conventions,
    files: fileIndex,
    stats: { filesIndexed: fileIndex.length },
    createdAt: new Date().toISOString(),
  };
}

module.exports = { buildRepoIndex };
