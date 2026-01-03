# PlayLink Frontend

A modern, responsive web application for the PlayLink sports venue booking platform. Built with **React 19**, **Vite**, and **Tailwind CSS v4**, this frontend provides a seamless experience for users to discover venues, book courts, and manage their sports activities.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Development](#development)

---

## Features

- 🏟️ **Venue Discovery**: Browse and search for sports venues with advanced filtering (sport type, location, availability).
- 📅 **Booking System**: Interactive booking interface with real-time availability checking.
- 🔐 **Authentication**: User secure login, registration, and role-based access control (User/Venue Owner).
- 👤 **User Dashboard**: Manage bookings, view history, and update profile settings.
- 📱 **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices.

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

---

## Project Structure

```
FrontEnd/
├── public/                  # Static assets
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── layout/          # Layout components (Header, Footer)
│   │   └── ...
│   ├── context/             # React Context for global state (Auth, etc.)
│   ├── pages/               # Page components (routed views)
│   ├── styles/              # Global styles and Tailwind configuration
│   ├── utils/               # Helper functions and constants
│   ├── App.jsx              # Main application component & Routing
│   └── main.jsx             # Entry point
├── .env                     # Environment variables
├── index.html               # HTML entry point
├── package.json             # Dependencies and scripts
└── vite.config.js           # Vite configuration
```

---

## Installation & Setup

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Steps

1. **Navigate to the frontend directory**
   ```bash
   cd FrontEnd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the `FrontEnd` root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`.

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | The base URL for the Backend API | `http://localhost:3000/api` |

---

## Scripts

- `npm run dev`: Starts the development server with HMR.
- `npm run build`: Builds the application for production.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run preview`: Locally preview the production build.

---

## Development Guidelines

### Component Design
- Components are built using functional React components and Hooks.
- Styling is handled exclusively via **Tailwind CSS classes**.
- Reusable components (buttons, inputs, cards) should be placed in `src/components`.

### Routing
- Routes are defined in `App.jsx` using `react-router-dom`.
- Protected routes (requiring login) are wrapped in a `<ProtectedRoute>` component.
