// generateTest.js
// Very simple rule-based "AI" that converts plain English steps
// into a Playwright test script.
//
// You can later replace the rule-engine with an NLP/LLM module.
//
// Usage (for now):
//   node generateTest.js
//
// It will print the generated Playwright test code to the console.

function parsePlainEnglishSpec(specText) {
  const lines = specText
    .split(/\n|\./) // split by newline or period
    .map((l) => l.trim())
    .filter(Boolean); // remove empty

  const steps = [];

  for (const line of lines) {
    const lower = line.toLowerCase();

    // 1) Open / Go to / Navigate
    if (
      lower.startsWith("open ") ||
      lower.startsWith("go to") ||
      lower.startsWith("navigate to")
    ) {
      // very naive URL detection
      let url = "https://www.google.com";

      // if line contains 'google'
      if (lower.includes("google")) {
        url = "https://www.google.com";
      }

      // you can add more custom mappings here later

      steps.push({ type: "goto", url });
      continue;
    }

    // 2) Search for text "X"
    if (lower.startsWith("search for")) {
      // Try to extract phrase in quotes
      const match = line.match(/"([^"]+)"/);
      const searchText = match
        ? match[1]
        : line.replace(/search for/i, "").trim();

      steps.push({
        type: "fill",
        selector: "input[name='q']",
        value: searchText,
      });
      steps.push({
        type: "press",
        key: "Enter",
      });
      continue;
    }

    // 3) Verify results are shown
    if (lower.startsWith("verify") && lower.includes("result")) {
      steps.push({
        type: "waitForSelector",
        selector: "#search", // Google search results container
      });
      steps.push({
        type: "assertVisible",
        selector: "#search",
      });
      continue;
    }

    // Fallback: log unknown lines (for debugging / future AI handling)
    steps.push({
      type: "comment",
      text: `Unmapped step (needs AI/NLP): ${line}`,
    });
  }

  return steps;
}

function generatePlaywrightTestCode(testName, steps) {
  const lines = [];

  lines.push(`import { test, expect } from '@playwright/test';`);
  lines.push("");
  lines.push(`test('${testName}', async ({ page }) => {`);

  for (const step of steps) {
    switch (step.type) {
      case "goto":
        lines.push(`  await page.goto('${step.url}');`);
        break;
      case "fill":
        lines.push(
          `  await page.locator('${step.selector}').fill('${step.value}');`
        );
        break;
      case "press":
        lines.push(`  await page.keyboard.press('${step.key}');`);
        break;
      case "waitForSelector":
        lines.push(`  await page.waitForSelector('${step.selector}');`);
        break;
      case "assertVisible":
        lines.push(
          `  await expect(page.locator('${step.selector}')).toBeVisible();`
        );
        break;
      case "comment":
        lines.push(`  // TODO: ${step.text}`);
        break;
      default:
        lines.push(`  // TODO: Unhandled step type: ${JSON.stringify(step)}`);
    }
  }

  lines.push("});");

  return lines.join("\n");
}

// ------------------ DEMO INPUT ------------------

// This is your plain English test spec.
// Later you can read this from a file or UI.
const plainSpec = `
Open the Google homepage.
Search for the text "Selenium WebDriver".
Verify that the search results page shows results.
`;

// 1) Parse the plain English into internal step objects
const steps = parsePlainEnglishSpec(plainSpec);

// 2) Generate Playwright test code from steps
const testName = "Google search for Selenium WebDriver";
const generatedCode = generatePlaywrightTestCode(testName, steps);

// 3) Print to console (you can write to file instead)
console.log(generatedCode);
