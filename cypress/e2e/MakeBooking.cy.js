describe('End-to-End Booking Flow (Feb 17th)', () => {

  const targetEmail = 'saviskar2003@gmail.com';
  const targetPassword = 'Savishkar#3118';

  // Use a future year to ensure the date is valid
  const currentYear = new Date().getFullYear() + 1; // e.g. 2026
  const specificDate = `${currentYear}-02-17`; 

  beforeEach(() => {
    // --- MOCK BACKEND RESPONSES ---
    
    // 1. Venues List
    cy.intercept('GET', '**/api/venues*', {
      statusCode: 200,
      body: [{
        venue_id: 'v1',
        venue_name: 'Urban Sports Arena',
        location: 'Colombo 07',
        price_per_hour: 2500,
        primary_image: 'https://via.placeholder.com/300',
        court_types: 'Futsal',
        sports: [{ sport_id: 's1', name: 'Futsal' }]
      }]
    }).as('getVenues');

    // 2. Venue Details
    cy.intercept('GET', '**/api/venues/v1*', {
      statusCode: 200,
      body: {
        venue_id: 'v1',
        venue_name: 'Urban Sports Arena',
        price_per_hour: 2500,
        sports: [{ sport_id: 's1', name: 'Futsal' }]
      }
    }).as('getVenueDetails');

    // 3. Available Slots (FIXED WILDCARD)
    // Changing 'available-slots*' to 'available-slots/**' ensures it matches '/v1'
    cy.intercept('GET', '**/api/bookings/available-slots/**', {
      statusCode: 200,
      body: {
        slots: [
          { time: '10:00', available: true },
          { time: '11:00', available: true }
        ]
      }
    }).as('getSlots');

    // 4. Booked Slots (FIXED WILDCARD just in case)
    cy.intercept('GET', '**/api/bookings/booked-slots/**', {
      statusCode: 200,
      body: { slots: [] }
    }).as('getBookedSlots');

    // 5. Price Calculation
    cy.intercept('POST', '**/api/bookings/calculate-price', {
      statusCode: 200,
      body: { totalAmount: 2500 }
    }).as('calcPrice');

    // 6. Login Mock
    cy.intercept('POST', '**/login', {
      statusCode: 200,
      body: {
        user: { id: 'u1', email: targetEmail, fullName: 'Savishkar', accountType: 'USER' },
        token: 'fake-jwt-token'
      }
    }).as('loginReq');

    // 7. Checkout Session
    cy.intercept('POST', '**/api/bookings/checkout-session', {
      statusCode: 200,
      body: { 
        success: true, 
        checkoutUrl: 'http://checkout.stripe.com/test-mock-url' 
      }
    }).as('checkoutReq');

    cy.visit('http://localhost:5173/venues');
  });

  it('should book for Feb 17th, force login, and pay via Stripe', () => {
    
    // STEP 1: Select Venue
    cy.wait('@getVenues');
    cy.contains('Urban Sports Arena').should('be.visible');
    cy.contains('button', 'Book Now').click();

    cy.url().should('include', '/create-booking');
    cy.wait('@getVenueDetails');

    // STEP 2: Fill Booking Details
    cy.contains('button', 'Futsal').click();

    // Type the date
    cy.get('input[type="date"]').type(specificDate);

    // Wait for the slots to load (This caused the error before)
    cy.wait('@getSlots');
    
    // Click Time Slot
    cy.contains('button', '10:00').should('be.visible').click();

    // Wait for Price
    cy.wait('@calcPrice');
    cy.contains('LKR 2500').should('be.visible');

    // STEP 3: Attempt Payment
    cy.contains('button', 'Pay LKR').click();

    // STEP 4: Login Flow
    cy.url().should('include', '/login');
    cy.get('input[id="email"]').type(targetEmail);
    cy.get('input[id="password"]').type(targetPassword);
    cy.contains('button', 'Sign in').click();
    cy.wait('@loginReq');

    // STEP 5: Redirect Back & Verify State
    cy.url().should('include', '/create-booking');
    cy.get('input[type="date"]').should('have.value', specificDate);
    
    // Verify slot is selected (green background)
    cy.contains('button', '10:00').should('have.class', 'bg-green-600'); 

    // Final Payment
    cy.contains('button', 'Pay LKR').click();

    // STEP 6: Verify Stripe Handover
    cy.wait('@checkoutReq');
    cy.window().then((win) => {
      console.log('Stripe Payment initiated successfully');
    });
  });

});