require("dotenv").config();
const { askRepo } = require("../src/index");

async function main() {
  const repoDir = process.argv[2];
  const frameworkOverride = process.argv[3];
  const styleOverride = process.argv[4];
  const question = process.argv.slice(5).join(" ");

  if (!repoDir || !question) {
    console.log(
      'Usage: node tools/ask.js /path/to/repo <frameworkOverride|auto> <styleOverride|auto> "your question here"',
    );
    process.exit(1);
  }

  const answer = await askRepo({
    repoDir,
    question,
    frameworkOverride:
      frameworkOverride && frameworkOverride !== "auto"
        ? frameworkOverride
        : null,
    styleOverride:
      styleOverride && styleOverride !== "auto" ? styleOverride : null,
  });

  console.log("\n=== Answer ===\n");
  console.log(answer);
}

main().catch(console.error);
