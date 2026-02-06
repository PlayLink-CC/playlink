describe('PlayLink Signup Automation - Full Coverage', () => {
  
  beforeEach(() => {
    cy.visit('http://localhost:5173/signup');
  });

  // --- TC-001: Success Scenario ---
  it('TC-001: Should successfully create an account with valid data', () => {
    const randomId = Math.random().toString(36).substring(7);
    const userEmail = `player_${randomId}@test.com`;
    const validPassword = 'PassWord@123'; 

    cy.get('#fullName').type('Cypress Test Player');
    cy.get('#email').type(userEmail);
    cy.get('#city').select('Colombo');
    cy.get('#password').type(validPassword);
    cy.get('#confirmPassword').type(validPassword);
    cy.contains('button', 'Player').click();
    cy.get('input[type="checkbox"]').check();
    cy.contains('button', 'Create Account').click();

    // Assert Success
    cy.url({ timeout: 10000 }).should('eq', 'http://localhost:5173/');
    cy.contains('Welcome to PlayLink').should('be.visible');
  });

  // --- TC-002: Weak Password ---
  it('TC-002: Should show error for weak password', () => {
    cy.get('#fullName').type('Weak Pass User');
    cy.get('#email').type('weak@test.com');
    cy.get('#city').select('Kandy');
    
    // Enter weak password (no uppercase, no special char)
    cy.get('#password').type('weakpassword123');
    cy.get('#confirmPassword').type('weakpassword123');
    
    cy.contains('button', 'Player').click();
    cy.get('input[type="checkbox"]').check();
    cy.contains('button', 'Create Account').click();

    // Assert Error Toast
    cy.contains('Password must match requirements').should('be.visible');
    // Assert we are STILL on the signup page (NOT redirected)
    cy.url().should('include', '/signup');
  });

  // --- TC-003: Password Mismatch ---
  it('TC-003: Should show error when passwords do not match', () => {
    cy.get('#fullName').type('Mismatch User');
    cy.get('#email').type('mismatch@test.com');
    cy.get('#city').select('Galle');
    
    // Mismatching passwords
    cy.get('#password').type('PassWord@123');
    cy.get('#confirmPassword').type('PassWord@999'); // Different
    
    cy.contains('button', 'Player').click();
    cy.get('input[type="checkbox"]').check();
    cy.contains('button', 'Create Account').click();

    // Assert Error Toast
    cy.contains('Passwords do not match').should('be.visible');
    cy.url().should('include', '/signup');
  });

  // --- TC-004: Missing City ---
  it('TC-004: Should show error when City is not selected', () => {
    cy.get('#fullName').type('No City User');
    cy.get('#email').type('nocity@test.com');
    
    // SKIP City selection step
    
    cy.get('#password').type('PassWord@123');
    cy.get('#confirmPassword').type('PassWord@123');
    cy.contains('button', 'Player').click();
    cy.get('input[type="checkbox"]').check();
    cy.contains('button', 'Create Account').click();

    // Assert Error Toast
    cy.contains('Please select your city').should('be.visible');
    cy.url().should('include', '/signup');
  });

  // --- TC-005: Duplicate Email ---
  it('TC-005: Should prevent duplicate email registration', () => {
    // 1. Define a fixed email
    const fixedEmail = 'duplicate_test@test.com';
    const validPassword = 'PassWord@123';

    // 2. Create the FIRST account (This part should succeed)
    // We force this first part just to ensure the user exists in DB
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/api/users/register', // ADJUST PORT IF NEEDED
      failOnStatusCode: false, // Don't fail if already exists
      body: {
        fullName: 'Original User',
        email: fixedEmail,
        password: validPassword,
        city: 'Colombo',
        accountType: 'USER'
      }
    });

    // 3. Try to Sign Up AGAIN with the SAME email via UI
    cy.reload(); // Refresh page to be safe
    cy.get('#fullName').type('Copy Cat User');
    cy.get('#email').type(fixedEmail); // Same email
    cy.get('#city').select('Colombo');
    cy.get('#password').type(validPassword);
    cy.get('#confirmPassword').type(validPassword);
    cy.contains('button', 'Player').click();
    cy.get('input[type="checkbox"]').check();
    cy.contains('button', 'Create Account').click();

    // 4. Assert Error
    // This message depends on your backend, but usually it's "User already exists" or similar
    cy.contains('Email already in use').should('be.visible');
    cy.url().should('include', '/signup');
  });

});