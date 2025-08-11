import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';

let response: Cypress.Response<any>;

Given('request GET {string}', (endpoint: string) => {
    cy.request({
        method: 'GET',
        url: endpoint,
        failOnStatusCode: false,
    }).then((res) => {
        response = res;
    });
});

Then('the response status code should be {string}', (statusCode: string) => {
    expect(response.status).to.equal(parseInt(statusCode));
})

Then('the response body field {string} should equal {string}', (field: string, value: string) => {
    expect(response.body[field]).to.eq(value);
});

Then('the response body should have length {string}', (length: string) => {
    expect(response.body).to.have.length(parseInt(length));
});


