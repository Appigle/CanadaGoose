describe('Home Page', () => {
  it('loads successfully and shows main content', () => {
    cy.visit('/')
    cy.contains('CanadaGoose').should('exist')
    cy.contains('Login').should('exist')
    cy.contains('Sign Up').should('exist')
    cy.contains('Take Control of Your Finances').should('exist')
    cy.contains('Get Started Free').should('exist')
  })
})
