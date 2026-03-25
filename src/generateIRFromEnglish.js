// src/generateIRFromEnglish.js

// src/generateIRFromEnglish.js

const { callLLM } = require("./llmClient");

/**
 * Extract pure JSON from LLM output.
 * Handles:
 * 1. ```json ... ```
 * 2. ``` ... ```
 * 3. extra text before/after JSON
 */
function extractJson(text) {
  if (!text || typeof text !== "string") {
    throw new Error("LLM output is empty or not a string");
  }

  const trimmed = text.trim();

  // Case 1: fenced markdown block
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch) {
    return fencedMatch[1].trim();
  }

  // Case 2: raw JSON object inside extra text
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1).trim();
  }

  throw new Error("Could not extract JSON from LLM output");
}

/**
 * Takes a plain-English test and returns the IR plan (JSON as JS object).
 * This is where the AI+schema magic happens.
 */
async function generateIRFromEnglish(plainSpec) {
  const rawJson = await callLLM(plainSpec);

  let plan;
  try {
    const cleanedJson = extractJson(rawJson);
    plan = JSON.parse(cleanedJson);
  } catch (e) {
    console.error("Raw LLM output:", rawJson);
    throw new Error("Failed to parse LLM JSON: " + e.message);
  }

  return plan; // { name, variables, data, steps: [...] }
}

module.exports = {
  generateIRFromEnglish,
};


/* Prior Version with json errors 

const { callLLM } = require("./llmClient");
*/

/**
 * Takes a plain-English test and returns the IR plan (JSON as JS object).
 * This is where the AI+schema magic happens.
 */
/*
async function generateIRFromEnglish(plainSpec) {
  const rawJson = await callLLM(plainSpec);

  let plan;
  try {
    plan = JSON.parse(rawJson);
  } catch (e) {
    console.error("Raw LLM output:", rawJson);
    throw new Error("Failed to parse LLM JSON: " + e.message);
  }

  return plan; // { name, variables, data, steps: [...] }
}

module.exports = {
  generateIRFromEnglish,
};

*/
// Prior version end