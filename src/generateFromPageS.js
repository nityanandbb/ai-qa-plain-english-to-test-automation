// For Storybook only/...

function buildGenerationPrompt(userPrompt, pageSummary) {
  return `
You are a senior QA automation engineer.

Generate Playwright JavaScript Page Object Model automation for the detected UI.

Rules:
- Use Playwright JavaScript
- Use Page Object Model
- No hard waits
- Prefer id-based locators first
- Fallback to getByLabel where needed
- The target page is rendered inside Storybook iframe
- Cover both positive and negative validations

User request:
${userPrompt}

Detected page summary:
${JSON.stringify(pageSummary, null, 2)}

Expected coverage:
1. Verify all fields are visible
2. Verify submit button is visible
3. Negative validations:
   - Name blank
   - Name less than 4 chars
   - Name more than 100 chars
   - Surname blank
   - Surname more than 230 chars
   - Mobile blank
   - Mobile invalid
   - Email invalid
   - Password blank
   - Password with spaces
   - Password with special chars
4. Positive scenario:
   - valid form submit
   - verify success message

Return:
1. RegistrationFormPage.js
2. registrationForm.spec.js
3. clean reusable methods
`;
}

module.exports = { buildGenerationPrompt };
