describe('Theme Toggle', () => {
  it('toggles between dark and light mode', () => {
    cy.visit('/')
    cy.get('[aria-label="Toggle theme"]').click()
    cy.get('html').should(($html) => {
      expect($html).not.to.have.class('dark')
    })
    cy.get('[aria-label="Toggle theme"]').click()
    cy.get('html').should(($html) => {
      expect($html).to.have.class('dark')
    })
  })
})
