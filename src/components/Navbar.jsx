import NotificationBell from "./NotificationBell";

// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navigate = useNavigate();
  const { user, isAuthenticated, logout, walletBalance } = useAuth();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const toggleProfile = () => setIsProfileOpen((prev) => !prev);

  const handleSignInClick = () => {
    setIsProfileOpen(false);
    navigate("/login");
  };

  const handleLogoutClick = async () => {
    await logout();
    setIsProfileOpen(false);
    navigate("/");
  };

  const dummyWalletClick = () => {
    navigate("/login", { state: { from: "/wallet" } });
  };

  const initial =
    isAuthenticated && user?.fullName
      ? user.fullName.charAt(0).toUpperCase()
      : "U";

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
            {isAuthenticated && (user?.accountType === "VENUE_OWNER" || user?.accountType === "EMPLOYEE") ? null : (
              <>
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
                  to={isAuthenticated ? "/booking-summary" : "/login"}
                  state={isAuthenticated ? {} : { from: "/booking-summary" }}
                  className="text-white hover:text-green-400 transition"
                >
                  My Bookings
                </Link>
              </>
            )}

            {isAuthenticated && user?.accountType === "VENUE_OWNER" && (
              <>
                <Link
                  to="/venue-dashboard"
                  className="text-white hover:text-green-400 transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/create-venue"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  List Your Venue
                </Link>
              </>
            )}

            {/* Wallet Logic */}
            {isAuthenticated && walletBalance !== null && user?.accountType !== "VENUE_OWNER" && user?.accountType !== "EMPLOYEE" && (
              <Link to="/wallet" className="text-white text-sm font-medium bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-700 flex items-center gap-2 transition">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                {Number(walletBalance).toFixed(2)}
              </Link>
            )}

            {!isAuthenticated && (
              <button
                onClick={dummyWalletClick}
                className="text-gray-400 hover:text-white text-sm font-medium mr-4 flex items-center gap-2 transition"
                title="Login to view wallet"
              >
                <Lock size={16} />
              </button>
            )}

            {/* Notifications and Profile */}
            <div className="flex items-center gap-4">
              {isAuthenticated && user?.accountType !== "EMPLOYEE" && <NotificationBell />}

              <div className="relative">
                <button
                  onClick={toggleProfile}
                  className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold focus:outline-none"
                >
                  {initial}
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg py-3 text-sm z-50">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 pb-3 border-b border-gray-100">
                          <p className="font-medium text-gray-900 truncate">
                            {user.fullName || "User"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                        <button
                          onClick={handleLogoutClick}
                          className="w-full text-left px-4 py-2 mt-1 text-red-600 hover:bg-red-50 rounded-b-xl"
                        >
                          Sign out
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleSignInClick}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl"
                      >
                        Sign in
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu Button + Profile icon */}
          <div className="flex items-center gap-3 md:hidden">
            {isAuthenticated && user?.accountType !== "EMPLOYEE" && <NotificationBell />}

            <button
              onClick={toggleProfile}
              className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold focus:outline-none"
            >
              {initial}
            </button>

            <button
              onClick={toggleMenu}
              className="md:hidden text-white focus:outline-none"
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

        {/* Mobile Nav Links */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-gray-700 pt-4">
            {(isAuthenticated && (user?.accountType === "VENUE_OWNER" || user?.accountType === "EMPLOYEE")) ? null : (
              <>
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
                  to={isAuthenticated ? "/booking-summary" : "/login"}
                  state={isAuthenticated ? {} : { from: "/booking-summary" }}
                  onClick={toggleMenu}
                  className="block text-white hover:text-green-400 transition py-2"
                >
                  My Bookings
                </Link>
              </>
            )}
            {isAuthenticated && user?.accountType === "VENUE_OWNER" && (
              <>
                <Link
                  to="/venue-dashboard"
                  onClick={toggleMenu}
                  className="block text-white hover:text-green-400 transition py-2"
                >
                  Dashboard
                </Link>
                <Link
                  to="/create-venue"
                  onClick={toggleMenu}
                  className="block text-green-400 hover:text-green-300 transition py-2 font-medium"
                >
                  List Your Venue
                </Link>
              </>
            )}
          </div>
        )}

        {/* Mobile Profile dropdown */}
        {isProfileOpen && (
          <div className="md:hidden mt-2 w-full">
            <div className="bg-white rounded-xl shadow-lg py-3 px-4 text-sm">
              {isAuthenticated ? (
                <>
                  <p className="font-medium text-gray-900">
                    {user.fullName || "User"}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">{user.email}</p>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full text-left text-red-600 hover:bg-red-50 rounded-lg px-3 py-2"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSignInClick}
                  className="w-full text-left text-gray-700 hover:bg-gray-100 rounded-lg px-3 py-2"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
