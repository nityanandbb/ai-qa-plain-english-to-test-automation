# Note : “We first convert the repo into structured knowledge, then MCP combines that with prompts and sends it to the LLM to generate framework-aligned automation code.”
# We can further enhance this with vector DB (FAISS) for semantic search and real-time repo sync
# Unlike Copilot or Cursor, our MCP Playwright solution understands our repository, follows our framework rules, and generates production-ready QA automation from plain English — even offline.

Run:

node tools/ask.js /path/to/any/repo "What framework is this repo using and best practices?"


Or:

node tools/ask.js /path/to/any/repo "Generate Playwright POM test for login popup and click login button"


 ***  flows**:
 Note : steps @233

* ✅ **Without repo** (plain English → IR → code)
* ✅ **With repo** (scan/build knowledge → ask questions repeatedly)

````md
# localTest.md — Local Testing Guide (Repo / No-Repo)

This project supports two ways of working:

1) **No-Repo Mode**: Give plain English → generate IR JSON → render test code  
2) **Repo-Aware Mode**: Scan any target repo → build `.qa-ai` knowledge → ask questions / generate code using that context

---

## Prerequisites

- Node.js 18+ (Node 20+ recommended)
- `.env` file with OpenAI key (only required for LLM features)

Create `.env` at project root:
```bash
OPENAI_API_KEY=your_key_here
````

Install deps:

```bash
npm install
```

---

# A) No-Repo Mode (Plain English → Code)

## A1) Run Playwright generation demo (LLM → IR → Playwright code)

Command:

```bash
node demo.js
```

What it does:

* Uses a plain-English spec inside `demo.js`
* Converts to IR using LLM
* Renders Playwright test code and prints it

---

## A2) Run Selenium Java generation demo (LLM → IR → Selenium TestNG code)

Command:

```bash
node demo2.js
```

What it does:

* Uses a plain-English spec inside `demo2.js` (Selenium demo)
* Converts to IR using LLM
* Renders Selenium Java + TestNG code and prints it

---

## A3) Rule-based quick demo (no LLM)

Command:

```bash
node generateTest.js
```

What it does:

* Uses a simple rule-engine to convert a hardcoded English spec into Playwright code
* Prints generated code

> Note: This is just a fallback demo. The recommended pipeline is LLM → IR → Renderer.

---

# B) Repo-Aware Mode (Scan Repo → Build Knowledge → Ask Questions)

Repo-aware mode is for:

* Detecting framework & conventions (Playwright/Cypress/Selenium)
* Building a local repo index + vector-ish store
* Answering questions / generating code based on actual repo patterns

## Folder output

Repo knowledge is written into the TARGET repo:

```
<target-repo>/.qa-ai/
  ├─ repo-index.json
  └─ repo-vectors.json
```

---

## B1) Build knowledge once (scan + save)

Create a tool file: `tools/build.js`

Run:

```bash
node tools/build.js /absolute/path/to/target-repo
```

Expected output:

* “Repo knowledge built”
* `.qa-ai/repo-index.json` and `.qa-ai/repo-vectors.json` created inside the target repo

✅ You only need to rerun this if the repo changes a lot (or you want fresh indexing).

---

## B2) Ask questions using saved knowledge (no re-scan)

Create a tool file: `tools/ask.js`

Run:

```bash
node tools/ask.js /absolute/path/to/target-repo "What framework is this repo using? What best practices should I follow?"
```

More examples:

```bash
node tools/ask.js /absolute/path/to/target-repo "Where are tests located in this repo and what structure is used?"
```

```bash
node tools/ask.js /absolute/path/to/target-repo "Generate a Playwright test for: visit homepage, logo visible, login popup visible, click login. Follow repo style."
```

```bash
node tools/ask.js /absolute/path/to/target-repo "This test is flaky: <paste code>. Fix it in repo conventions."
```

✅ You can keep asking questions as many times as you want after building `.qa-ai`.

---

## B3) One-command build + ask (optional convenience)

If you create `tools/run.js` that calls build + ask, then run:

```bash
node tools/run.js /absolute/path/to/target-repo
```

But recommended workflow is:

* build once (`tools/build.js`)
* ask many times (`tools/ask.js`)

---

# C) Ask Questions WITHOUT a repo (Q&A mode)

If you want “ask” mode without scanning a repo, you can do:

* Ask general best practices (no repo context)
* Generate code in a chosen framework style (Playwright/Selenium/etc.)
* Debug code pasted in chat

Recommended: create a `tools/askNoRepo.js` that calls the LLM with guardrails like:

* targetFramework: playwright
* targetStyle: pom / cucumber / testng
* locatorPreference: role / data-testid

Example command (when you implement it):

```bash
node tools/askNoRepo.js "Generate Playwright POM test for login popup + click login. Use best practices."
```

---

# D) Notes / Tips

## D1) When to rebuild repo knowledge?

Rebuild when:

* new test framework added
* new locator conventions introduced
* new page-object/test structure created

Command:

```bash
node tools/build.js /absolute/path/to/target-repo
```

## D2) Keep generated tests separate repo?

Yes, recommended approach:

* Use a dedicated tests repo for experiments
* Later point repo-aware mode to any client repo

## D3) Guardrails you should enforce (recommended)

* Output must match selected style (POM / Cucumber / TestNG)
* Do not guess selectors: if unsure, add TODO + ask for selector hint
* No hard waits (`waitForTimeout`, `Thread.sleep`, `cy.wait(5000)`)
* Prefer stable locators (`data-testid` or `getByRole`)

```


===============================================================================================

Steps

## 1) Build knowledge (scan + index) for a repo

Run this once per repo (or whenever you want to refresh the index):

```bash
node tools/build.js "/absolute/path/to/target-repo"
```

What it does:

* Scans files in that repo
* Creates (inside that repo):

  * `.qa-ai/repo-index.json`
  * `.qa-ai/repo-vectors.json`

✅ After this, the repo is “indexed”.

---

## 2) Ask questions using the saved index (no re-scan)

Now you can ask as many times as you want:

```bash
node tools/ask.js "/absolute/path/to/target-repo" "What framework is this repo using and where are tests located?"
```

More examples:

```bash
node tools/ask.js "/absolute/path/to/target-repo" "What best practices should I follow for this repo's Playwright framework?"
```

```bash
node tools/ask.js "/absolute/path/to/target-repo" "Generate a POM-style Playwright test for: visit home, logo visible, login popup visible, click login."
```

---

## Optional: Refresh index after changes

If the repo changed a lot (new tests/pages/utils), rebuild:

```bash
node tools/build.js "/absolute/path/to/target-repo"
```

Then continue asking questions again with `tools/ask.js`.


// /Users/qed42/Desktop/alldata-playwright


node tools/build.js "/Users/qed42/Desktop/alldata-playwright"


node tools/ask.js "/Users/qed42/Desktop/alldata-playwright" "What framework is this repo using and where are tests located?"

node tools/ask.js "/Users/qed42/Desktop/alldata-playwright" "Generate a POM-style Playwright test for: visit home, logo visible, login popup visible, click login."



# Refresh index after changes

If the repo changed a lot (new tests/pages/utils), rebuild:

node tools/build.js "/absolute/path/to/target-repo"

#  code get basic artifact :- 
node tools/ask.js "/Users/qed42/Desktop/alldata-playwright" \
"Generate a POM-style Playwright test for: visit home, logo visible, login popup visible, click login."

# Debug prompts llms and mcp is calling :- grep -n "askRepo\|generateIRFromEnglish\|callLLMChat\|callLLM" tools/ask.js src/repo/askRepo.js src/llmClient.js src/llmPrompts.js

# grep -n "callLLM" src/repo/askRepo.js
# node tools/ask.js "/Users/qed42/Desktop/alldata-playwright" "Generate a POM-style Playwright test for: visit home, logo visible, login popup visible, click login."


# Without directly typing text in terminal use "Txt" files Recommended way.
# 1. node tools/ask.js "/Users/qed42/Desktop/alldata-playwright" auto auto "$(cat tools/testPrompt6.txt)"
# 2. Testing and wrting code alternatively : src/demo3.js // debug
# 3A : node tools/build.js /Users/qed42/NB2025/allDataRepo/alldata-qa                                         

# 3. node tools/ask.js "alldata-qa" auto auto "$(tr '\n' ' ' < tools/testPrompt7.txt)"
# 4. Storybook UI : /*
node tools/ask-storybook.js \
"http://localhost:6006/?path=/story/forms-registrationform--default" \
"Generate Playwright JS POM tests with validations for this registration form"
*/

node tools/ask-storybook.js \
"http://google.com" \
"Generate Playwright JS POM tests with validations for this Google Search"
*/

node tools/ask.js "alldata-qa" auto auto "$(tr '\n' ' ' < tools/testPrompt8.txt)"

                ┌──────────────────────────┐
                │      User Input          │
                │  (Plain English Test)    │
                └────────────┬─────────────┘
                             │
                             ▼
                ┌──────────────────────────┐
                │       ask.js CLI         │
                │  (Prompt Orchestrator)   │
                └────────────┬─────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ System Prompt │   │ Repo Knowledge   │   │ User Prompt       │
│ (Rules: POM,  │   │ (.qa-ai folder) │   │ (Test Scenario)   │
│ Playwright)   │   │ Indexed via     │   │                  │
└──────────────┘   │ build.js         │   └──────────────────┘
                   └────────┬─────────┘
                            │
                            ▼
                ┌──────────────────────────┐
                │        MCP Layer         │
                │ (Context + Tool Bridge)  │
                └────────────┬─────────────┘
                             │
                             ▼
                ┌──────────────────────────┐
                │        LLM Model         │
                │ (OpenAI / Ollama / etc.) │
                └────────────┬─────────────┘
                             │
                             ▼
                ┌──────────────────────────┐
                │   Generated Output       │
                │ Playwright Test + POM    │
                └──────────────────────────┘


    1. clone repo
    2. npm install
    3. build it
    4. add open ai key in .env file 
    5. ask questions.
    node tools/build.js /Users/qed42/NB2025/allDataRepo/alldata-qa
    node tools/ask.js "alldata-qa" auto auto "$(tr '\n' ' ' < tools/testPrompt8.txt)"
    
