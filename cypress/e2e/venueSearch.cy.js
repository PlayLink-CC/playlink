describe('Venue Listing & Search Automation', () => {

  // Setup: Mock Data & Visit Page
  beforeEach(() => {
    // 1. Mock Data: One target venue, one noise venue
    const mockVenues = [
      {
        venue_id: '101',
        venue_name: 'Urban Sports Arena', // Target
        city: 'Colombo',
        location: 'Colombo 07',
        price_per_hour: 2500,
        court_types: 'Futsal, Cricket',
        primary_image: 'https://via.placeholder.com/300',
        amenities: 'Parking, Showers'
      },
      {
        venue_id: '102',
        venue_name: 'Kandy Badminton Club', // Noise
        city: 'Kandy',
        location: 'Peradeniya',
        price_per_hour: 1000,
        court_types: 'Badminton',
        primary_image: 'https://via.placeholder.com/300',
        amenities: 'Water'
      }
    ];

    // Intercept API
    cy.intercept('GET', '**/api/venues*', {
      statusCode: 200,
      body: mockVenues
    }).as('getVenues');

    // Visit Page
    cy.visit('http://localhost:5173/venues');
    cy.wait('@getVenues');
  });

  // --- TC-008: Search by Venue Name ---
  it('TC-008: Should filter venues by Name ("Urban Sports Arena")', () => {
    // 1. Target the input by placeholder
    cy.get('input[placeholder="Search by venue name"]')
      .clear()
      .type('Urban Sports Arena');

    // 2. Click Search Button
    cy.contains('button', 'Search').click();

    // 3. Assert Target is Visible
    cy.contains('Urban Sports Arena').should('be.visible');

    // 4. Assert Noise is Hidden
    cy.contains('Kandy Badminton Club').should('not.exist');
  });

  // --- TC-009: Search by Location ---
  it('TC-009: Should filter venues by Location ("Peradeniya")', () => {
    // 1. Target the location input
    cy.get('input[placeholder="Search by location"]')
      .clear()
      .type('Peradeniya');

    cy.contains('button', 'Search').click();

    // 2. Assert Kandy Club is Visible
    cy.contains('Kandy Badminton Club').should('be.visible');

    // 3. Assert Urban Arena is Hidden
    cy.contains('Urban Sports Arena').should('not.exist');
  });

  // --- TC-010: Clear Search ---
  it('TC-010: Should reset list when search is cleared', () => {
    // 1. Type specific search
    cy.get('input[placeholder="Search by venue name"]').type('Urban');
    cy.contains('button', 'Search').click();
    
    // Verify filter applied
    cy.contains('Kandy Badminton Club').should('not.exist');

    // 2. Click the "X" button (Clear)
    // Your code uses aria-label="Clear venue name" so we target that
    cy.get('button[aria-label="Clear venue name"]').click();

    // 3. Assert BOTH venues are back
    cy.contains('Urban Sports Arena').should('be.visible');
    cy.contains('Kandy Badminton Club').should('be.visible');
  });

  // --- TC-011: No Results Found ---
  it('TC-011: Should display "No Venues Found" for invalid search', () => {
    cy.get('input[placeholder="Search by venue name"]').type('Mars Stadium');
    cy.contains('button', 'Search').click();

    // Verify Message
    cy.contains('No Venues Found').should('be.visible');
    // Verify cards are gone
    cy.contains('Urban Sports Arena').should('not.exist');
  });

});