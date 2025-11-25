// src/pages/CreateBooking.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapPin, Clock, DollarSign, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const CreateBooking = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const venue = location.state?.venue;

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [hours, setHours] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!venue) {
      // No venue passed (e.g. direct URL) → redirect to venues
      navigate("/venues");
    }
  }, [venue, navigate]);

  if (!venue) return null;

  const totalPrice =
    Number(venue.price_per_hour || 0) * Number(hours || 1);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!selectedDate || !selectedTime || !hours) {
      alert("Please select date, time and duration");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:3000/api/bookings/checkout-session",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            venueId: venue.venue_id,
            date: selectedDate,
            time: selectedTime,
            hours: Number(hours),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to start payment");
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Left: venue info */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="h-56 w-full overflow-hidden">
            <img
              src={venue.primary_image}
              alt={venue.venue_name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {venue.venue_name}
            </h1>

            <div className="flex items-center text-gray-600 mb-2">
              <MapPin size={18} className="mr-2" />
              <span>{venue.location}</span>
            </div>

            <div className="flex items-center text-green-600 font-semibold mb-2">
              <DollarSign size={18} className="mr-1" />
              <span> LKR {venue.price_per_hour}/hour</span>
            </div>
          </div>
        </div>

        {/* Right: booking form */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Booking details</h2>

          <label className="block mb-4">
            <span className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </span>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Calendar size={18} className="mr-2 text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full outline-none text-sm"
              />
            </div>
          </label>

          <label className="block mb-4">
            <span className="block text-sm font-medium text-gray-700 mb-1">
              Start time
            </span>
            <div className="flex items-center border rounded-lg px-3 py-2">
              <Clock size={18} className="mr-2 text-gray-500" />
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full outline-none text-sm"
              />
            </div>
          </label>

          <label className="block mb-6">
            <span className="block text-sm font-medium text-gray-700 mb-1">
              Duration (hours)
            </span>
            <input
              type="number"
              min="1"
              max="6"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </label>

          <div className="border-t pt-4 mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Price per hour</span>
              <span>LKR {venue.price_per_hour}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>LKR {totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? "Redirecting to payment..." : "Proceed to payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBooking;
