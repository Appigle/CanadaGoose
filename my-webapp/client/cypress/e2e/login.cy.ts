describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('renders login form', () => {
    cy.get('[data-cy=login-form]').should('exist')
    cy.get('[data-cy=email-input]').should('exist')
    cy.get('[data-cy=password-input]').should('exist')
    cy.get('[data-cy=submit-button]').should('exist')
  })

  it('validates required fields', () => {
    cy.get('[data-cy=submit-button]').click()
    cy.wait(0) // Allow Vue to update

    cy.get('[data-cy=email-error]').should('contain', 'Email is required')
    cy.get('[data-cy=password-error]').should('contain', 'Password is required')
  })

  it('shows error on invalid credentials', () => {
    // Intercept the backend call
    cy.intercept('POST', '**/api/login', {
      statusCode: 401,
      body: { error: 'Invalid email or password' },
    }).as('loginFail')

    cy.get('[data-cy=email-input]').type('fakeuser@example.com')
    cy.get('[data-cy=password-input]').type('wrongpassword')
    cy.get('[data-cy=submit-button]').click()

    cy.wait('@loginFail')

    cy.get('[data-cy=general-error]')
      .should('be.visible')
      .and('contain', 'Invalid email or password')
  })

  it('logs in successfully and redirects to dashboard', () => {
    // Mock token response and intercept
    cy.intercept('POST', '**/api/login', {
      statusCode: 200,
      body: { token: 'mock-jwt-token' },
    }).as('loginSuccess')

    cy.get('[data-cy=email-input]').type('user@example.com')
    cy.get('[data-cy=password-input]').type('validpassword')
    cy.get('[data-cy=submit-button]').click()

    cy.wait('@loginSuccess')

    cy.get('[data-cy=success-message]').should('be.visible').and('contain', 'Login successful')

    // Optionally verify redirect
    cy.url().should('include', '/dashboard')
  })
})
