import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MapPin, Check, Activity } from "lucide-react";
import axios from "axios";

import SearchForm from "../components/SearchForm";
import SportsFilter from "../components/SportsFilter";

const Venue = () => {
  const location = useLocation();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/venues");
      console.log(res.data);
      setVenues(res.data);
      setSearchPerformed(false);
    } catch (err) {
      console.error("Error fetching venues:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchResults) => {
    setVenues(searchResults);
    setSearchPerformed(searchResults.length === 0 ? true : false);
  };

  useEffect(() => {
    // If coming from search on home page, use search results
    if (location.state?.isSearch && location.state?.searchResults) {
      setVenues(location.state.searchResults);
      setSearchPerformed(true);
      setLoading(false);
    } else {
      // Otherwise fetch all venues
      fetchVenues();
    }
  }, [location]);

  return (
    <>
      <div className="p-10"></div>
      <SearchForm
        onSearch={handleSearch}
        initialSearchText={location.state?.searchText}
      />
      <SportsFilter />

      {/* Book Now */}
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
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No venues found. Try a different search.
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
                    <span className="text-sm">{venue.location}</span>
                  </div>

                  {/* Court Type — you don't have courtType in API so using placeholder */}
                  <div className="flex items-center text-gray-600 mb-3">
                    <Activity size={16} className="mr-1" />
                    {/* need to data court type in database */}
                    <span className="text-sm">Sport Court</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center text-green-600 font-bold mb-4">
                    <p>LKR</p>
                    <span className="text-lg ml-1">
                      {venue.price_per_hour}/hour
                    </span>
                  </div>

                  {/* Amenities */}
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
                          <Check size={14} className="mr-2 text-green-500" />
                          {amenity.trim()}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition cursor-pointer">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Venue;
