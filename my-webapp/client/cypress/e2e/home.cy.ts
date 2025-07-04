describe('Home Page', () => {
  it('loads successfully and shows main content', () => {
    cy.visit('/')
    cy.contains('SecureAuth').should('exist')
    cy.contains('Login').should('exist')
    cy.contains('Sign Up').should('exist')
    cy.contains('Secure Authentication Made Simple').should('exist')
  })
})
