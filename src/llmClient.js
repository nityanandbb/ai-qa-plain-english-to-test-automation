// src/llmClient.js

const OpenAI = require("openai");
// const { SYSTEM_PROMPT } = require("./llmPrompts");
const { SYSTEM_PROMPT, SYSTEM_PROMPT_REPO_ASSISTANT } = require("./llmPrompts");


const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // safer than hardcoding
});

/**
 * Calls the OpenAI LLM and returns raw JSON string (the IR).
 * @param {string} plainSpec
 * @returns {Promise<string>} raw JSON string from model
 */
async function callLLM(plainSpec) {
  const userPrompt = `Plain English test:\n\n${plainSpec}`;

  const response = await client.chat.completions.create({
    model: "gpt-4o", // same as your curl
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0, // makes responses more stable
  });

  const output = response.choices[0].message.content;

  return output.trim(); // should be clean JSON
}

async function callLLMChat({ system, user }) {
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o",
    messages: [
      { role: "system", content: system || SYSTEM_PROMPT_REPO_ASSISTANT },
      { role: "user", content: user },
    ],
    temperature: 0.2,
  });

  return response.choices[0].message.content.trim();
}


module.exports = {
  callLLM,
  callLLMChat,
};
