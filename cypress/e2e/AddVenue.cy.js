describe('Venue Owner: Create Venue Flow (Fixed)', () => {

  const ownerEmail = 'venue@gmail.com';
  const ownerPassword = 'Password_123';

  beforeEach(() => {
    // 1. MOCK IMAGE VALIDATION
    // This tricks the browser into thinking any image URL is valid instantly.
    cy.on('window:before:load', (win) => {
      class MockImage {
        set src(url) {
          if (this.onload) setTimeout(() => this.onload(), 10);
        }
      }
      win.Image = MockImage;
    });

    // 2. MOCK LOGIN
    cy.intercept('POST', '**/login', {
      statusCode: 200,
      body: {
        accountType: 'VENUE_OWNER',
        token: 'fake-jwt-token',
        user: { 
          id: 'owner1', 
          email: ownerEmail, 
          fullName: 'Venue Boss', 
          accountType: 'VENUE_OWNER' 
        }
      }
    }).as('loginReq');

    // 3. MOCK AUTH VERIFICATION (The Fix!)
    // This tells the app "Yes, the session is valid, don't logout".
    cy.intercept('GET', '**/api/users/authenticate', {
      statusCode: 200,
      body: { 
        authenticated: true, 
        user: { id: 'owner1', accountType: 'VENUE_OWNER' } 
      }
    }).as('authCheck');

    // Also mock 'me' endpoint just in case
    cy.intercept('GET', '**/api/users/me', {
      statusCode: 200,
      body: { id: 'owner1', accountType: 'VENUE_OWNER' }
    });

    // 4. MOCK DASHBOARD & WALLET APIs (Prevents loading spinners & 403s)
    cy.intercept('GET', '**/api/analytics/owner/summary', { body: { total_bookings: 10, total_revenue: 50000, active_venues: 2 } });
    cy.intercept('GET', '**/api/bookings/owner', { body: { bookings: [] } });
    cy.intercept('GET', '**/api/analytics/owner/detailed', { body: { revenueByVenue: [], peakHours: [] } });
    cy.intercept('GET', '**/api/venues/my-venues', { body: [] });
    cy.intercept('GET', '**/api/analytics/owner/report*', { body: [] });
    cy.intercept('GET', '**/api/wallet/my-balance', { body: { balance: 1000 } });
    cy.intercept('GET', '**/api/notifications', { body: [] });

    // 5. MOCK CREATE VENUE APIs
    cy.intercept('GET', '**/api/policies', {
      body: [
        { policy_id: 1, name: 'Standard', refund_percentage: 50, hours_before_start: 24 },
        { policy_id: 2, name: 'Flexible', refund_percentage: 100, hours_before_start: 12 }
      ]
    }).as('getPolicies');

    cy.intercept('POST', '**/api/venues', {
      statusCode: 201,
      body: { message: 'Venue created successfully', venueId: 'new-v1' }
    }).as('createVenue');

    // Start
    cy.visit('http://localhost:5173/login');
  });

  it('should login as Owner, navigate to dashboard, and list a new venue', () => {
    
    // --- STEP 1: LOGIN ---
    cy.get('#email').type(ownerEmail);
    cy.get('#password').type(ownerPassword);
    cy.contains('button', 'Sign in').click();
    
    cy.wait('@loginReq');

    // Assert Redirection to Dashboard
    cy.url({ timeout: 10000 }).should('include', '/venue-dashboard');
    cy.contains('Welcome back').should('be.visible');

    // --- STEP 2: NAVIGATE TO CREATE VENUE ---
    // Using { force: true } ensures we click it even if an overlay/toast covers it
    cy.contains('a', 'Add New Venue').click({ force: true });
    
    cy.url().should('include', '/create-venue');
    cy.wait('@getPolicies'); 

    // --- STEP 3: FILL FORM (WIZARD) ---

    // Wizard Step 1: Info
    cy.contains('Basic Information').should('be.visible');
    cy.get('input[name="name"]').type('Cypress Grand Arena');
    cy.get('textarea[name="description"]').type('A world-class facility.');
    cy.get('input[name="address"]').type('123 Test Street');
    cy.get('input[name="city"]').type('Colombo');
    cy.contains('button', 'Continue').click();

    // Wizard Step 2: Pricing
    cy.contains('Pricing & Policies').should('be.visible');
    cy.get('input[name="pricePerHour"]').type('2500');
    cy.get('select[name="cancellationPolicyId"]').select('2'); 
    cy.contains('button', 'Continue').click();

    // Wizard Step 3: Facilities
    cy.contains('Facilities').should('be.visible');
    cy.contains('label', 'Football').click();
    cy.contains('label', 'Futsal').click();
    cy.contains('label', 'Parking').click();
    cy.contains('button', 'Continue').click();

    // Wizard Step 4: Images
    cy.contains('Images').should('be.visible');
    // We can use any URL because we mocked the image check
    cy.get('input[placeholder="https://example.com/image.jpg"]').type('https://example.com/arena.jpg');

    // --- STEP 4: SUBMIT ---
    cy.contains('button', 'List Venue').click();

    cy.wait('@createVenue');
    cy.contains('Venue created successfully').should('be.visible');
    cy.url().should('include', '/venue-dashboard');
  });

});