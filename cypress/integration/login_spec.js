describe('Log in', function() {
  it('Visit login page', function() {
    cy.visit('http://localhost:8080/#/')
    cy.get('#email').type(Cypress.env('CYPRESS_TEST_EMAIL'))
    cy.get('#password').type(Cypress.env('CYPRESS_TEST_PASSWORD'))
    cy.get('button[type=submit]').click()
    cy.url().should('include', 'custom')
  })
})
