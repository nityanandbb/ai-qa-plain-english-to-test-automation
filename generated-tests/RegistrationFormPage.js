const { expect } = require('@playwright/test');

class RegistrationFormPage {
  constructor(page) {
    this.page = page;
    this.frame = page.frameLocator('#storybook-preview-iframe');
    this.firstNameInput = this.frame.locator('#firstName');
    this.middleNameInput = this.frame.locator('#middleName');
    this.surnameInput = this.frame.locator('#surname');
    this.countryCodeSelect = this.frame.locator('#countryCode');
    this.mobileInput = this.frame.locator('#mobile');
    this.emailInput = this.frame.locator('#email');
    this.passwordInput = this.frame.locator('#password');
    this.submitButton = this.frame.locator('text=Submit Registration');
  }

  async navigate(url) {
    await this.page.goto(url);
  }

  async fillFirstName(name) {
    await this.firstNameInput.fill(name);
  }

  async fillMiddleName(middleName) {
    await this.middleNameInput.fill(middleName);
  }

  async fillSurname(surname) {
    await this.surnameInput.fill(surname);
  }

  async selectCountryCode(code) {
    await this.countryCodeSelect.selectOption(code);
  }

  async fillMobile(mobile) {
    await this.mobileInput.fill(mobile);
  }

  async fillEmail(email) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password) {
    await this.passwordInput.fill(password);
  }

  async submitForm() {
    await this.submitButton.click();
  }

  async verifyFieldVisibility() {
    await expect(this.firstNameInput).toBeVisible();
    await expect(this.middleNameInput).toBeVisible();
    await expect(this.surnameInput).toBeVisible();
    await expect(this.countryCodeSelect).toBeVisible();
    await expect(this.mobileInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async verifySuccessMessage() {
    const successMessage = this.frame.locator('text=Registration successful');
    await expect(successMessage).toBeVisible();
  }
}

module.exports = { RegistrationFormPage };