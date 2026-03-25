Generate a Playwright POM-style automated test for the following flow:

As a user, I visit the Alldata home page.
The login button with id "login" should be visible.
When I click the login button:
- A login form appears.
- Enter username and password.
- Click the submit button.
- An OTP screen appears.

OTP handling:
- Add a reusable helper function to fetch OTP using the Mailinator API.
- Enter the OTP into the input with CSS selector ".otp".
- Click the confirm button with selector ".confirm".

After confirming OTP:
- Verify that the dashboard page is loaded successfully.

Requirements / Guardrails:
- Use Playwright with Page Object Model (POM).
- Create reusable login and OTP helper functions.
- Do NOT use hard waits (no waitForTimeout).
- Prefer stable locators (id, data-testid, role).
- If any selector is uncertain, add a TODO comment.
- Output runnable Playwright JavaScript code only.

node tools/ask.js "/Users/qed42/Desktop/alldata-playwright" "<PASTE THE QUESTION ABOVE>"


"
node tools/ask.js "/Users/qed42/Desktop/alldata-playwright" "
As a user, I visit the Alldata home page.
The login button with id "login" should be visible.
When I click the login button:
- A login form appears.
- Enter username and password.
- Click the submit button.
- An OTP screen appears.
(base) qed42@Mac testWrite % >....                                                                                                    
OTP handling:
- Add a reusable helper function to fetch OTP using the Mailinator API.
- Enter the OTP into the input with CSS selector ".otp".
- Click the confirm button with selector ".confirm".

After confirming OTP:
- Verify that the dashboard page is loaded successfully.

Requirements / Guardrails:
- Use Playwright with Page Object Model (POM).
- Create reusable login and OTP helper functions.
- Do NOT use hard waits (no waitForTimeout).
- Prefer stable locators (id, data-testid, role).
- If any selector is uncertain, add a TODO comment.
- Output runnable Playwright JavaScript code only."

"
