/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      setLocale(locale: string): Chainable<void>;
      getLocale(): Chainable<string>;
    }
  }
}

Cypress.Commands.add('setLocale', (locale: string) => {
  Cypress.env('locale', locale);

  // Intercept all requests and set Accept-Language header
  cy.intercept('**', (req) => {
    req.headers['Accept-Language'] = locale;
  });
});

Cypress.Commands.add('getLocale', () => {
  return cy.wrap(Cypress.env('locale') || 'en');
});

export {};
