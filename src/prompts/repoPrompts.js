function buildSystemPrompt(mode = "default") {
  const base = [
    "You are a senior QA automation engineer assistant.",
    "You must follow the detected repo guardrails.",
    "Do not switch framework unless explicitly asked.",
    "If selectors are unknown, add TODO comments instead of inventing unstable selectors.",
    "Prefer reusable and maintainable test design.",
  ];

  if (mode === "testcases") {
    base.push(
      "Generate structured QA test scenarios.",
      "Cover positive, negative, validation, and edge cases.",
      "Do not generate automation code unless explicitly asked.",
    );
  }

  if (mode === "automation") {
    base.push(
      "Generate automation code only in the target repo framework and style.",
      "Prefer reusable helper methods and page objects.",
      "Use stable locators according to repo conventions.",
    );
  }

  if (mode === "hybrid") {
    base.push(
      "First generate structured test cases, then generate automation skeleton for high-priority cases.",
    );
  }

  return base.join("\n");
}

function buildUserPrompt({ guard, question, context, mode = "default" }) {
  const lines = [
    `Guardrails:`,
    `- targetFramework: ${guard.framework}`,
    `- targetStyle: ${guard.style}`,
    `- locatorPreference: ${guard.locatorPreference}`,
    ``,
    `Mode: ${mode}`,
    ``,
    `Question: ${question}`,
    ``,
    `Repo Context (top matches):`,
    context || "No matching repo context found.",
    ``,
  ];

  if (mode === "testcases") {
    lines.push(
      `Answer format:`,
      `1) Positive test cases`,
      `2) Negative test cases`,
      `3) Validation test cases`,
      `4) Edge cases`,
      `5) Priority recommendation (P0/P1/P2)`,
    );
  } else if (mode === "automation") {
    lines.push(
      `Answer format:`,
      `1) Repo-specific best practices`,
      `2) Automation code only in target framework/style`,
      `3) Reusable helpers if applicable`,
    );
  } else if (mode === "hybrid") {
    lines.push(
      `Answer format:`,
      `1) Structured test cases`,
      `2) Automation priority`,
      `3) Automation skeleton for top cases`,
    );
  } else {
    lines.push(
      `Answer format:`,
      `1) Best-practice guidance specific to this repo`,
      `2) If asked for code/tests: provide code only in target framework/style`,
    );
  }

  return lines.join("\n");
}

module.exports = { buildSystemPrompt, buildUserPrompt };
