describe('Signup Page', () => {
  beforeEach(() => {
    cy.visit('/signup')
  })

  it('renders signup form', () => {
    cy.get('form').should('exist')
    cy.get('[data-cy=username-input]').should('exist')
    cy.get('[data-cy=email-input]').should('exist')
    cy.get('[data-cy=password-input]').should('exist')
    cy.get('[data-cy=confirm-password-input]').should('exist')
    cy.get('[data-cy=submit-button]').should('exist')
  })

  it('validates required fields', () => {
    cy.get('[data-cy=submit-button]').click()

    cy.get('[data-cy=username-error]').should('contain', 'Username is required')
    cy.get('[data-cy=email-error]').should('contain', 'Email is required')
    cy.get('[data-cy=password-error]').should('contain', 'Password is required')
    cy.get('[data-cy=confirm-password-error]').should('contain', 'Confirm Password is required')
  })

  it('validates password strength', () => {
    cy.get('[data-cy=password-input]').type('abc') // weak password
    cy.get('[data-cy=password-input]').blur() // trigger reactivity
    cy.contains('Password strength:').should('exist')
    cy.contains('Weak').should('exist')
  })

  it('shows error on duplicate/invalid input', () => {
    cy.intercept('POST', '/api/signup', {
      statusCode: 400,
      body: { error: 'User already exists with this email or username' },
    })

    cy.get('[data-cy=username-input]').type('existinguser')
    cy.get('[data-cy=email-input]').type('existing@example.com')
    cy.get('[data-cy=password-input]').type('ValidPass123!')
    cy.get('[data-cy=confirm-password-input]').type('ValidPass123!')
    cy.get('[data-cy=submit-button]').click()

    cy.get('[data-cy=submit-button]').should('not.be.disabled') // wait until response handled
    cy.contains('already exists').should('exist') // partial match
  })
})
