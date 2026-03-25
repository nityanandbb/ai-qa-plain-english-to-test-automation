const { test, expect } = require('@playwright/test');
const { RegistrationFormPage } = require('./RegistrationFormPage');

test.describe('Registration Form', () => {
  let registrationFormPage;

  test.beforeEach(async ({ page }) => {
    registrationFormPage = new RegistrationFormPage(page);
    await registrationFormPage.navigate('http://localhost:6006/iframe.html?id=registration-form');
  });

  test('Verify all fields and submit button are visible', async () => {
    await registrationFormPage.verifyFieldVisibility();
  });

  test('Negative validations', async () => {
    // Name blank
    await registrationFormPage.fillFirstName('');
    await registrationFormPage.submitForm();
    await expect(registrationFormPage.firstNameInput).toHaveAttribute('aria-invalid', 'true');

    // Name less than 4 chars
    await registrationFormPage.fillFirstName('abc');
    await registrationFormPage.submitForm();
    await expect(registrationFormPage.firstNameInput).toHaveAttribute('aria-invalid', 'true');

    // Name more than 100 chars
    await registrationFormPage.fillFirstName('a'.repeat(101));
    await registrationFormPage.submitForm();
    await expect(registrationFormPage.firstNameInput).toHaveAttribute('aria-invalid', 'true');

    // Surname blank
    await registrationFormPage.fillSurname('');
    await registrationFormPage.submitForm();
    await expect(registrationFormPage.surnameInput).toHaveAttribute('aria-invalid', 'true');

    // Surname more than 230 chars
    await registrationFormPage.fillSurname('a'.repeat(231));
    await registrationFormPage.submitForm();
    await expect(registrationFormPage.surnameInput).toHaveAttribute('aria-invalid', 'true');

    // Mobile blank
    await registrationFormPage.fillMobile('');
    await registrationFormPage.submitForm();
    await expect(registrationFormPage.mobileInput).toHaveAttribute('aria-invalid', 'true');

    // Mobile invalid
    await registrationFormPage.fillMobile('12345');
    await registrationFormPage.submitForm();
    await expect(registrationFormPage.mobileInput).toHaveAttribute('aria-invalid', 'true');

    // Email invalid
    await registrationFormPage.fillEmail('invalid-email');
    await registrationFormPage.submitForm();
    await expect(registrationFormPage.emailInput).toHaveAttribute('aria-invalid', 'true');

    // Password blank
    await registrationFormPage.fillPassword('');
    await registrationFormPage.submitForm();
    await expect(registrationFormPage.passwordInput).toHaveAttribute('aria-invalid', 'true');

    // Password with spaces
    await registrationFormPage.fillPassword('pass word');
    await registrationFormPage.submitForm();
    await expect(registrationFormPage.passwordInput).toHaveAttribute('aria-invalid', 'true');

    // Password with special chars
    await registrationFormPage.fillPassword('password!');
    await registrationFormPage.submitForm();
    await expect(registrationFormPage.passwordInput).toHaveAttribute('aria-invalid', 'true');
  });

  test('Positive scenario: valid form submit', async () => {
    await registrationFormPage.fillFirstName('John');
    await registrationFormPage.fillMiddleName('A');
    await registrationFormPage.fillSurname('Doe');
    await registrationFormPage.selectCountryCode('+91');
    await registrationFormPage.fillMobile('9876543210');
    await registrationFormPage.fillEmail('john.doe@example.com');
    await registrationFormPage.fillPassword('password123');
    await registrationFormPage.submitForm();
    await registrationFormPage.verifySuccessMessage();
  });
});
