/**
 * @file SearchForm.jsx
 * @description Search form for venues: by name + location.
 * - Used on Home (navigates to /venues with filters)
 * - Used on Venues page (calls onSearch with filters)
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LocateFixed, MapPin, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

/**
 * @param {function} [onSearch]  - Called on Venues page with { name, location }
 * @param {string}   [initialName]
 * @param {string}   [initialLocation]
 */
const SearchForm = ({ onSearch, initialName = "", initialLocation = "" }) => {
  const navigate = useNavigate();

  const [venueName, setVenueName] = useState(initialName);
  const [location, setLocation] = useState(initialLocation);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // keep inputs in sync if props change (e.g. coming from Home → Venues)
  useEffect(() => {
    setVenueName(initialName || "");
  }, [initialName]);

  useEffect(() => {
    setLocation(initialLocation || "");
  }, [initialLocation]);

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Use Nominatim's reverse geocoding (OpenStreetMap)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
          );
          const data = await res.json();

          // Try to get city, town, or suburb
          const city = data.address.city || data.address.town || data.address.village || data.address.suburb;

          if (city) {
            setLocation(city);
            toast.success(`Detected location: ${city}`);
            // If on Venues page, we don't trigger search automatically yet, user can refine
          } else {
            toast.error("Could not determine city from coordinates");
          }
        } catch (err) {
          console.error("Geocoding error:", err);
          toast.error("Failed to detect city");
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        setDetectingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Please enable location access in your browser settings");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable");
            break;
          case error.TIMEOUT:
            toast.error("The request to get user location timed out");
            break;
          default:
            toast.error("An unknown error occurred");
        }
      },
      { timeout: 10000 }
    );
  };

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
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <MapPin size={20} />
            </div>
            <input
              type="text"
              placeholder="Search by location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              {location && (
                <button
                  type="button"
                  onClick={clearLocation}
                  className="text-gray-400 hover:text-gray-600 text-lg leading-none p-1"
                  aria-label="Clear location"
                >
                  ×
                </button>
              )}
              <button
                type="button"
                onClick={handleGeolocation}
                disabled={detectingLocation}
                className={`p-1.5 rounded-md transition-all ${detectingLocation
                    ? "bg-green-50 text-green-600"
                    : "text-green-600 hover:bg-green-50"
                  }`}
                title="Detect current location"
              >
                {detectingLocation ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <LocateFixed size={18} />
                )}
              </button>
            </div>
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
