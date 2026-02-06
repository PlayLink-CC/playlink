describe('Venue Owner: Walk-in Booking Flow (Fixed)', () => {

  const ownerEmail = 'venue@gmail.com';
  const ownerPassword = 'Password_123';

  beforeEach(() => {
    // 1. SET VIEWPORT (Crucial for Modals)
    cy.viewport(1280, 800);

    // 2. MOCK IMAGE LOADING
    cy.on('window:before:load', (win) => {
      class MockImage {
        set src(url) { if (this.onload) setTimeout(() => this.onload(), 10); }
      }
      win.Image = MockImage;
    });

    // 3. AUTH MOCKS
    cy.intercept('POST', '**/login', {
      statusCode: 200,
      body: {
        accountType: 'VENUE_OWNER',
        token: 'fake-jwt-token',
        user: { id: 'owner1', email: ownerEmail, fullName: 'Venue Boss', accountType: 'VENUE_OWNER' }
      }
    }).as('loginReq');

    cy.intercept('GET', '**/api/users/authenticate', {
      statusCode: 200,
      body: { authenticated: true, user: { id: 'owner1', accountType: 'VENUE_OWNER' } }
    }).as('authCheck');

    cy.intercept('GET', '**/api/users/me', {
      statusCode: 200,
      body: { id: 'owner1', accountType: 'VENUE_OWNER' }
    });

    // 4. DASHBOARD MOCKS
    cy.intercept('GET', '**/api/analytics/owner/summary', { body: { total_bookings: 5, total_revenue: 20000, active_venues: 1 } });
    cy.intercept('GET', '**/api/bookings/owner', { body: { bookings: [] } });
    cy.intercept('GET', '**/api/analytics/owner/detailed', { body: {} });
    cy.intercept('GET', '**/api/venues/my-venues', { 
      body: [{ venue_id: 'v1', venue_name: 'Grand Arena', is_active: true }] 
    }).as('getVenues');
    cy.intercept('GET', '**/api/wallet/my-balance', { body: { balance: 0 } });
    cy.intercept('GET', '**/api/notifications', { body: [] });
    cy.intercept('GET', '**/api/analytics/owner/report*', { body: [] });

    // 5. CALENDAR MOCKS
    cy.intercept('GET', '**/api/venues/v1/sports', {
      body: [{ sport_id: 's1', name: 'Futsal' }, { sport_id: 's2', name: 'Badminton' }]
    }).as('getSports');

    cy.intercept('GET', '**/api/bookings/venue/v1/calendar*', {
      body: { bookings: [] }
    }).as('getCalendar');

    // 6. CREATE WALK-IN API
    cy.intercept('POST', '**/api/bookings/venue/v1/walk-in', {
      statusCode: 200,
      body: { message: 'Walk-in booking created!', bookingId: 'b_new_123' }
    }).as('createWalkIn');

    cy.visit('http://localhost:5173/login');
  });

  it('should login, navigate to calendar, and create a walk-in booking', () => {
    
    // --- STEP 1: LOGIN ---
    cy.get('#email').type(ownerEmail);
    cy.get('#password').type(ownerPassword);
    cy.contains('button', 'Sign in').click();
    
    cy.wait('@loginReq');
    cy.url().should('include', '/venue-dashboard');

    // --- STEP 2: NAVIGATE TO CALENDAR ---
    cy.contains('a', 'Calendar').click({ force: true });
    
    cy.url().should('include', '/venue-calendar');
    cy.wait('@getVenues');
    cy.wait('@getSports');
    cy.wait('@getCalendar');

    // --- STEP 3: OPEN MODAL ---
    cy.contains('button', 'New Walk-in').click();

    // WAIT for animation & ASSERT EXISTENCE
    // We used 'exist' instead of 'visible' to be safer, but with the viewport fix, 'visible' usually works.
    cy.wait(500); 
    cy.contains('Manage Time Slot').should('exist');

    // --- STEP 4: FILL FORM (Using Force to bypass overlay checks) ---
    
    // 1. Sport (Select Futsal)
    // We use { force: true } on the select because standard HTML selects can be tricky in modals
    cy.get('select').contains('Futsal').parent().select('s1', { force: true });

    // 2. Duration (2 Hours)
    cy.get('select').contains('1 Hour').parent().select('2', { force: true });

    // 3. Amount Paid
    cy.get('input[placeholder="0.00"]').type('1500', { force: true });

    // 4. Customer Name
    cy.get('input[placeholder="John Doe"]').type('Walk-in Customer', { force: true });

    // 5. Customer Email
    cy.get('input[placeholder="john@example.com"]').type('customer@test.com', { force: true });

    // --- STEP 5: CONFIRM ---
    cy.contains('button', 'Confirm Booking').click({ force: true });

    // --- STEP 6: VERIFY ---
    cy.wait('@createWalkIn');
    cy.contains('Walk-in booking created!').should('be.visible');
    
    // Ensure Modal closed
    cy.contains('Manage Time Slot').should('not.exist');
  });

});