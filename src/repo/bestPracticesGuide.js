// src/repo/bestPracticesGuide.js

function bestPracticesForRepo(repoIndex) {
  const detected = repoIndex.detected || {};
  const conv = repoIndex.conventions || {};

  const tips = [];

  // Locator best practices
  if (conv.locators?.prefersDataTestId) {
    tips.push(
      "Prefer data-testid locators for stability (consistent with repo)."
    );
  } else {
    tips.push(
      "Prefer role-based locators (getByRole) or add data-testid for stability."
    );
  }

  // Playwright guidance
  if (detected.playwright) {
    tips.push(
      "Playwright: use web-first assertions (expect(locator).toBeVisible()) instead of hard waits."
    );
    tips.push("Playwright: avoid waitForTimeout; use locator-based waiting.");
  }

  // Cypress guidance
  if (detected.cypress) {
    tips.push(
      "Cypress: avoid arbitrary cy.wait(); prefer cy.intercept + wait on network aliases."
    );
    tips.push("Cypress: use data-testid and custom commands for reuse.");
  }

  // Selenium guidance
  if (detected.seleniumJava || detected.seleniumPython) {
    tips.push(
      "Selenium: avoid Thread.sleep; use WebDriverWait + ExpectedConditions."
    );
    tips.push("Selenium: centralize locators + actions in Page Object Model.");
  }

  // Structure guidance
  if (conv.structure?.hasCucumber) {
    tips.push(
      "Repo uses Cucumber: generate .feature + step definitions instead of raw tests."
    );
  }
  if (conv.structure?.hasTestNG) {
    tips.push(
      "Repo uses TestNG: generate @Test classes + @BeforeClass/@AfterClass patterns."
    );
  }
  if (conv.structure?.hasPageObjects) {
    tips.push(
      "Repo uses POM: generate Page classes + keep assertions in tests where possible."
    );
  } else {
    tips.push("Consider introducing POM if tests grow; keep actions reusable.");
  }

  return tips;
}

module.exports = { bestPracticesForRepo };
