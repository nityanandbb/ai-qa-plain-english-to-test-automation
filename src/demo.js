require("dotenv").config();

const { generateIRFromEnglish } = require("./generateIRFromEnglish");
const { renderPlaywright } = require("./renderPlaywright");

async function main() {
  const plainSpec = `
Open the demo webshop homepage at "https://demo.opencart.com".
Search for the product "MacBook".
Click on the first product in the results.
Add the product to the cart.
Verify that the cart shows 1 item.

close browser

  `;

  // Step 1: Plain English → LLM → IR JSON
  const plan = await generateIRFromEnglish(plainSpec);

  // Step 2: IR JSON → Playwright test code
  const code = renderPlaywright(plan);

  console.log("\n===== AI Generated Playwright Test =====\n");
  console.log(code);
}

main().catch((err) => {
  console.error(err);
});
