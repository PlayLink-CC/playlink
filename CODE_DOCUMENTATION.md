# PlayLink - Code Documentation

## Project Overview

PlayLink is a sports court booking application built with React, Vite, and Tailwind CSS. It allows users to search, browse, and book sports venues for various activities like tennis, basketball, football, and badminton.

## Technology Stack

- **Frontend Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.2
- **Styling**: Tailwind CSS 4.1.17
- **Routing**: React Router DOM 7.9.5
- **HTTP Client**: Axios 1.13.2
- **Icons**: Lucide React 0.553.0
- **Linter**: ESLint 9.39.1

## Project Structure

```
src/
├── main.jsx                 # Entry point - React root initialization
├── App.jsx                  # Main router component with all routes
├── styles/
│   └── index.css           # Global styles
├── components/
│   ├── Navbar.jsx          # Navigation header with responsive menu
│   ├── Footer.jsx          # Application footer
│   ├── SearchForm.jsx      # Venue search interface
│   ├── SportsFilter.jsx    # Sports category display
│   └── layout/
│       └── MainLayout.jsx  # Layout wrapper with Navbar & Footer
└── pages/
    ├── Home.jsx            # Landing page with trending venues
    ├── Login.jsx           # User authentication login
    ├── Signup.jsx          # User registration
    ├── Venue.jsx           # Venues listing with search
    ├── CreateBooking.jsx   # Court detail and booking page
    ├── BookingSummary.jsx  # User bookings summary (placeholder)
    ├── PrivacyPolicy.jsx   # Privacy policy page
    ├── TermsAndConditions.jsx # Terms and conditions page
    └── NotFound.jsx        # 404 error page
```

## Component Documentation

### Layout Components

#### MainLayout.jsx
- **Purpose**: Wraps pages with Navbar and Footer
- **Props**: `children` (optional) - content to render between navbar and footer
- **Usage**: Used as a route wrapper in App.jsx for main content pages

#### Navbar.jsx
- **Features**: 
  - Responsive design (desktop menu & mobile hamburger)
  - Navigation links to main pages
  - Sign In button
- **State**: `isMenuOpen` - controls mobile menu visibility

#### Footer.jsx
- **Sections**: Company info, Quick links, Legal links, Contact info
- **Layout**: 4-column grid on desktop, stacked on mobile

### Page Components

#### Home.jsx
- **Features**: Hero section, search form, sports filter, trending venues
- **API Call**: `GET /api/venues/top-weekly` - fetches trending venues
- **State**: `venues` array of venue objects
- **Effect**: Fetches trending venues on component mount

#### Login.jsx
- **Fields**: Email, Password
- **Validation**: Both fields required
- **API Call**: `POST /api/users/login` with credentials
- **Behavior**: Redirects to home on successful login

#### Signup.jsx
- **Fields**: Full Name, Email, Password, Confirm Password
- **Validation**:
  - All fields required
  - Password minimum 8 characters
  - Passwords must match
  - Terms must be accepted
- **Error Display**: Shows validation errors in red box

#### Venue.jsx
- **Features**: Search, filter, display all or search results
- **API Call**: `GET /api/venues` for all venues or search params
- **State Management**: 
  - `venues` - list of venue objects
  - `loading` - loading state
  - `searchPerformed` - track if search yielded no results
- **Location State**: Accepts search results from home page navigation

#### CreateBooking.jsx
- **Features**: Image gallery, venue info, facilities list, booking form
- **Form Fields**: Date, Time slot, Hours
- **Price Calculation**: Real-time calculation at $40/hour
- **Validation**: Requires date, time, and hours before booking

### Utility Components

#### SearchForm.jsx
- **Features**: Sport search, location search, search/clear buttons
- **API Integration**: Searches venues and returns results
- **Props Options**: 
  - `onSearch` callback for results
  - `navigate` custom navigation
  - `initialSearchText` pre-filled value
- **Error Handling**: Displays error messages when API fails

#### SportsFilter.jsx
- **Sports Included**: Tennis, Basketball, Football, Badminton
- **Design**: Emoji icons with color-coded backgrounds
- **Responsive**: Grid layout adjusts for mobile/desktop

### Legal Pages

#### PrivacyPolicy.jsx
- **Sections**: Data collection, usage, payments, cookies, security, user rights
- **Navigation**: Table of contents (sticky on desktop, dropdown on mobile)
- **Contact**: privacy@playlink.example

#### TermsAndConditions.jsx
- **Sections**: Acceptance, eligibility, bookings, cancellations, conduct, liability
- **Navigation**: Table of contents (sticky on desktop, dropdown on mobile)
- **Contact**: support@playlink.example

#### NotFound.jsx
- **Features**: 404 heading, error message, navigation buttons
- **Buttons**: "Go to Home" and "Go Back" with icons
- **Design**: Gradient backgrounds and animated elements

### Placeholder Components

#### BookingSummary.jsx
- **Current State**: Placeholder component
- **Future Implementation**: Should display user's bookings, cancellations, receipts

## API Endpoints Used

All endpoints use base URL: `http://localhost:3000/api`

| Method | Endpoint | Purpose | Used In |
|--------|----------|---------|---------|
| GET | `/venues` | Get all venues or search | Venue.jsx, SearchForm.jsx |
| GET | `/venues/top-weekly` | Get trending venues | Home.jsx |
| POST | `/users/login` | User authentication | Login.jsx |
| GET | `/venues/:id` | Get venue details | CreateBooking.jsx (future) |

## Routing Structure

```
/                          → Home page with MainLayout
/venues                    → Venues listing with MainLayout
/booking-summary           → Booking summary with MainLayout
/create-booking            → Booking form with MainLayout
/login                     → Login page (no layout)
/signup                    → Signup page (no layout)
/terms-and-conditions      → Terms page with MainLayout
/privacy-policy            → Privacy page with MainLayout
/*                         → 404 Not Found page
```

## State Management

Currently using React local state with `useState` and `useEffect` hooks:

- **Home.jsx**: Manages `venues` array
- **Navbar.jsx**: Manages `isMenuOpen` boolean
- **SearchForm.jsx**: Manages `searchText`, `loading`, `error`
- **Venue.jsx**: Manages `venues`, `loading`, `searchPerformed`
- **CreateBooking.jsx**: Manages `selectedImage`, `selectedDate`, `selectedTime`, `hours`
- **Login.jsx**: Manages `email`, `password`
- **Signup.jsx**: Manages form fields and `error`

## Styling

- **Framework**: Tailwind CSS 4.1.17
- **Approach**: Utility-first CSS with responsive breakpoints
- **Responsive Breakpoints**: 
  - `sm` (640px) - Small phones
  - `md` (768px) - Tablets
  - `lg` (1024px) - Desktops
- **Color Scheme**: Green (primary), Gray (secondary), accent colors for UI

## Development Workflow

### Available Scripts

```bash
npm run dev        # Start development server (Vite hot reload)
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Code Quality

- **Linting**: ESLint configured with React and React Hooks plugins
- **No Unused Variables**: Rule enforces removal except PascalCase constants
- **Strict Mode**: React StrictMode enabled in development
- **Hot Module Replacement**: Vite and React Refresh for instant updates

## Key Features

1. **Responsive Design**: Mobile-first approach with Tailwind CSS
2. **Search Functionality**: Search venues by sport/location
3. **Authentication**: Email/password login and signup
4. **Venue Booking**: Interactive booking form with date/time selection
5. **Error Handling**: User-friendly error messages
6. **Legal Pages**: Comprehensive privacy and terms documentation
7. **404 Handling**: Custom not found page with navigation

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

1. **BookingSummary.jsx**: Implement full booking history and management
2. **User Authentication**: Integrate with backend auth system
3. **Payment Integration**: Stripe payment processing
4. **Reviews & Ratings**: User review system for venues
5. **Filter Options**: Advanced filters (price, amenities, rating)
6. **Cancellation System**: Implement refund policies
7. **Notifications**: Email/SMS booking confirmations
8. **User Profile**: User account management page

## Debugging Tips

1. **Check Browser Console**: React StrictMode shows warnings
2. **Check Network Tab**: Verify API calls in DevTools
3. **Use React DevTools**: Browser extension for component inspection
4. **Check Loading States**: All async operations show loading feedback
5. **Error Messages**: All error states display user-friendly messages

## Performance Considerations

- **Code Splitting**: React Router enables automatic route-based splitting
- **Image Optimization**: Use responsive images in venue cards
- **API Caching**: Consider implementing query caching for search results
- **Lazy Loading**: Routes are loaded on-demand via React Router

## Security Notes

- **Credentials**: Login uses `credentials: 'include'` for HTTP-only cookies
- **CORS**: Backend should configure CORS for `http://localhost:3000`
- **Validation**: Form validation done on client-side (add server-side validation)
- **API Base URL**: Currently hardcoded, should use environment variables

## Environment Setup

Create a `.env` file in project root:
```
VITE_API_BASE_URL=http://localhost:3000/api
```

Then update API calls to use the environment variable.
