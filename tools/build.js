// tools/build.js
require("dotenv").config();
const { buildRepoKnowledge } = require("../src/index");

const repoDir = process.argv[2];
if (!repoDir) {
  console.log("Usage: node tools/build.js /path/to/repo");
  process.exit(1);
}

const out = buildRepoKnowledge(repoDir);
console.log("✅ Repo knowledge built:", out);
console.log("📁 Files created inside:", `${repoDir}/.qa-ai/`);
