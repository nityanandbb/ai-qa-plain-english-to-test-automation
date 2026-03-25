// src/renderSeleniumJava.js
// Render IR TestPlan → Selenium + Java + TestNG code

// src/renderSeleniumJava.js
// Render IR TestPlan → Selenium + Java + TestNG code

function locatorToSeleniumBy(locator) {
  if (!locator) return 'By.cssSelector("body")';

  switch (locator.strategy) {
    case "css":
      return `By.cssSelector("${escapeJavaString(locator.value)}")`;
    case "xpath":
      return `By.xpath("${escapeJavaString(locator.value)}")`;
    case "id":
      return `By.id("${escapeJavaString(locator.value)}")`;
    case "dataTestId":
      return `By.cssSelector("[data-testid=\\"${escapeJavaString(locator.value)}\\"]")`;
    case "text":
      return `By.xpath("//*[contains(text(), \\"${escapeJavaString(locator.value)}\\")]")`;
    default:
      return `By.cssSelector("${escapeJavaString(locator.value || "body")}")`;
  }
}

function escapeJavaString(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
}

function toSafeJavaMethodName(name, fallback = "testFlow") {
  const cleaned = String(name || fallback)
    .replace(/[^A-Za-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((part, index) => {
      if (index === 0) return part.charAt(0).toLowerCase() + part.slice(1);
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join("");

  const safe = cleaned.replace(/^[^A-Za-z_]+/, "");
  return safe || fallback;
}

function renderSeleniumJava(plan) {
  const lines = [];

  const className =
    (plan.name || "AiGeneratedTest").replace(/[^A-Za-z0-9]/g, "") ||
    "AiGeneratedTest";

  const firstDataset = plan.data && plan.data[0] ? plan.data[0].values : {};
  const needsOtpComment = Array.isArray(plan.reusableFunctions)
    && plan.reusableFunctions.some(
      (fn) => fn && fn.name === "fetchLatestOtpFromMailinator"
    );

  function resolvePlaceholder(str) {
    if (str === undefined || str === null) return "";
    return String(str).replace(/\{\{(\w+)\}\}/g, (_, key) => {
      if (
        firstDataset &&
        Object.prototype.hasOwnProperty.call(firstDataset, key)
      ) {
        return firstDataset[key];
      }
      if (
        plan.variables &&
        Object.prototype.hasOwnProperty.call(plan.variables, key)
      ) {
        return plan.variables[key];
      }
      return "";
    });
  }

  function renderStep(step, indent = "        ") {
    if (!step) return;

    if (step.type === "group") {
      lines.push(`${indent}// Group: ${step.name || "Unnamed"}`);
      (step.steps || []).forEach((s) => renderStep(s, indent));
      return;
    }

    if (step.type === "loop") {
      lines.push(
        `${indent}// TODO: Loop over dataKey=${step.dataKey} not implemented yet`
      );
      return;
    }

    const byExpr = locatorToSeleniumBy(step.locator);

    switch (step.action) {
      case "goto":
        lines.push(
          `${indent}driver.get("${escapeJavaString(
            resolvePlaceholder(step.url)
          )}");`
        );
        break;

      case "type":
        lines.push(`${indent}driver.findElement(${byExpr}).clear();`);
        lines.push(
          `${indent}driver.findElement(${byExpr}).sendKeys("${escapeJavaString(
            resolvePlaceholder(step.value)
          )}");`
        );
        break;

      case "press":
        if (step.key === "Enter") {
          lines.push(
            `${indent}driver.switchTo().activeElement().sendKeys(Keys.ENTER);`
          );
        } else {
          lines.push(`${indent}// TODO: Handle key press: ${step.key}`);
        }
        break;

      case "click":
        lines.push(`${indent}driver.findElement(${byExpr}).click();`);
        break;

      case "waitFor":
        lines.push(
          `${indent}wait.until(ExpectedConditions.visibilityOfElementLocated(${byExpr}));`
        );
        break;

      case "assertVisible":
        lines.push(`${indent}{`);
        lines.push(
          `${indent}    WebElement el = driver.findElement(${byExpr});`
        );
        lines.push(`${indent}    assert el.isDisplayed();`);
        lines.push(`${indent}}`);
        break;

      case "assertText":
        lines.push(`${indent}{`);
        lines.push(
          `${indent}    WebElement el = driver.findElement(${byExpr});`
        );
        lines.push(`${indent}    String text = el.getText();`);
        lines.push(
          `${indent}    assert text.contains("${escapeJavaString(
            resolvePlaceholder(step.text)
          )}");`
        );
        lines.push(`${indent}}`);
        break;

      case "assertCount":
        lines.push(`${indent}{`);
        lines.push(
          `${indent}    List<WebElement> els = driver.findElements(${byExpr});`
        );
        lines.push(`${indent}    assert els.size() == ${step.count || 0};`);
        lines.push(`${indent}}`);
        break;

      case "fetchOtp":
        lines.push(
          `${indent}// TODO: Fetch OTP using reusable helper and save into variable: ${step.saveAs || "otp"}`
        );
        lines.push(
          `${indent}// Suggested input email: ${resolvePlaceholder(
            step.input?.email || ""
          )}`
        );
        break;

      default:
        lines.push(`${indent}// TODO: Unhandled action: ${step.action}`);
    }
  }

  // Imports
  lines.push("import org.openqa.selenium.By;");
  lines.push("import org.openqa.selenium.WebDriver;");
  lines.push("import org.openqa.selenium.WebElement;");
  lines.push("import org.openqa.selenium.chrome.ChromeDriver;");
  lines.push("import org.openqa.selenium.Keys;");
  lines.push("import org.openqa.selenium.support.ui.WebDriverWait;");
  lines.push("import org.openqa.selenium.support.ui.ExpectedConditions;");
  lines.push("import org.testng.annotations.*;");
  lines.push("import java.time.Duration;");
  lines.push("import java.util.List;");
  lines.push("");

  if (plan.notes?.length || needsOtpComment) {
    lines.push("/**");
    if (plan.notes?.length) {
      plan.notes.forEach((note) => {
        lines.push(` * ${note}`);
      });
    }
    if (needsOtpComment) {
      lines.push(" * Reusable OTP helper requested by plan.");
    }
    lines.push(" */");
  }

  // Class
  lines.push(`public class ${className} {`);
  lines.push("    private WebDriver driver;");
  lines.push("    private WebDriverWait wait;");
  lines.push("");

  // Setup
  lines.push("    @BeforeClass");
  lines.push("    public void setUp() {");
  lines.push("        driver = new ChromeDriver();");
  lines.push(
    "        wait = new WebDriverWait(driver, Duration.ofSeconds(10));"
  );
  lines.push("    }");
  lines.push("");

  // Multiple tests or fallback single flow
  if (plan.testCases?.length) {
    plan.testCases.forEach((tc, index) => {
      const methodName = toSafeJavaMethodName(
        `${tc.id || `tc${index + 1}`} ${tc.title || `Test ${index + 1}`}`,
        `testCase${index + 1}`
      );

      lines.push("    @Test");
      lines.push(`    public void ${methodName}() throws Exception {`);
      (tc.steps || []).forEach((step) => renderStep(step));
      lines.push("    }");
      lines.push("");
    });
  } else {
    lines.push("    @Test");
    lines.push("    public void testFlow() throws Exception {");
    (plan.steps || []).forEach((step) => renderStep(step));
    lines.push("    }");
    lines.push("");
  }

  // Teardown
  lines.push("    @AfterClass");
  lines.push("    public void tearDown() {");
  lines.push("        if (driver != null) {");
  lines.push("            driver.quit();");
  lines.push("        }");
  lines.push("    }");
  lines.push("}");

  return lines.join("\n");
}

module.exports = {
  renderSeleniumJava,
};

/* V1 base Rev after 1st pr.

function locatorToSeleniumBy(locator) {
  if (!locator) return 'By.cssSelector("body")';

  switch (locator.strategy) {
    case "css":
      return `By.cssSelector("${locator.value}")`;
    case "xpath":
      return `By.xpath("${locator.value}")`;
    case "id":
      return `By.id("${locator.value}")`;
    case "dataTestId":
      return `By.cssSelector("[data-testid=\\"${locator.value}\\"]")`;
    case "text":
      // generic text search
      return `By.xpath("//*[contains(text(), \\"${locator.value}\\")]")`;
    default:
      return `By.cssSelector("${locator.value}")`;
  }
}

function renderSeleniumJava(plan) {
  const lines = [];

  const className =
    (plan.name || "AiGeneratedTest").replace(/[^A-Za-z0-9]/g, "") ||
    "AiGeneratedTest";

  // Imports
  lines.push("import org.openqa.selenium.By;");
  lines.push("import org.openqa.selenium.WebDriver;");
  lines.push("import org.openqa.selenium.WebElement;");
  lines.push("import org.openqa.selenium.chrome.ChromeDriver;");
  lines.push("import org.openqa.selenium.Keys;");
  lines.push("import org.openqa.selenium.support.ui.WebDriverWait;");
  lines.push("import org.openqa.selenium.support.ui.ExpectedConditions;");
  lines.push("import org.testng.annotations.*;");
  lines.push("import java.time.Duration;");
  lines.push("import java.util.List;");
  lines.push("");
  // Class
  lines.push(`public class ${className} {`);
  lines.push("    private WebDriver driver;");
  lines.push("    private WebDriverWait wait;");
  lines.push("");
  // Setup
  lines.push("    @BeforeClass");
  lines.push("    public void setUp() {");
  lines.push("        driver = new ChromeDriver();");
  lines.push(
    "        wait = new WebDriverWait(driver, Duration.ofSeconds(10));"
  );
  lines.push("    }");
  lines.push("");
  // Test
  lines.push("    @Test");
  lines.push("    public void testFlow() throws Exception {");

  const firstDataset = plan.data && plan.data[0] ? plan.data[0].values : {};

  function resolvePlaceholder(str) {
    if (!str) return str;
    return str.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      if (
        firstDataset &&
        Object.prototype.hasOwnProperty.call(firstDataset, key)
      ) {
        return firstDataset[key];
      }
      if (
        plan.variables &&
        Object.prototype.hasOwnProperty.call(plan.variables, key)
      ) {
        return plan.variables[key];
      }
      return "";
    });
  }

  function renderStep(step, indent = "        ") {
    if (step.type === "group") {
      lines.push(`${indent}// Group: ${step.name || "Unnamed"}`);
      (step.steps || []).forEach((s) => renderStep(s, indent));
      return;
    }

    if (step.type === "loop") {
      lines.push(
        `${indent}// TODO: Loop over dataKey=${step.dataKey} not implemented yet`
      );
      return;
    }

    const byExpr = locatorToSeleniumBy(step.locator);

    switch (step.action) {
      case "goto":
        lines.push(`${indent}driver.get("${resolvePlaceholder(step.url)}");`);
        break;

      case "type":
        lines.push(`${indent}driver.findElement(${byExpr}).clear();`);
        lines.push(
          `${indent}driver.findElement(${byExpr}).sendKeys("${resolvePlaceholder(
            step.value
          )}");`
        );
        break;

      case "press":
        if (step.key === "Enter") {
          lines.push(
            `${indent}driver.switchTo().activeElement().sendKeys(Keys.ENTER);`
          );
        } else {
          lines.push(`${indent}// TODO: Handle key press: ${step.key}`);
        }
        break;

      case "click":
        lines.push(`${indent}driver.findElement(${byExpr}).click();`);
        break;

      case "waitFor":
        lines.push(
          `${indent}wait.until(ExpectedConditions.visibilityOfElementLocated(${byExpr}));`
        );
        break;

      case "assertVisible":
        lines.push(`${indent}{`);
        lines.push(
          `${indent}    WebElement el = driver.findElement(${byExpr});`
        );
        lines.push(`${indent}    assert el.isDisplayed();`);
        lines.push(`${indent}}`);
        break;

      case "assertText":
        lines.push(`${indent}{`);
        lines.push(
          `${indent}    WebElement el = driver.findElement(${byExpr});`
        );
        lines.push(`${indent}    String text = el.getText();`);
        lines.push(
          `${indent}    assert text.contains("${resolvePlaceholder(
            step.text
          )}");`
        );
        lines.push(`${indent}}`);
        break;

      case "assertCount":
        lines.push(`${indent}{`);
        lines.push(
          `${indent}    List<WebElement> els = driver.findElements(${byExpr});`
        );
        lines.push(`${indent}    assert els.size() == ${step.count || 0};`);
        lines.push(`${indent}}`);
        break;

      default:
        lines.push(`${indent}// TODO: Unhandled action: ${step.action}`);
    }
  }

  (plan.steps || []).forEach((step) => renderStep(step));

  lines.push("    }");
  lines.push("");
  // Teardown
  lines.push("    @AfterClass");
  lines.push("    public void tearDown() {");
  lines.push("        if (driver != null) {");
  lines.push("            driver.quit();");
  lines.push("        }");
  lines.push("    }");
  lines.push("}");
  return lines.join("\n");
}

module.exports = {
  renderSeleniumJava,
};

*/