describe('Theme Toggle', () => {
  it('toggles between dark and light mode', () => {
    cy.visit('/')

    // Get the initial theme state
    cy.get('html').then(($html) => {
      const isInitiallyDark = $html.hasClass('dark')

      if (isInitiallyDark) {
        // If initially dark, first click should make it light
        cy.get('[aria-label="Toggle theme"]').click()
        cy.get('html').should('not.have.class', 'dark')

        // Second click should make it dark again
        cy.get('[aria-label="Toggle theme"]').click()
        cy.get('html').should('have.class', 'dark')
      } else {
        // If initially light, first click should make it dark
        cy.get('[aria-label="Toggle theme"]').click()
        cy.get('html').should('have.class', 'dark')

        // Second click should make it light again
        cy.get('[aria-label="Toggle theme"]').click()
        cy.get('html').should('not.have.class', 'dark')
      }
    })
  })
})
