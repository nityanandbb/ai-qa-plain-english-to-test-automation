// src/repo/buildRepoKnowledge.js
const fs = require("fs");
const path = require("path");
const { scanRepo } = require("./repoScanner");
const { buildRepoIndex } = require("./indexBuilder");
const { buildVectorIndex } = require("./vectorIndex");

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

/**
 * buildRepoKnowledge(repoDir)
 * Writes:
 *   <repoDir>/.qa-ai/repo-index.json
 *   <repoDir>/.qa-ai/repo-vectors.json
 */
function buildRepoKnowledge(repoDir, outFolder = ".qa-ai") {
  const outDir = path.join(repoDir, outFolder);
  ensureDir(outDir);

  const files = scanRepo(repoDir);
  const repoIndex = buildRepoIndex(repoDir);
  const vectors = buildVectorIndex(
    files.map((f) => ({ path: f.path, content: f.content }))
  );

  fs.writeFileSync(
    path.join(outDir, "repo-index.json"),
    JSON.stringify(repoIndex, null, 2)
  );
  fs.writeFileSync(
    path.join(outDir, "repo-vectors.json"),
    JSON.stringify(
      {
        dims: vectors.dims,
        chunks: vectors.chunks.map((c) => ({
          path: c.path,
          start: c.start,
          text: c.text,
          embedding: c.embedding,
        })),
      },
      null,
      2
    )
  );

  return { outDir, filesIndexed: repoIndex.stats.filesIndexed };
}

module.exports = { buildRepoKnowledge };
