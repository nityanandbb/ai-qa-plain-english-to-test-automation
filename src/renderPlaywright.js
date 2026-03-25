// src/renderPlaywright.js
// src/renderPlaywright.js

function locatorToPlaywrightSelector(locator) {
  if (!locator) return "";
  switch (locator.strategy) {
    case "css":
      return locator.value;
    case "text":
      return `text=${locator.value}`;
    case "id":
      return `#${locator.value}`;
    case "dataTestId":
      return `[data-testid="${locator.value}"]`;
    case "xpath":
      return `xpath=${locator.value}`;
    default:
      return locator.value;
  }
}

function renderPlaywright(plan) {
  const lines = [];
  const firstDataset = plan.data && plan.data[0] ? plan.data[0].values : {};

  const needsMailinatorImport = Array.isArray(plan.reusableFunctions)
    && plan.reusableFunctions.some(
      (fn) => fn && fn.name === "fetchLatestOtpFromMailinator"
    );

  lines.push(`import { test, expect } from '@playwright/test';`);
  if (needsMailinatorImport) {
    lines.push(
      `import { fetchLatestOtpFromMailinator } from '../utils/mailinator';`
    );
  }
  lines.push("");

  function resolvePlaceholder(str) {
    if (str === undefined || str === null) return "";
    return String(str).replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return firstDataset[key] ?? plan.variables?.[key] ?? "";
    });
  }

  function escapeJsSingleQuote(str) {
    return String(str)
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'");
  }

  function renderStep(step, indent = "  ") {
    if (!step) return;

    if (step.type === "group") {
      lines.push(`${indent}// Group: ${step.name || "Unnamed"}`);
      (step.steps || []).forEach((s) => renderStep(s, indent));
      return;
    }

    if (step.type === "loop") {
      lines.push(
        `${indent}// TODO: loop over dataKey=${step.dataKey} (not implemented yet)`
      );
      return;
    }

    const selector = locatorToPlaywrightSelector(step.locator);

    switch (step.action) {
      case "goto":
        lines.push(
          `${indent}await page.goto('${escapeJsSingleQuote(
            resolvePlaceholder(step.url)
          )}');`
        );
        break;

      case "type":
        lines.push(
          `${indent}await page.locator('${escapeJsSingleQuote(
            selector
          )}').fill('${escapeJsSingleQuote(resolvePlaceholder(step.value))}');`
        );
        break;

      case "press":
        lines.push(
          `${indent}await page.keyboard.press('${escapeJsSingleQuote(
            step.key || ""
          )}');`
        );
        break;

      case "click":
        lines.push(
          `${indent}await page.locator('${escapeJsSingleQuote(
            selector
          )}').click();`
        );
        break;

      case "waitFor":
        lines.push(
          `${indent}await page.waitForSelector('${escapeJsSingleQuote(
            selector
          )}');`
        );
        break;

      case "assertVisible":
        lines.push(
          `${indent}await expect(page.locator('${escapeJsSingleQuote(
            selector
          )}')).toBeVisible();`
        );
        break;

      case "assertText":
        lines.push(
          `${indent}await expect(page.locator('${escapeJsSingleQuote(
            selector
          )}')).toContainText('${escapeJsSingleQuote(
            resolvePlaceholder(step.text)
          )}');`
        );
        break;

      case "assertCount":
        lines.push(
          `${indent}await expect(page.locator('${escapeJsSingleQuote(
            selector
          )}')).toHaveCount(${step.count || 0});`
        );
        break;

      case "fetchOtp":
        lines.push(
          `${indent}const ${step.saveAs || "otp"} = await fetchLatestOtpFromMailinator('${escapeJsSingleQuote(
            resolvePlaceholder(step.input?.email || "")
          )}');`
        );
        break;

      default:
        lines.push(`${indent}// TODO: Unhandled action: ${step.action}`);
    }
  }

  if (plan.testCases?.length) {
    lines.push(`test.describe('${escapeJsSingleQuote(plan.name || "AI Suite")}', () => {`);
    lines.push("");

    for (const tc of plan.testCases) {
      const title = `${tc.id ? `${tc.id} - ` : ""}${tc.title || "Untitled Test"}`;
      lines.push(`  test('${escapeJsSingleQuote(title)}', async ({ page }) => {`);
      (tc.steps || []).forEach((step) => renderStep(step, "    "));
      lines.push("  });");
      lines.push("");
    }

    lines.push("});");
  } else {
    const testName = plan.name || "AI Generated Test";
    lines.push(`test('${escapeJsSingleQuote(testName)}', async ({ page }) => {`);
    (plan.steps || []).forEach((step) => renderStep(step, "  "));
    lines.push("});");
  }

  if (plan.notes?.length) {
    lines.push("");
    lines.push("// Notes:");
    plan.notes.forEach((note) => {
      lines.push(`// - ${note}`);
    });
  }

  return lines.join("\n");
}

module.exports = {
  renderPlaywright,
};


/* base revert after 1st pr
function locatorToPlaywrightSelector(locator) {
  if (!locator) return "";
  switch (locator.strategy) {
    case "css":
      return locator.value;
    case "text":
      return `text=${locator.value}`;
    case "id":
      return `#${locator.value}`;
    case "dataTestId":
      return `[data-testid="${locator.value}"]`;
    case "xpath":
      return `xpath=${locator.value}`;
    default:
      return locator.value;
  }
}

function renderPlaywright(plan) {
  const lines = [];
  lines.push(`import { test, expect } from '@playwright/test';`);
  lines.push("");

  const testName = plan.name || "AI Generated Test";
  lines.push(`test('${testName}', async ({ page }) => {`);

  // Use first dataset for now
  const firstDataset = plan.data && plan.data[0] ? plan.data[0].values : {};

  function resolvePlaceholder(str) {
    if (!str) return str;
    return str.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return firstDataset[key] ?? plan.variables?.[key] ?? "";
    });
  }

  function renderStep(step, indent = "  ") {
    if (step.type === "group") {
      lines.push(`${indent}// Group: ${step.name || "Unnamed"}`);
      (step.steps || []).forEach((s) => renderStep(s, indent));
      return;
    }

    if (step.type === "loop") {
      lines.push(
        `${indent}// TODO: loop over dataKey=${step.dataKey} (not implemented yet)`
      );
      return;
    }

    const selector = locatorToPlaywrightSelector(step.locator);

    switch (step.action) {
      case "goto":
        lines.push(
          `${indent}await page.goto('${resolvePlaceholder(step.url)}');`
        );
        break;
      case "type":
        lines.push(
          `${indent}await page.locator('${selector}').fill('${resolvePlaceholder(
            step.value
          )}');`
        );
        break;
      case "press":
        lines.push(`${indent}await page.keyboard.press('${step.key}');`);
        break;
      case "click":
        lines.push(`${indent}await page.locator('${selector}').click();`);
        break;
      case "waitFor":
        lines.push(`${indent}await page.waitForSelector('${selector}');`);
        break;
      case "assertVisible":
        lines.push(
          `${indent}await expect(page.locator('${selector}')).toBeVisible();`
        );
        break;
      case "assertText":
        lines.push(
          `${indent}await expect(page.locator('${selector}')).toContainText('${resolvePlaceholder(
            step.text
          )}');`
        );
        break;
      default:
        lines.push(`${indent}// TODO: Unhandled action: ${step.action}`);
    }
  }

  (plan.steps || []).forEach((step) => renderStep(step));

  lines.push("});");

  return lines.join("\n");
}

module.exports = {
  renderPlaywright,
};

*/