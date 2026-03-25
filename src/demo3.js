require("dotenv").config();

// Mail authentication otp pickup...

const { generateIRFromEnglish } = require("./generateIRFromEnglish");
const { renderPlaywright } = require("./renderPlaywright");

async function main() {
  const plainSpec = `
Open the demo webshop homepage at "https://demo.opencart.com".
Click on the "Login link".
Verify Login popup is visible and it has site logo.
Click on the Username Input, Type Username as "test@gamil"
Enter the Password " 6 blank spaces and end with 55" then click on the Sign In button.
Verify It should show Mail format validatoion error "Please enter valid mail id"
Now Re-enter Email ID with "test@testinator.20035.com"
Click on the Sign in button.
Verify It should accept the Mail id, but should show the. Password format error and wont accept the blank spaces.
Now Add validate password "Admin@1234"
Again click on the sign in button.
Verify it should show mail otp is sent message and otp enter page.

Now send API request to "Mailinator site api" " curl "https://api.mailinator.com/api/v2/domains/private/inboxes?token=32267ef66f8f454bb869d5e1d683dfc0" for "test@testinator.20035.com" and read the mail resp body ( give this mail read api as re-suable function)
Fetch the otp from. API curl and save as latest mail_otp, 
Enter the otp in the otp page, Click on "Verify"
It should show verification successful.
Verify that the It shows the Dashboard or User Profile page.

For Above context Write multiple postive and Negative test scenario separate test-cases.

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
