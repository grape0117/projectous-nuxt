// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('login', () => {
  cy.visit('http://localhost:8080/#/')
  cy.request({
    method: 'POST',
    url: 'https://api.projectous.com/api/login',
    body: {
      email: 'stephane@techaround.com',
      password: 'eastland'
    }
  }).then(resp => {
    expect(resp.body.auth_token).to.not.equal('undefined')
    cy.setCookie('auth_token', resp.body.auth_token)
    cy.getCookie('auth_token').should(
      'have.property',
      'value',
      resp.body.auth_token
    )
    cy.server()
    cy.route('**/test-tasks').as('init')
    cy.visit('http://localhost:8080/#/')
    cy.wait('@init')
  })
})
