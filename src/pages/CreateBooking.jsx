// src/pages/CreateBooking.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapPin, Clock, DollarSign, Calendar, AlertCircle } from "lucide-react";
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
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState("");

  useEffect(() => {
    if (!venue) {
      // No venue passed (e.g. direct URL) → redirect to venues
      navigate("/venues");
    }
  }, [venue, navigate]);

  // Fetch booked slots when date changes
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDate || !venue) return;

      setLoadingSlots(true);
      setSlotError("");
      try {
        const res = await fetch(
          `http://localhost:3000/api/bookings/booked-slots/${venue.venue_id}?date=${selectedDate}`
        );
        const data = await res.json();
        if (res.ok) {
          setBookedSlots(data.slots || []);
        } else {
          setSlotError("Could not load availability for this date");
        }
      } catch (err) {
        console.error("Error fetching booked slots:", err);
        setSlotError("Failed to load availability");
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchBookedSlots();
  }, [selectedDate, venue]);

  if (!venue) return null;

  const totalPrice =
    Number(venue.price_per_hour || 0) * Number(hours || 1);

  // Check if selected time slot conflicts with booked slots
  const checkTimeSlotConflict = () => {
    if (!selectedTime || !selectedDate) return false;

    const selectedStart = new Date(`${selectedDate}T${selectedTime}:00`);
    const selectedEnd = new Date(
      selectedStart.getTime() + Number(hours) * 60 * 60 * 1000
    );

    return bookedSlots.some((slot) => {
      const slotStart = new Date(slot.booking_start);
      const slotEnd = new Date(slot.booking_end);

      // Check for overlap
      return (
        (selectedStart < slotEnd && selectedEnd > slotStart)
      );
    });
  };

  const hasConflict = checkTimeSlotConflict();

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!selectedDate || !selectedTime || !hours) {
      alert("Please select date, time and duration");
      return;
    }

    if (hasConflict) {
      alert("This time slot is already booked. Please select a different time.");
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
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* Left: venue info and booking form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8">
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

          {/* Booking form */}
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

          {/* Conflict Warning */}
          {hasConflict && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">Time Slot Conflict</p>
                <p className="text-xs text-red-700 mt-1">
                  This time slot overlaps with an existing booking. Please select a different time or duration.
                </p>
              </div>
            </div>
          )}

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
            disabled={loading || hasConflict}
            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? "Redirecting to payment..." : "Proceed to payment"}
          </button>
          </div>
        </div>

        {/* Right: Booked Slots Panel */}
        {selectedDate && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-10">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Availability
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {selectedDate}
              </p>

              {loadingSlots ? (
                <div className="flex justify-center py-8">
                  <p className="text-sm text-gray-600">Loading slots...</p>
                </div>
              ) : slotError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs text-red-600">{slotError}</p>
                </div>
              ) : bookedSlots.length === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-sm font-semibold text-green-900">✓ Fully Available</p>
                  <p className="text-xs text-green-700 mt-1">No bookings for this date</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-3">
                    {bookedSlots.length} slot{bookedSlots.length !== 1 ? "s" : ""} booked:
                  </p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
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
                          className="bg-red-50 border border-red-200 rounded-lg p-3"
                        >
                          <p className="text-sm font-medium text-red-900">
                            {startTime} - {endTime}
                          </p>
                          <p className="text-xs text-red-700 mt-1">{slot.status}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateBooking;

