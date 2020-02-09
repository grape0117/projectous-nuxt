describe('Select user', function() {
  beforeEach(() => {
    //TODO: user the login() command. When I use it it doesn't fully load the app.
    cy.visit('http://localhost:8080/#/login')
    cy.get('#email').type(Cypress.env('CYPRESS_TEST_EMAIL'))
    cy.get('#password').type(Cypress.env('CYPRESS_TEST_PASSWORD'))
    cy.get('button[type=submit]').click()
    cy.server()
    cy.route('**/test-tasks').as('init')
    cy.visit('http://localhost:8080/#/')
    cy.url().should('include', 'custom')
    cy.wait('@init')
  })
  it('load user tasks', function() {
    cy.get('select').select('1')
  })
})
