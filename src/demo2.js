// src/demo_selenium.js

require("dotenv").config();

const { generateIRFromEnglish } = require("./generateIRFromEnglish");
const { renderSeleniumJava } = require("./renderSeleniumJava");

async function main() {
  const plainSpec = `
Visit the website "https://qed42.com".
Click on the "Contact Us" button with CSS selector ".button-hover-effect.is-black".
Verify that inside the selector "div[class='button-row-center'] div[class='button-label']",
the button text is "Let's Talk", then click on it.
Ensure that the Contact Us form appears without reloading or navigating to a new page.
Select the radio button "Business".
Name field: enter "John Doe".
Work Email field: enter "john@example.com".
Phone field: enter "9876543210".
Company field: enter "ABC Corporation".
Message field: enter "I want to discuss a new project."
Verify that the file upload field is visible.
Verify that the Submit button is visible but do NOT click it.

  `;

  const plan = await generateIRFromEnglish(plainSpec); // LLM → IR
  const javaCode = renderSeleniumJava(plan); // IR → Selenium Java

  console.log("\n===== AI Generated Selenium Java Test =====\n");
  console.log(javaCode);
}

main().catch(console.error);
