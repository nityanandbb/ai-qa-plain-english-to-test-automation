// src/repo/askRepo.js
const { searchVectorIndex } = require("./vectorIndex");
const { loadRepoKnowledge } = require("./loadRepoKnowledge");
// const { callLLM } = require("../llmClient"); // uses your existing OpenAI client :contentReference[oaicite:2]{index=2}
const { callLLMChat } = require("../llmClient");

const {
  buildSystemPrompt,
  buildUserPrompt,
} = require("../prompts/repoPrompts");

function buildGuardrails(repoIndex) {
  const d = repoIndex.detected || {};
  const c = repoIndex.conventions || {};

  // Decide defaults (you can override from UI later)
  const framework = d.playwright
    ? "playwright"
    : d.cypress
    ? "cypress"
    : d.seleniumJava
    ? "selenium-java"
    : d.seleniumPython
    ? "selenium-python"
    : "unknown";

  const style = c.structure?.hasCucumber
    ? "cucumber"
    : c.structure?.hasTestNG
    ? "testng"
    : c.structure?.hasPageObjects
    ? "pom"
    : "simple";

  const locatorPreference = c.locators?.prefersDataTestId
    ? "dataTestId"
    : c.locators?.prefersRole
    ? "role"
    : "css";

  return { framework, style, locatorPreference };
}

/**
 * askRepo({ repoDir, question })
 * - uses saved .qa-ai repo index + vector chunks
 * - returns an LLM answer that is guided by repo conventions
 */

async function askRepo({
  repoDir,
  question,
  topK = 8,
  mode = "default",
  frameworkOverride = null,
  styleOverride = null,
  locatorOverride = null,
}) {
  const { repoIndex, vectors } = loadRepoKnowledge(repoDir);
  const detectedGuard = buildGuardrails(repoIndex);

  const guard = {
    framework: frameworkOverride || detectedGuard.framework,
    style: styleOverride || detectedGuard.style,
    locatorPreference: locatorOverride || detectedGuard.locatorPreference,
  };

  const hits = searchVectorIndex(vectors, question, topK);

  const context = hits
    .map((h, i) => `[#${i + 1}] ${h.path}:${h.start}\n${h.text}`)
    .join("\n\n");

  const system = [
  "You are a senior QA automation engineer assistant.",
  "Follow the effective guardrails.",
  "Prioritize explicit user requirements when they request counts or output structure.",
  "If something is ambiguous, output TODO comments instead of guessing selectors.",
  "Prefer stable locators and best practices for the effective framework.",
  "Output must be structured and complete, not just illustrative.",
  "If the user asks for multiple tests, you MUST generate multiple complete test cases, not placeholders.",
  "Do not end with comments like 'Additional test cases...' when the user explicitly asked for multiple scenarios.",
].join("\n");

  const user = [
    `Guardrails:`,
    `- targetFramework: ${guard.framework}`,
    `- targetStyle: ${guard.style}`,
    `- locatorPreference: ${guard.locatorPreference}`,
    ``,
    `Question: ${question}`,
    ``,
    `Repo Context (top matches):`,
    context || "No relevant repo context found.",
    ``,
    `Mandatory Output Rules:`,
    `1) Do NOT provide only a sample or skeleton.`,
    `2) Generate separate complete test cases using test.describe() and multiple test() blocks.`,
    `3) Include multiple positive and negative scenarios if requested.`,
    `4) Do not write placeholder text like 'Additional test cases...'`,
    `5) If exact selectors are unknown, keep TODO comments only for selectors/assertions, but still generate all requested test cases.`,
  ].join("\n");

  const raw = await callLLMChat({ system, user });
  return raw;
}
/*
async function askRepo2({ repoDir, question, topK = 8 }) {
  const { repoIndex, vectors } = loadRepoKnowledge(repoDir);
  const guard = buildGuardrails(repoIndex);

  const hits = searchVectorIndex(vectors, question, topK);

  const context = hits
    .map((h, i) => `[#${i + 1}] ${h.path}:${h.start}\n${h.text}`)
    .join("\n\n");

  const system = [
    "You are a senior QA automation engineer assistant.",
    "You MUST follow the guardrails.",
    "If something is ambiguous, output TODO comments instead of guessing selectors.",
    "Prefer stable locators and best practices for the detected framework.",
    "Output must be actionable and concise.",
  ].join("\n");



  const user = [
    `Guardrails:`,
    `- targetFramework: ${guard.framework}`,
    `- targetStyle: ${guard.style} (pom/cucumber/testng/simple)`,
    `- locatorPreference: ${guard.locatorPreference}`,
    ``,
    `Question: ${question}`,
    ``,
    `Repo Context (top matches):`,
    context,
    ``,
    `Now answer with:`,
    `1) Best-practice guidance specific to this repo`,
    `2) If asked for code/tests: provide code ONLY in the target framework/style`,
  ].join("\n");

  // Reuse your existing LLM call:
  // NOTE: your callLLM currently uses SYSTEM_PROMPT from llmPrompts.js (IR JSON generator). :contentReference[oaicite:3]{index=3}
  // For Q&A/code, you should add a SECOND LLM function/prompt later.
  // For now, we can still call LLM, but you'd want to create callLLMChat(system,user).
 // const raw = await callLLM(`${system}\n\n${user}`);
  const raw = await callLLMChat({ system, user });
  return raw;
}
*/
module.exports = { askRepo };
