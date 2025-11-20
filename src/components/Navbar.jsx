import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 lg:px-6 py-2 rounded-lg transition">
              Sign In
            </button>
          </div>

          {/* Mobile Menu Button */}
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

        {/* Mobile Menu */}
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
            <a
              href="#"
              className="block text-white hover:text-green-400 transition py-2"
            >
              My Bookings
            </a>
            <button className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition">
              Sign In
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
