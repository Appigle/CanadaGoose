describe('Navigation', () => {
  it('navigates to Login and Signup pages from Home', () => {
    cy.visit('/')
    cy.contains('Login').click()
    cy.url().should('include', '/login')
    cy.go('back')
    cy.contains('Sign Up').click()
    cy.url().should('include', '/signup')
  })
})
