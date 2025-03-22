// Correct (cypress/e2e/step_definitions/homepage.ts)
import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('the user visits the homepage', () => {
  cy.visit('http://localhost:4200');
});

Then('the user sees the welcome message {string}', (message: string) => {
  cy.contains(message).should('be.visible');
});
