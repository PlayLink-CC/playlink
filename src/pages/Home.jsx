/**
 * @file Home.jsx
 * @description Home page of PlayLink application.
 * Displays hero section, sports filter, and trending venues fetched from the backend.
 */

import { MapPin, Check, Activity, AlertCircle, Star, Users, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

import SportsFilter from "../components/SportsFilter.jsx";

import { useNavigate } from "react-router-dom";

/**
 * Home Component - Landing page
 * Features:
 * - Hero section with search form
 * - Sports filter display
 * - Trending venues section fetched from backend API
 * - Venue cards showing:
 *   - Venue image with hover zoom effect
 *   - Venue name and location
 *   - Price per hour
 *   - Available facilities/amenities
 *   - Book Now button
 *
 * Uses axios to fetch trending venues from the API (`${import.meta.env.VITE_API_URL}/api/venues/top-weekly).
 *
 * @component
 * @returns {JSX.Element} Home page with search, filters, and trending venues
 */

const Home = () => {
  const [venues, setVenues] = useState([]);

  const fetchVenues = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/venues/top-weekly`
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

  const navigate = useNavigate();

  const handleBookNow = (venue) => {
    navigate("/create-booking", { state: { venue } });
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-green-50 to-white py-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Book Sports Courts Instantly
          </h1>
          <p className="text-gray-600 text-xl mb-12 max-w-2xl mx-auto">
            Find and book your perfect court in seconds
          </p>

          {/* Hero Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
              <p className="text-gray-600 text-sm">Active Venues</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="text-3xl font-bold text-green-600 mb-2">10K+</div>
              <p className="text-gray-600 text-sm">Happy Users</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="text-3xl font-bold text-green-600 mb-2">50K+</div>
              <p className="text-gray-600 text-sm">Bookings Made</p>
            </div>
          </div>
        </div>
      </div>

      {/* Why PlayLink Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose PlayLink?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Booking</h3>
            <p className="text-gray-600">Reserve your court in just a few clicks. No waiting, no hassle.</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Great Community</h3>
            <p className="text-gray-600">Connect with sports enthusiasts and find your next playing partner.</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Venues</h3>
            <p className="text-gray-600">Access to the best quality courts with top-notch facilities.</p>
          </div>
        </div>
      </div>

      <SportsFilter
        onSportToggle={(sportNameOrNull) => {
          // Navigate to Venues page and activate the selected sport filter
          navigate("/venues", { state: { filters: { sport: sportNameOrNull } } });
        }}
      />

      {/* Trending Venues */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Trending Venues
        </h2>

        {venues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <AlertCircle size={64} className="text-gray-400 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">
              No Available Locations
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              We don't have any venues available at the moment. Please check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {venues.map((venue) => (
              <div
                key={venue.venue_id}
                onClick={() => handleBookNow(venue)}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer"
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

                  <button onClick={() => handleBookNow(venue)} className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition cursor-pointer">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Testimonials Section */}
      <div className="bg-white py-16 px-4 mt-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">"Amazing platform! Found the perfect court for my weekly badminton game. Highly recommended!"</p>
              <p className="font-semibold text-gray-900">— Sarah M.</p>
            </div>
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">"The booking process is so simple and the venues are premium quality. Love it!"</p>
              <p className="font-semibold text-gray-900">— John D.</p>
            </div>
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">"Perfect for finding basketball courts nearby. Great prices and instant confirmation!"</p>
              <p className="font-semibold text-gray-900">— Michael T.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Play?</h2>
          <p className="text-green-50 text-lg mb-8">Start booking your favorite sports court today and enjoy an amazing experience.</p>
          <button
            onClick={() => navigate("/venues")}
            className="bg-white text-green-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition shadow-lg"
          >
            Explore Venues
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
