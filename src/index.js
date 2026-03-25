// src/index.js
const { buildRepoKnowledge } = require("./repo/buildRepoKnowledge");
const { scanRepo } = require("./repo/repoScanner");
const { loadRepoKnowledge } = require("./repo/loadRepoKnowledge");
const { askRepo } = require("./repo/askRepo");

function scanDir(repoDir, opts = {}) {
  return scanRepo(repoDir, opts);
}

module.exports = {
  buildRepoKnowledge,
  scanDir,
  loadRepoKnowledge,
  askRepo,
};
