// aiTestModule.js
// Goal: One AI-style module that converts plain English to
// framework-agnostic steps, then renders to Playwright / Cypress / Selenium, etc.

// -------------------- TYPES (conceptual) --------------------
// IR = Intermediate Representation of the test

/**
 * @typedef {Object} TestStep
 * @property {string} action
 * @property {string} [url]
 * @property {string} [selector]
 * @property {string} [value]
 * @property {string} [key]
 * @property {string} [text]
 */

/**
 * @typedef {Object} TestPlan
 * @property {string} name
 * @property {TestStep[]} steps
 */

// -------------------- 1) "AI" INTERPRETER (spec → IR) --------------------
// For now: simple rule-based. Later: replace with LLM.

function interpretPlainSpecToIR(spec) {
  const lines = spec
    .split(/\n|\./)
    .map((l) => l.trim())
    .filter(Boolean);

  /** @type {TestStep[]} */
  const steps = [];

  for (const line of lines) {
    const lower = line.toLowerCase();

    // open / navigate / go to
    if (
      lower.startsWith("open ") ||
      lower.startsWith("go to") ||
      lower.startsWith("navigate")
    ) {
      let url = "https://www.google.com";
      const urlMatch = line.match(/https?:\/\/\S+/);
      if (urlMatch) {
        url = urlMatch[0];
      } else if (lower.includes("google")) {
        url = "https://www.google.com";
      }
      steps.push({ action: "goto", url });
      continue;
    }

    // search for "text"
    if (lower.startsWith("search for")) {
      const match = line.match(/"([^"]+)"/);
      const value = match ? match[1] : line.replace(/search for/i, "").trim();
      steps.push({ action: "type", selector: "input[name='q']", value });
      steps.push({ action: "press", key: "Enter" });
      continue;
    }

    // click something
    if (lower.startsWith("click")) {
      // naive: use button text inside quotes
      const match = line.match(/"([^"]+)"/);
      if (match) {
        steps.push({
          action: "click",
          selector: `text=${match[1]}`,
        });
      } else {
        steps.push({ action: "comment", text: `Unmapped click step: ${line}` });
      }
      continue;
    }

    // verify results / text
    if (lower.startsWith("verify")) {
      if (lower.includes("result")) {
        steps.push({ action: "waitFor", selector: "#search" });
        steps.push({ action: "assertVisible", selector: "#search" });
      } else {
        // verify "some text"
        const match = line.match(/"([^"]+)"/);
        if (match) {
          steps.push({
            action: "assertText",
            selector: "body",
            text: match[1],
          });
        } else {
          steps.push({
            action: "comment",
            text: `Unmapped verify step: ${line}`,
          });
        }
      }
      continue;
    }

    steps.push({ action: "comment", text: `Unmapped line: ${line}` });
  }

  /** @type {TestPlan} */
  const plan = {
    name: "AI Generated Test",
    steps,
  };

  return plan;
}

// -------------------- 2) RENDERERS (IR → CODE) --------------------

function renderPlaywrightJS(plan) {
  const lines = [];
  lines.push(`import { test, expect } from '@playwright/test';`);
  lines.push("");
  lines.push(`test('${plan.name}', async ({ page }) => {`);

  for (const step of plan.steps) {
    switch (step.action) {
      case "goto":
        lines.push(`  await page.goto('${step.url}');`);
        break;
      case "type":
        lines.push(
          `  await page.locator('${step.selector}').fill('${step.value}');`
        );
        break;
      case "press":
        lines.push(`  await page.keyboard.press('${step.key}');`);
        break;
      case "click":
        lines.push(`  await page.locator('${step.selector}').click();`);
        break;
      case "waitFor":
        lines.push(`  await page.waitForSelector('${step.selector}');`);
        break;
      case "assertVisible":
        lines.push(
          `  await expect(page.locator('${step.selector}')).toBeVisible();`
        );
        break;
      case "assertText":
        lines.push(
          `  await expect(page.locator('${step.selector}')).toContainText('${step.text}');`
        );
        break;
      case "comment":
        lines.push(`  // NOTE: ${step.text}`);
        break;
      default:
        lines.push(`  // TODO: Unhandled step: ${JSON.stringify(step)}`);
    }
  }

  lines.push("});");
  return lines.join("\n");
}

function renderCypressJS(plan) {
  const lines = [];
  lines.push(`describe('${plan.name}', () => {`);
  lines.push(`  it('runs AI generated flow', () => {`);

  for (const step of plan.steps) {
    switch (step.action) {
      case "goto":
        lines.push(`    cy.visit('${step.url}');`);
        break;
      case "type":
        lines.push(`    cy.get('${step.selector}').type('${step.value}');`);
        break;
      case "press":
        // Cypress doesn't press keys globally as easily; quick hack for Enter
        if (step.key === "Enter") {
          lines.push(`    cy.focused().type('{enter}');`);
        } else {
          lines.push(`    // TODO: key press '${step.key}'`);
        }
        break;
      case "click":
        lines.push(
          `    cy.contains(${JSON.stringify(
            step.selector.replace("text=", "")
          )}).click();`
        );
        break;
      case "waitFor":
        lines.push(`    cy.get('${step.selector}').should('exist');`);
        break;
      case "assertVisible":
        lines.push(`    cy.get('${step.selector}').should('be.visible');`);
        break;
      case "assertText":
        lines.push(
          `    cy.get('${step.selector}').should('contain', '${step.text}');`
        );
        break;
      case "comment":
        lines.push(`    // NOTE: ${step.text}`);
        break;
      default:
        lines.push(`    // TODO: Unhandled step: ${JSON.stringify(step)}`);
    }
  }

  lines.push("  });");
  lines.push("});");
  return lines.join("\n");
}

function renderSeleniumJava(plan) {
  const lines = [];
  lines.push("import org.openqa.selenium.*;");
  lines.push("import org.openqa.selenium.chrome.ChromeDriver;");
  lines.push("import org.testng.annotations.*;");
  lines.push("");
  lines.push("public class AiGeneratedTest {");
  lines.push("  private WebDriver driver;");
  lines.push("");
  lines.push("  @BeforeClass");
  lines.push("  public void setUp() {");
  lines.push("    driver = new ChromeDriver();");
  lines.push("  }");
  lines.push("");
  lines.push("  @Test");
  lines.push(`  public void testFlow() throws InterruptedException {`);

  for (const step of plan.steps) {
    switch (step.action) {
      case "goto":
        lines.push(`    driver.get("${step.url}");`);
        break;
      case "type":
        lines.push(
          `    driver.findElement(By.cssSelector("${step.selector}")).sendKeys("${step.value}");`
        );
        break;
      case "press":
        if (step.key === "Enter") {
          lines.push(
            "    driver.switchTo().activeElement().sendKeys(Keys.ENTER);"
          );
        } else {
          lines.push(`    // TODO: key press '${step.key}'`);
        }
        break;
      case "click":
        lines.push(
          `    driver.findElement(By.cssSelector("${step.selector}")).click();`
        );
        break;
      case "waitFor":
        lines.push(
          "    Thread.sleep(3000); // TODO: replace with WebDriverWait"
        );
        break;
      case "assertVisible":
        lines.push(
          `    boolean visible = driver.findElement(By.cssSelector("${step.selector}")).isDisplayed();`
        );
        lines.push("    assert visible;");
        break;
      case "assertText":
        lines.push(
          `    String bodyText = driver.findElement(By.tagName("body")).getText();`
        );
        lines.push(`    assert bodyText.contains("${step.text}");`);
        break;
      case "comment":
        lines.push(`    // NOTE: ${step.text}`);
        break;
      default:
        lines.push(`    // TODO: Unhandled step: ${JSON.stringify(step)}`);
    }
  }

  lines.push("  }");
  lines.push("");
  lines.push("  @AfterClass");
  lines.push("  public void tearDown() {");
  lines.push("    if (driver != null) driver.quit();");
  lines.push("  }");
  lines.push("}");
  return lines.join("\n");
}

// -------------------- 3) PUBLIC ENTRY API --------------------

/**
 * Generate test code from plain English, targeting different tools.
 * @param {string} spec - plain English test description
 * @param {'playwright-js' | 'cypress-js' | 'selenium-java'} target
 * @returns {string} code
 */
function generateTest(spec, target) {
  const plan = interpretPlainSpecToIR(spec);

  switch (target) {
    case "playwright-js":
      return renderPlaywrightJS(plan);
    case "cypress-js":
      return renderCypressJS(plan);
    case "selenium-java":
      return renderSeleniumJava(plan);
    default:
      throw new Error(`Unsupported target: ${target}`);
  }
}

// -------------------- DEMO --------------------
// You can delete this part in your library and only export generateTest.

if (require.main === module) {
  const spec = `
Open the Google homepage.
Search for the text "Selenium WebDriver".
Verify that the search results page shows results.
  `;

  console.log("=== Playwright JS ===");
  console.log(generateTest(spec, "playwright-js"));
  console.log("\n=== Cypress JS ===");
  console.log(generateTest(spec, "cypress-js"));
  console.log("\n=== Selenium Java ===");
  console.log(generateTest(spec, "selenium-java"));
}

// -------------------- EXPORTS --------------------
module.exports = {
  generateTest,
  interpretPlainSpecToIR, // export this if you want to plug in real AI later
};
