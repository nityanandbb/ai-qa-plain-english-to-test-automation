// src/llmClient.js

const { SYSTEM_PROMPT } = require("./llmPrompts");

// TODO: Replace with real LLM SDK (OpenAI, etc.)
async function callLLM(plainSpec) {
  const userPrompt = `Plain English test:\n\n${plainSpec}`;

  // PSEUDO-CODE: Replace this with your LLM call.
  // Example shape if you use an SDK:
  //
  // const response = await openai.chat.completions.create({
  //   model: "gpt-4.1-mini",
  //   messages: [
  //     { role: "system", content: SYSTEM_PROMPT },
  //     { role: "user", content: userPrompt }
  //   ]
  // });
  //
  // const content = response.choices[0].message.content;

  // For now, just throw to remind you to plug the real API:
  throw new Error("callLLM is not implemented. Plug in your LLM here.");
}

module.exports = {
  callLLM,
};
