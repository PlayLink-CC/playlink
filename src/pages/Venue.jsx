/**
 * @file Venue.jsx
 * @description Venues listing page with search and filter capabilities.
 * Uses backend search for sport filtering and client-side filtering
 * for venue name + location.
 */

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapPin, Check, Activity, AlertCircle, Search, Calendar } from "lucide-react";
import axios from "axios";

import SearchForm from "../components/SearchForm";
import SportsFilter from "../components/SportsFilter";

const Venue = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // All venues from backend for the current sport filter
  const [baseVenues, setBaseVenues] = useState([]);
  // Venues after applying text filters
  const [venues, setVenues] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Availability modal state
  const [showAvailability, setShowAvailability] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [filters, setFilters] = useState({
    name: "",
    location: "",
    sport: null,
  });

  // Apply local (name/location) filters on top of baseVenues
  const applyTextFilters = (sourceVenues, name, loc) => {
    const nameTerm = name.trim().toLowerCase();
    const locTerm = loc.trim().toLowerCase();

    let filtered = [...sourceVenues];

    if (nameTerm) {
      filtered = filtered.filter((v) =>
        (v.venue_name || v.name || "").toLowerCase().includes(nameTerm)
      );
    }

    if (locTerm) {
      filtered = filtered.filter((v) => {
        const locField = (
          v.location ||
          v.city ||
          v.address ||
          ""
        ).toLowerCase();
        return locField.includes(locTerm);
      });
    }

    setVenues(filtered);
    setSearchPerformed(
      !!(nameTerm || locTerm || filters.sport) && sourceVenues.length > 0
    );
  };

  // Initial load (no sport filter)
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:3000/api/venues");
        const data = res.data || [];
        setBaseVenues(data);

        // Pick up filters if we navigated from Home
        const initialName = location.state?.filters?.name || "";
        const initialLocation = location.state?.filters?.location || "";

        setFilters((prev) => ({
          ...prev,
          name: initialName,
          location: initialLocation,
        }));

        applyTextFilters(data, initialName, initialLocation);
      } catch (err) {
        console.error("Error fetching venues:", err);
        setBaseVenues([]);
        setVenues([]);
        setSearchPerformed(false);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Called by SearchForm on the Venues page
  const handleTextSearch = ({ name, location: loc }) => {
    const newName = name || "";
    const newLoc = loc || "";

    setFilters((prev) => ({
      ...prev,
      name: newName,
      location: newLoc,
    }));

    applyTextFilters(baseVenues, newName, newLoc);
  };

  // Called when a sport tile is toggled
  const handleSportToggle = async (sportNameOrNull) => {
    setFilters((prev) => ({
      ...prev,
      sport: sportNameOrNull,
    }));

    try {
      setLoading(true);

      let res;
      if (sportNameOrNull) {
        // Use backend search for that sport
        res = await axios.get("http://localhost:3000/api/venues", {
          params: { search: sportNameOrNull },
        });
      } else {
        // Clearing sport filter → fetch all venues again
        res = await axios.get("http://localhost:3000/api/venues");
      }

      const data = res.data || [];
      setBaseVenues(data);

      // Reapply name/location filters on top of this new base set
      applyTextFilters(data, filters.name, filters.location);
    } catch (err) {
      console.error("Error fetching sport-filtered venues:", err);
      setBaseVenues([]);
      setVenues([]);
      setSearchPerformed(false);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (venue) => {
    navigate("/create-booking", { state: { venue } });
  };

  // Show availability modal for a venue
  const handleViewAvailability = async (venueId) => {
    setSelectedVenueId(venueId);
    setShowAvailability(true);
    await fetchAvailability(venueId, selectedDate);
  };

  // Fetch booked slots for a venue on a specific date
  const fetchAvailability = async (venueId, date) => {
    setLoadingSlots(true);
    try {
      const res = await axios.get(
        `http://localhost:3000/api/bookings/booked-slots/${venueId}?date=${date}`
      );
      setBookedSlots(res.data.slots || []);
    } catch (err) {
      console.error("Error fetching availability:", err);
      setBookedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Handle date change in availability modal
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    fetchAvailability(selectedVenueId, newDate);
  };

  return (
    <>
      <div className="p-10"></div>

      {/* Search by venue name + location */}
      <SearchForm
        onSearch={handleTextSearch}
        initialName={location.state?.filters?.name || ""}
        initialLocation={location.state?.filters?.location || ""}
      />

      {/* Sport tiles as toggle filter */}
      <SportsFilter
        selectedSport={filters.sport}
        onSportToggle={handleSportToggle}
      />

      {/* Venues grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Book Now
        </h2>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading venues...</p>
          </div>
        )}

        {!loading && searchPerformed && venues.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <Search size={64} className="text-gray-400 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">
              No Venues Found
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              No venues match your filters. Try changing your search criteria or clearing some filters.
            </p>
          </div>
        )}

        {!loading && !searchPerformed && venues.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <AlertCircle size={64} className="text-gray-400 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">
              No Available Locations
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              We don't have any venues available at the moment. Please check back soon!
            </p>
          </div>
        )}

        {!loading && venues.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {venues.map((venue) => (
              <div
                key={venue.venue_id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={venue.primary_image}
                    alt={venue.venue_name}
                    className="w-full h-full object-cover hover:scale-110 transition duration-300"
                  />
                </div>

                <div className="p-6">
                  {/* Venue Name */}
                  <h3 className="font-bold text-xl text-gray-900 mb-2">
                    {venue.venue_name}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin size={16} className="mr-1" />
                    <span className="text-sm">
                      {venue.location || venue.city || venue.address}
                    </span>
                  </div>

                  {/* Sports */}
                  {venue.court_types && (
                    <div className="flex items-center text-gray-600 mb-3">
                      <Activity size={16} className="mr-1" />
                      <span className="text-sm">{venue.court_types}</span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center text-green-600 font-bold mb-4">
                    <p>LKR</p>
                    <span className="text-lg ml-1">
                      {venue.price_per_hour}/hour
                    </span>
                  </div>

                  {/* Description */}
                  {venue.description && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-700">
                        {venue.description}
                      </p>
                    </div>
                  )}

                  {/* Amenities */}
                  {venue.amenities && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Available Facilities:
                      </p>
                      <div className="space-y-1">
                        {venue.amenities.split(",").map((amenity, index) => (
                          <div
                            key={index}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <Check
                              size={14}
                              className="mr-2 text-green-500"
                            />
                            {amenity.trim()}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <button
                      onClick={() => handleBookNow(venue)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition cursor-pointer"
                    >
                      Book Now
                    </button>
                    <button
                      onClick={() => handleViewAvailability(venue.venue_id)}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Calendar size={16} />
                      View Availability
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Availability Modal */}
      {showAvailability && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Availability</h2>
              <button
                onClick={() => setShowAvailability(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <label className="block mb-4">
              <span className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </label>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Booked Slots for {selectedDate}
              </h3>

              {loadingSlots ? (
                <p className="text-sm text-gray-600 text-center py-4">
                  Loading availability...
                </p>
              ) : bookedSlots.length === 0 ? (
                <p className="text-sm text-green-600 text-center py-4">
                  ✓ No bookings - this date is fully available!
                </p>
              ) : (
                <div className="space-y-2">
                  {bookedSlots.map((slot, index) => {
                    const start = new Date(slot.booking_start);
                    const end = new Date(slot.booking_end);
                    const startTime = start.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const endTime = end.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    return (
                      <div
                        key={index}
                        className="bg-red-100 border border-red-300 rounded p-2 text-sm"
                      >
                        <p className="font-medium text-red-900">
                          {startTime} - {endTime}
                        </p>
                        <p className="text-xs text-red-700">{slot.status}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowAvailability(false)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Venue;

