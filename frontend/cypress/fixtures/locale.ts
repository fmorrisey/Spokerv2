import { Given } from '@badeball/cypress-cucumber-preprocessor';

Given('the app locale is {string}', (locale: string) => {
  cy.setLocale(locale);
});
