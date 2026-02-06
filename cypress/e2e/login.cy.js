describe('PlayLink Login Automation - Comprehensive Suite', () => {
  
  beforeEach(() => {
    // 1. Visit the page before every test
    cy.visit('http://localhost:5173/login');

    // 2. Default Mock: Intercept the login API call
    // We assume your AuthContext calls an endpoint like '/api/users/login' or '/api/auth/login'
    // This default intercept ensures we don't hit the real backend unless specified
    cy.intercept('POST', '**/login', {
      statusCode: 200,
      body: {
        user: { id: '123', name: 'Test User', accountType: 'USER' },
        token: 'fake-jwt-token'
      }
    }).as('loginRequest');
  });

  // --- TC-001: Happy Path (Player/User) ---
  it('TC-001: Should successfully login as a PLAYER and redirect to Home', () => {
    // Mock specifically for a Player (USER)
    cy.intercept('POST', '**/login', {
      statusCode: 200,
      body: {
        user: { id: '1', name: 'Player One', accountType: 'USER' },
        token: 'fake-token'
      }
    }).as('playerLogin');

    cy.get('#email').type('player@example.com');
    cy.get('#password').type('Password@123');
    
    cy.contains('button', 'Sign in').click();

    cy.wait('@playerLogin');

    // Assert Success Toast
    cy.contains('Successfully logged in').should('be.visible');
    // Assert Redirect to Home
    cy.url().should('eq', 'http://localhost:5173/');
  });

  // --- TC-002: Happy Path (Venue Owner) ---
  it('TC-002: Should successfully login as VENUE OWNER and redirect to Dashboard', () => {
    // Mock specifically for a Venue Owner
    cy.intercept('POST', '**/login', {
      statusCode: 200,
      body: {
        id: '2',
        email: 'venuetest@gmail.com',
        fullName: 'Venue Boss',
        accountType: 'VENUE_OWNER',
        city: 'Colombo'
      }
    }).as('ownerLogin');

    cy.get('#email').type('venuetest@gmail.com');
    cy.get('#password').type('Savishkar#3118');
    
    cy.contains('button', 'Sign in').click();

    cy.wait('@ownerLogin');

    // Assert Success Toast
    cy.contains('Successfully logged in').should('be.visible');
    // Assert Redirect to Venue Dashboard
    cy.url().should('eq', 'http://localhost:5173/venue-dashboard');
  });

  // --- TC-003: Validation (Empty Fields) ---
  it('TC-003: Should show error when fields are empty', () => {
    // 1. Submit totally empty
    cy.contains('button', 'Sign in').click();
    cy.contains('Please enter email and password').should('be.visible');

    // 2. Fill Email only
    cy.get('#email').type('user@example.com');
    cy.contains('button', 'Sign in').click();
    cy.contains('Please enter email and password').should('be.visible');

    // 3. Fill Password only (clear email first)
    cy.get('#email').clear();
    cy.get('#password').type('pass123');
    cy.contains('button', 'Sign in').click();
    cy.contains('Please enter email and password').should('be.visible');

    // Assert API was NEVER called
    cy.get('@loginRequest.all').should('have.length', 0);
  });

  // --- TC-004: Backend Error (Invalid Credentials) ---
  it('TC-004: Should handle "Invalid credentials" error from server', () => {
    // Mock a 401 Unauthorized response
    cy.intercept('POST', '**/login', {
      statusCode: 401,
      body: { message: 'Invalid email or password' }
    }).as('loginFail');

    cy.get('#email').type('wrong@example.com');
    cy.get('#password').type('WrongPass');
    
    cy.contains('button', 'Sign in').click();

    cy.wait('@loginFail');

    // Assert Error Toast
    cy.contains('Invalid email or password').should('be.visible');
    // Ensure we are still on login page
    cy.url().should('include', '/login');
  });

  // --- TC-005: Redirect Logic (Protected Route) ---
  it('TC-005: Should redirect back to the previous page if state.from exists', () => {
    // Simulate arriving at login page with "state" (e.g. from /bookings)
    cy.visit('http://localhost:5173/login', {
      onBeforeLoad(win) {
        // Create a fake history state mimicking React Router
        win.history.pushState({ usr: { from: '/bookings' } }, '', '/login');
      }
    });

    cy.get('#email').type('user@example.com');
    cy.get('#password').type('password');
    cy.contains('button', 'Sign in').click();

    // Should NOT go to / (home), but to /bookings
    cy.url().should('include', '/bookings');
  });

  // --- TC-006: UI Interaction (Password Toggle) ---
  it('TC-006: Should toggle password visibility', () => {
    // 1. Default state: type="password"
    cy.get('#password').should('have.attr', 'type', 'password');

    // 2. Click Eye Icon
    // The button is the sibling of the input
    cy.get('#password').parent().find('button').click();

    // 3. State should be "text" (visible)
    cy.get('#password').should('have.attr', 'type', 'text');

    // 4. Click again -> back to "password"
    cy.get('#password').parent().find('button').click();
    cy.get('#password').should('have.attr', 'type', 'password');
  });

  // --- TC-007: Navigation Links ---
  it('TC-007: Should navigate to Signup and Back to Home', () => {
    // Test Signup Link
    cy.contains('Sign up').click();
    cy.url().should('include', '/signup');

    // Go back to test the Back button
    cy.visit('http://localhost:5173/login');
    
    // Test "Go back" button
    cy.contains('Go back').click();
    cy.url().should('eq', 'http://localhost:5173/');
  });

});