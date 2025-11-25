# PlayLink - Developer Guide & Code Comments Reference

## Overview

This guide explains the documentation style used throughout the PlayLink codebase and provides reference material for developers working on this project.

## JSDoc Documentation Standards

### File-Level Documentation

Every file starts with a file-level JSDoc comment:

```javascript
/**
 * @file FileName.jsx
 * @description Clear, concise description of what this file does.
 * Additional details about key features or responsibilities.
 */
```

### Component Documentation

Components include comprehensive JSDoc comments:

```javascript
/**
 * ComponentName Component - Brief description
 * 
 * Features:
 * - Feature 1 description
 * - Feature 2 description
 * 
 * Props/State: (if applicable)
 * - Detailed explanation of props and state
 * 
 * @component
 * @param {Type} name - Parameter description
 * @returns {JSX.Element} Description of returned JSX
 */
```

## Component Documentation Examples

### Functional Components with Props

```javascript
/**
 * SearchForm Component - Venue search interface
 * 
 * Features:
 * - Text input for sport search
 * - Search and Clear buttons
 * - Error handling with user feedback
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} [props.onSearch] - Callback when search completes
 * @param {string} [props.initialSearchText] - Pre-filled search value
 * @returns {JSX.Element} Search form with error display
 */
const SearchForm = ({ onSearch, initialSearchText }) => {
  // Implementation
}
```

### Components with State

```javascript
/**
 * Navbar Component - Application navigation header
 * 
 * Provides:
 * - Desktop and mobile responsive menus
 * - Navigation links to main pages
 * - Mobile hamburger toggle
 * 
 * @component
 * @returns {JSX.Element} Navigation bar with responsive design
 */
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Implementation
}
```

## Function Documentation

### Event Handlers

```javascript
/**
 * Toggle mobile menu visibility
 * Updates isMenuOpen state to show/hide mobile menu
 * 
 * @function toggleMenu
 * @returns {void}
 */
const toggleMenu = () => {
  setIsMenuOpen(!isMenuOpen);
};
```

### Data Fetching Functions

```javascript
/**
 * Fetch venues from backend API
 * Retrieves all available venues and updates component state
 * Includes error logging on failure
 * 
 * @async
 * @function fetchVenues
 * @returns {Promise<void>}
 */
const fetchVenues = async () => {
  try {
    const res = await axios.get("http://localhost:3000/api/venues");
    setVenues(res.data);
  } catch (err) {
    console.error("Error fetching venues:", err);
  }
}
```

### Validation Functions

```javascript
/**
 * Validate form before submission
 * Checks for required fields and data format
 * 
 * @function validateForm
 * @param {string} email - User email to validate
 * @param {string} password - User password to validate
 * @returns {boolean} True if valid, false otherwise
 */
const validateForm = (email, password) => {
  return email && password && password.length >= 8;
}
```

## API Documentation

### API Endpoints

When using API endpoints, document them inline:

```javascript
/**
 * Search for venues by sport type
 * 
 * Endpoint: GET /api/venues
 * Base URL: http://localhost:3000
 * 
 * Query Parameters:
 * - search: Sport type or venue name
 * 
 * Response Format:
 * {
 *   venue_id: string,
 *   venue_name: string,
 *   location: string,
 *   price_per_hour: number,
 *   amenities: string (comma-separated),
 *   primary_image: string (URL)
 * }
 */
const handleSearch = async (e) => {
  e.preventDefault();
  const response = await axios.get("http://localhost:3000/api/venues", {
    params: { search: searchText.trim() }
  });
  // Handle response
}
```

## Inline Code Comments

### When to Comment

Use comments for:
- Complex logic that isn't self-explanatory
- Important business rules
- Workarounds or hacks
- Non-obvious state updates
- API quirks or limitations

### When NOT to Comment

Avoid comments for:
- Self-explanatory variable names
- Simple loops or conditions
- Standard React patterns
- Built-in function behaviors

### Comment Style

```javascript
// Single line comment for quick explanations
const result = value * 2; // Multiply by 2 for percentage

/*
  Multi-line comment for complex
  logic that requires multiple lines
  to explain properly
*/

// TODO: Implement feature X when backend is ready
// FIXME: This validation is temporary until server-side validation

// NOTE: This API requires credentials included
// WARNING: Do not remove this dependency without updating Y
```

## Component Structure Documentation

### Template for New Components

```javascript
/**
 * @file ComponentName.jsx
 * @description Brief description of what this component does.
 * More detailed explanation if needed.
 */

import React from "react";

/**
 * ComponentName Component - Descriptive title
 * 
 * Features:
 * - Feature 1
 * - Feature 2
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.prop1 - Description of prop1
 * @returns {JSX.Element} Description of what component renders
 */
const ComponentName = ({ prop1 }) => {
  // State declarations
  
  // Event handlers
  
  // Effects
  
  // Render
  return (
    // JSX here
  );
};

export default ComponentName;
```

## State Documentation

### useState with Comments

```javascript
// Track loading state during API call
const [loading, setLoading] = useState(false);

// Store search results from API
const [venues, setVenues] = useState([]);

// Display error message to user
const [error, setError] = useState(null);

// Control mobile menu visibility
const [isMenuOpen, setIsMenuOpen] = useState(false);
```

### useEffect with Comments

```javascript
/**
 * Fetch trending venues when component mounts
 * Updates venues state with data from API
 */
useEffect(() => {
  fetchVenues();
}, []); // Empty dependency array = runs once on mount

/**
 * Update search text when prop changes
 * Synchronizes component state with prop value
 */
useEffect(() => {
  if (initialSearchText !== undefined) {
    setSearchText(initialSearchText);
  }
}, [initialSearchText]); // Dependency: re-run when prop changes
```

## Error Handling Documentation

```javascript
/**
 * Catch and handle API errors gracefully
 * Logs full error for debugging, shows user-friendly message
 * 
 * Error Types:
 * - Network errors: Show retry message
 * - Validation errors: Show field-specific messages
 * - Server errors: Show generic error message
 */
try {
  const response = await axios.get("/api/venues");
  // Handle success
} catch (err) {
  // Log full error for debugging
  console.error("Error fetching venues:", err);
  
  // Show user-friendly message
  setError("Something went wrong. Please try again.");
}
```

## Type Hints in Comments

```javascript
/**
 * @param {string} email - User's email address
 * @param {number} age - User's age in years
 * @param {boolean} isActive - Whether user is active
 * @param {Object} userData - User object containing name, email, id
 * @param {Array<string>} tags - Array of tag strings
 * @param {Function} callback - Function to call on completion
 * @param {JSX.Element} children - React child elements
 */
```

## Documenting Conditional Rendering

```javascript
// Show loading message while fetching data
{loading && (
  <div>Loading venues...</div>
)}

// Show error message if API call fails
{!loading && error && (
  <div className="error">{error}</div>
)}

// Show results only if search was performed and has results
{!loading && searchPerformed && venues.length === 0 && (
  <div>No venues found</div>
)}

// Show venues grid when data is loaded
{!loading && venues.length > 0 && (
  <div className="grid">{/* Render venues */}</div>
)}
```

## API Integration Notes

### When Adding New API Calls

1. Document the endpoint and method
2. List query parameters or request body
3. Describe expected response format
4. Note any authentication requirements
5. List possible error codes

Example:

```javascript
/**
 * Create a new booking
 * 
 * Endpoint: POST /api/bookings
 * Authentication: Required (include credentials)
 * 
 * Request Body:
 * {
 *   venue_id: string,
 *   date: string (YYYY-MM-DD),
 *   start_time: string (HH:mm),
 *   duration_hours: number
 * }
 * 
 * Response (Success - 201):
 * {
 *   booking_id: string,
 *   status: "confirmed",
 *   total_price: number
 * }
 * 
 * Error Responses:
 * - 400: Invalid input data
 * - 401: Not authenticated
 * - 409: Time slot already booked
 * - 500: Server error
 */
```

## Testing Documentation

```javascript
/**
 * Test: Should show error message when email is invalid
 * Given: User enters invalid email
 * When: User submits form
 * Then: Error message displays below email field
 */

/**
 * Test: Should fetch venues on component mount
 * Given: Component is mounted
 * When: useEffect runs
 * Then: API call is made and venues state is populated
 */
```

## Common Patterns Documentation

### Controlled Input

```javascript
// Controlled input pattern - state updates on change
// This allows real-time validation and search
const [searchText, setSearchText] = useState("");

return (
  <input
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
    placeholder="Search venues..."
  />
);
```

### Async Form Submission

```javascript
/**
 * Handle form submission with loading state
 * - Prevents duplicate submissions with loading state
 * - Shows user feedback during API call
 * - Handles errors gracefully
 */
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  
  try {
    const response = await axios.post("/api/bookings", formData);
    // Success handling
  } catch (err) {
    setError(err.response?.data?.message || "Request failed");
  } finally {
    setLoading(false);
  }
};
```

### Conditional CSS Classes

```javascript
// Apply different styles based on state
<button className={`
  px-4 py-2 rounded-lg transition
  ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}
`}>
  {loading ? 'Processing...' : 'Submit'}
</button>
```

## React-Specific Documentation

### Props Spreading

```javascript
/**
 * Pass through additional props to child element
 * Allows caller to customize element (className, data-*, etc.)
 * Example: <Component className="custom" data-test="value" />
 */
const Component = ({ name, ...props }) => (
  <div {...props}>{name}</div>
);
```

### Key Props in Lists

```javascript
/**
 * Use unique, stable IDs as keys for list items
 * CORRECT: Use database ID
 * <div key={item.id}>{item.name}</div>
 * 
 * WRONG: Don't use array index as key
 * <div key={index}>{item.name}</div>
 * 
 * Index as key causes issues with list reordering/filtering
 */
```

## Deployment & Environment Notes

```javascript
/**
 * NOTE: Environment-specific configuration
 * Development: http://localhost:3000
 * Production: https://api.playlink.com
 * 
 * Use environment variables instead of hardcoding
 * See .env.example for configuration
 */
const API_BASE_URL = process.env.VITE_API_BASE_URL;
```

## Debugging Documentation

```javascript
/**
 * Debug: Log API response structure
 * Remove after fixing feature
 */
console.log(res.data); // TODO: Remove after testing

/**
 * Debug: Component render tracking
 * Helps identify unnecessary re-renders
 */
console.log("Navbar rendered at", new Date().toLocaleTimeString());
```

## Best Practices

1. **Be Concise**: Say more with fewer words
2. **Be Specific**: Explain the "why" not just the "what"
3. **Keep Updated**: Update comments when code changes
4. **Use Consistent Style**: Follow project conventions
5. **Document Assumptions**: Explain why code is written a certain way
6. **Flag Important Notes**: Use TODO, FIXME, NOTE, WARNING
7. **Example Usage**: Show how to use complex functions
8. **Link to Resources**: Reference relevant documentation

## Documentation Review Checklist

- [ ] File has header comment with @file and @description
- [ ] All components have @component comments
- [ ] Complex functions are documented
- [ ] Props are documented with types
- [ ] API calls are documented with endpoint details
- [ ] Error handling is documented
- [ ] Complex logic has inline comments
- [ ] TODO/FIXME notes are present where needed
- [ ] Examples are provided for complex patterns
- [ ] Consistency with existing code style

---

Remember: **Code should read like prose**. Comments should explain *why* something is done, not *what* the code does (the code itself should be clear enough for that).
