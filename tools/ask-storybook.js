#!/usr/bin/env node
require("dotenv").config();

const { inspectStorybookPage } = require("../src/storybookInspector");
const { buildGenerationPrompt } = require("../src/generateFromPage");
const { callLLMChat } = require("../src/llmClient");
const { saveGeneratedFiles } = require("../src/saveGeneratedFiles");

async function main() {
  const [, , url, userPrompt] = process.argv;

  if (!url || !userPrompt) {
    console.error(
      'Usage: node tools/ask-storybook.js "<storybook-url>" "<plain-english-prompt>"',
    );
    process.exit(1);
  }

  console.log("\nVisiting Storybook UI...\n");
  console.log(`URL: ${url}`);
  console.log(`Prompt: ${userPrompt}\n`);

  const pageSummary = await inspectStorybookPage(url);

  console.log("Detected page summary:\n");
  console.log(JSON.stringify(pageSummary, null, 2));

  const finalPrompt = buildGenerationPrompt(userPrompt, pageSummary);

  console.log("\n================ FINAL GENERATION PROMPT ================\n");
  console.log(finalPrompt);

  console.log("\n================ GENERATING CODE ================\n");

  const generated = await callLLMChat({
    system:
      "You are a senior QA automation engineer. Return only the requested Playwright JavaScript files in the exact format specified by the user prompt.",
    user: finalPrompt,
  });

  console.log(generated);

  console.log("\n================ SAVING FILES ================\n");
  saveGeneratedFiles(generated);

  console.log("\n========================================================\n");
}

main().catch((err) => {
  console.error("\nError:\n", err);
  process.exit(1);
});
