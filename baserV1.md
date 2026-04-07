# QA AI Test Generator (Base Version)

A chat-style QA assistant that:
1) Converts plain English test scenarios into a strict Intermediate Representation (IR) JSON
2) Renders that IR into framework-specific automation code (Playwright / Selenium Java)
3) (Next) Can analyze any target repository (Playwright/Cypress/Selenium) and produce a repo index + best-practice guidance

## Core Architecture

Plain English → LLM → IR JSON → Renderer → Test Code

- IR generator: `src/generateIRFromEnglish.js`
- LLM client: `src/llmClient.js`
- Prompt/schema (guardrails): `src/llmPrompts.js`
- Renderers:
  - Playwright: `src/renderPlaywright.js`
  - Selenium Java + TestNG: `src/renderSeleniumJava.js`

## Requirements

- Node.js 18+ (Node 20+ recommended)
- OpenAI API key (for IR generation)

## Setup

```bash
npm init -y
npm i openai dotenv


Create .env:

OPENAI_API_KEY=YOUR_KEY

Run Demos
Playwright generation (Plain English → IR → Playwright)

demo.js:

node demo.js

Selenium Java generation (Plain English → IR → Selenium TestNG)

demo2.js (demo_selenium style):

node demo2.js

IR Schema

The IR schema is defined in src/llmPrompts.js and must be valid JSON.
The LLM is instructed to output ONLY JSON, no markdown.

Next Modules (Repo Awareness)

Planned additions:

Repo analyzer (scan repo files, detect framework, collect conventions)

JSON index + vector-ish index for retrieval

Best practice guidance per framework/style

Format-enforced code generation (POM/Cucumber/TestNG) via prompt guardrails

Notes

This repo intentionally does not include real product tests.

The tool is meant to generate tests INTO a target repository (or output patches).

node tools/ask.js "alldata-qa" auto auto "$(tr '\n' ' ' < tools/testPrompt8.txt)"
