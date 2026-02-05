/**
 * @file App.jsx
 * @description Main application component that sets up routing for the PlayLink application.
 * Defines all routes including authentication pages, main content pages, and legal pages.
 * Uses React Router for client-side navigation.
 */

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Home from "./pages/Home";
import SignUp from "./pages/Signup";
import Venue from "./pages/Venue";
import BookingSummary from "./pages/BookingSummary";
import NotFound from "./pages/NotFound";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CreateBooking from "./pages/CreateBooking";

import VenueDashboard from "./pages/VenueDashboard";
import CreateVenue from "./pages/CreateVenue";
import VenueDetails from "./pages/VenueDetails";
import Wallet from "./pages/Wallet";
import VenueCalendar from "./pages/VenueCalendar";
import EmployeeDashboard from "./pages/EmployeeDashboard";

/**
 * App Component - Main application router
 * Organizes all routes into logical groups:
 * - Authentication routes (Login, SignUp)
 * - Legal pages (Terms & Conditions, Privacy Policy)
 * - Protected routes with MainLayout (Home, Venues, Bookings, Create Booking)
 * - 404 fallback route
 *
 * @returns {JSX.Element} The routing structure of the application
 */
const App = () => {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" richColors />
      <Routes>
        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Terms and Conditions and Privacy Policy pages */}
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/venues" element={<Venue />} />
          <Route path="/venues/:id" element={<VenueDetails />} />
          <Route path="/create-booking" element={<CreateBooking />} />
        </Route>

        {/* Protected Routes for Players */}
        <Route element={<ProtectedRoute allowedRoles={['PLAYER']}><MainLayout /></ProtectedRoute>}>
          <Route path="/booking-summary" element={<BookingSummary />} />
          <Route path="/wallet" element={<Wallet />} />
        </Route>

        {/* Protected Routes for Venue Owners */}
        <Route element={<ProtectedRoute allowedRoles={['VENUE_OWNER']}><MainLayout /></ProtectedRoute>}>
          <Route path="/venue-dashboard" element={<VenueDashboard />} />
          <Route path="/venue-calendar" element={<VenueCalendar />} />
          <Route path="/create-venue" element={<CreateVenue />} />
        </Route>

        {/* Protected Routes for Employees */}
        <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><MainLayout /></ProtectedRoute>}>
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        </Route>

        {/* 404 Not Found Route - must be last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
