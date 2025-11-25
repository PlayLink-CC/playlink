/**
 * @file SearchForm.jsx
 * @description Search form for venues: by name + location.
 * - Used on Home (navigates to /venues with filters)
 * - Used on Venues page (calls onSearch with filters)
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * @param {function} [onSearch]  - Called on Venues page with { name, location }
 * @param {string}   [initialName]
 * @param {string}   [initialLocation]
 */
const SearchForm = ({ onSearch, initialName = "", initialLocation = "" }) => {
  const navigate = useNavigate();

  const [venueName, setVenueName] = useState(initialName);
  const [location, setLocation] = useState(initialLocation);

  // keep inputs in sync if props change (e.g. coming from Home → Venues)
  useEffect(() => {
    setVenueName(initialName || "");
  }, [initialName]);

  useEffect(() => {
    setLocation(initialLocation || "");
  }, [initialLocation]);

  const triggerSearch = (filters) => {
    const name = (filters.name || "").trim();
    const loc = (filters.location || "").trim();
    const hasFilters = !!(name || loc);

    if (onSearch) {
      // Venues page – let parent handle filtering
      onSearch({ name, location: loc });
    } else {
      // Home page – navigate to Venues with filters in location.state
      if (hasFilters) {
        navigate("/venues", { state: { filters: { name, location: loc } } });
      } else {
        // empty search → just go to venues with no filters
        navigate("/venues");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    triggerSearch({ name: venueName, location });
  };

  const clearName = () => {
    const newName = "";
    setVenueName(newName);

    // On Venues page: immediately re-filter.
    if (onSearch) {
      triggerSearch({ name: newName, location });
    }
  };

  const clearLocation = () => {
    const newLoc = "";
    setLocation(newLoc);

    if (onSearch) {
      triggerSearch({ name: venueName, location: newLoc });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search by venue name */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by venue name"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              className="w-full px-4 py-3 pr-9 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {venueName && (
              <button
                type="button"
                onClick={clearName}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
                aria-label="Clear venue name"
              >
                ×
              </button>
            )}
          </div>

          {/* Search by location */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 pr-9 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {location && (
              <button
                type="button"
                onClick={clearLocation}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
                aria-label="Clear location"
              >
                ×
              </button>
            )}
          </div>

          {/* Search button */}
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition whitespace-nowrap"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchForm;
