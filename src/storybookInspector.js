const { chromium } = require("playwright");

async function inspectStorybookPage(url) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    const frame = page.frameLocator("#storybook-preview-iframe");

    // Wait for the story body to exist
    await frame.locator("body").waitFor({
      state: "attached",
      timeout: 15000,
    });

    // Prefer waiting for actual visible form controls inside the rendered story
    await frame.locator("form, input, select, textarea").first().waitFor({
      state: "attached",
      timeout: 15000,
    });

    const summary = await frame.locator("body").evaluate(() => {
      const clean = (v) => (v || "").trim();

      const isVisible = (el) => {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();

        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0" &&
          rect.width > 0 &&
          rect.height > 0
        );
      };

      const labels = Array.from(document.querySelectorAll("label"))
        .filter(isVisible)
        .map((el) => ({
          text: clean(el.textContent),
          htmlFor: el.getAttribute("for") || "",
        }));

      const fields = Array.from(
        document.querySelectorAll("input, select, textarea"),
      )
        .filter(isVisible)
        .map((el) => {
          const id = el.getAttribute("id") || "";
          const linkedLabel = id
            ? document.querySelector(`label[for="${id}"]`)?.textContent || ""
            : "";

          return {
            tag: el.tagName.toLowerCase(),
            id,
            name: el.getAttribute("name") || "",
            type: el.getAttribute("type") || el.tagName.toLowerCase(),
            placeholder: el.getAttribute("placeholder") || "",
            testId: el.getAttribute("data-testid") || "",
            label: clean(linkedLabel),
            required: el.hasAttribute("required"),
            value: el.value || "",
          };
        });

      const buttons = Array.from(document.querySelectorAll("button"))
        .filter(isVisible)
        .map((el) => ({
          text: clean(el.textContent),
          type: el.getAttribute("type") || "button",
          testId: el.getAttribute("data-testid") || "",
        }));

      return { labels, fields, buttons };
    });

    return summary;
  } finally {
    await browser.close();
  }
}

module.exports = { inspectStorybookPage };
