// src/repo/loadRepoKnowledge.js
const fs = require("fs");
const path = require("path");

function loadRepoKnowledge(repoDir, folder = ".qa-ai") {
  const base = path.join(repoDir, folder);
  const repoIndex = JSON.parse(
    fs.readFileSync(path.join(base, "repo-index.json"), "utf8")
  );
  const vectors = JSON.parse(
    fs.readFileSync(path.join(base, "repo-vectors.json"), "utf8")
  );
  return { repoIndex, vectors, baseDir: base };
}

module.exports = { loadRepoKnowledge };
