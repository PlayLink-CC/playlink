import { MapPin, Check, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

const Home = () => {
  const [venues, setVenues] = useState([]);

  const fetchVenues = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/venues/top-weekly"
      );
      console.log(res.data);
      setVenues(res.data);
    } catch (err) {
      console.error("Error fetching venues:", err);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const sports = [
    { name: "Tennis", icon: "🎾", color: "bg-green-100" },
    { name: "Basketball", icon: "🏀", color: "bg-orange-100" },
    { name: "Football", icon: "⚽", color: "bg-blue-100" },
    { name: "Badminton", icon: "🏸", color: "bg-purple-100" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-linear-to-b from-white to-gray-50 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Book Sports Courts Instantly
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Find and book your perfect court in seconds
          </p>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Search Sport"
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                placeholder="Search Location"
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="date"
                placeholder="mm/dd/yyyy"
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition">
                Search Courts
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Sports */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Popular Sports
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {sports.map((sport, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-8 text-center cursor-pointer"
            >
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 ${sport.color}`}
              >
                {sport.icon}
              </div>
              <h3 className="font-semibold text-gray-900">{sport.name}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Venues */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Trending Venues
        </h2>

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
      </div>
    </div>
  );
};

export default Home;
