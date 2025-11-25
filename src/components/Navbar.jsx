import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { user, initializing, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const toggleProfile = () => setIsProfileOpen((prev) => !prev);

  const handleSignOut = async () => {
    await logout();
    setIsProfileOpen(false);
    navigate("/");
  };

  const handleSignInClick = () => {
    setIsProfileOpen(false);
    navigate("/login");
  };

  const avatarLetter =
    user?.fullName?.trim()?.charAt(0)?.toUpperCase() ??
    user?.email?.trim()?.charAt(0)?.toUpperCase() ??
    "U";

  return (
    <nav className="bg-gray-900 px-4 sm:px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-lg">PlayLink</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link to="/" className="text-white hover:text-green-400 transition">
              Home
            </Link>
            <Link
              to="/venues"
              className="text-white hover:text-green-400 transition"
            >
              Venues
            </Link>
            <Link
              to="/booking-summary"
              className="text-white hover:text-green-400 transition"
            >
              My Bookings
            </Link>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={toggleProfile}
                className="flex items-center gap-2 rounded-full border border-gray-700 bg-gray-800 px-3 py-1.5 text-white hover:bg-gray-700 transition"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-sm font-semibold">
                  {avatarLetter}
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-lg bg-gray-900 border border-gray-700 shadow-lg p-4 z-20">
                  {initializing ? (
                    <p className="text-sm text-gray-400">Checking session...</p>
                  ) : user ? (
                    <>
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-white">
                          {user.fullName || "User"}
                        </p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full rounded-md bg-red-500 hover:bg-red-600 text-white text-sm py-2 transition"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-gray-400 mb-3">
                        You are not signed in.
                      </p>
                      <button
                        onClick={handleSignInClick}
                        className="w-full rounded-md bg-green-500 hover:bg-green-600 text-white text-sm py-2 transition"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile right side: profile + hamburger */}
          <div className="flex items-center gap-3 md:hidden">
            {/* Profile icon (same logic, simpler dropdown) */}
            <div className="relative">
              <button
                onClick={toggleProfile}
                className="flex items-center justify-center h-9 w-9 rounded-full bg-gray-800 border border-gray-700 text-white"
                aria-label="Profile menu"
              >
                {avatarLetter}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg bg-gray-900 border border-gray-700 shadow-lg p-4 z-20">
                  {initializing ? (
                    <p className="text-sm text-gray-400">Checking session...</p>
                  ) : user ? (
                    <>
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-white">
                          {user.fullName || "User"}
                        </p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full rounded-md bg-red-500 hover:bg-red-600 text-white text-sm py-2 transition"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-gray-400 mb-3">
                        You are not signed in.
                      </p>
                      <button
                        onClick={handleSignInClick}
                        className="w-full rounded-md bg-green-500 hover:bg-green-600 text-white text-sm py-2 transition"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu links */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-gray-700 pt-4">
            <Link
              to="/"
              onClick={toggleMenu}
              className="block text-white hover:text-green-400 transition py-2"
            >
              Home
            </Link>
            <Link
              to="/venues"
              onClick={toggleMenu}
              className="block text-white hover:text-green-400 transition py-2"
            >
              Venues
            </Link>
            <Link
              to="/booking-summary"
              onClick={toggleMenu}
              className="block text-white hover:text-green-400 transition py-2"
            >
              My Bookings
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
