// tools/run.js
require("dotenv").config();
const path = require("path");

const { buildRepoKnowledge, scanDir, askRepo } = require("../src/index");

async function main() {
  const repoDir = process.argv[2];
  if (!repoDir) {
    console.log("Usage: node tools/run.js /path/to/repo");
    process.exit(1);
  }

  console.log("Scanning dir...");
  const files = scanDir(repoDir);
  console.log("Files scanned:", files.length);

  console.log("Building repo knowledge (.qa-ai)...");
  const out = buildRepoKnowledge(repoDir);
  console.log("Built:", out);

  console.log("\nAsking repo...");
  const answer = await askRepo({
    repoDir,
    question:
      "Generate a Playwright POM test for login popup + click login. Use best practices.",
  });

  console.log("\n=== Answer ===\n");
  console.log(answer);
}

main().catch(console.error);
