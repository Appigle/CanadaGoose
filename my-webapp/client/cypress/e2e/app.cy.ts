describe('App Smoke Test', () => {
  it('loads the home page and shows login/signup links', () => {
    cy.visit('/')
    cy.contains('Login').should('exist')
    cy.contains('Sign Up').should('exist')
  })
})
