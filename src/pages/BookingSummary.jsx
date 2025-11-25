// src/pages/BookingSummary.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const BookingSummary = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sessionId = searchParams.get("session_id");
  const cancelled = searchParams.get("cancelled");

  useEffect(() => {
    const run = async () => {
      if (cancelled) {
        setLoading(false);
        return;
      }

      if (!sessionId) {
        setLoading(false);
        setError("Missing payment session");
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:3000/api/bookings/checkout-success?session_id=${encodeURIComponent(
            sessionId
          )}`,
          { credentials: "include" }
        );
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to load booking");
        } else {
          setBooking(data.booking);
        }
      } catch (err) {
        console.error(err);
        setError("Unexpected error loading booking");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [sessionId, cancelled]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading booking details...</p>
      </div>
    );
  }

  if (cancelled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-2">Payment cancelled</h1>
        <p className="text-gray-600 mb-4">
          Your booking has not been confirmed.
        </p>
        <button
          onClick={() => navigate("/venues")}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Back to venues
        </button>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => navigate("/")}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Go home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-lg w-full">
        <h1 className="text-2xl font-bold mb-4">Booking confirmed 🎉</h1>

        <div className="space-y-2 text-sm text-gray-700 mb-6">
          <p>
            <span className="font-semibold">Venue: </span>
            {booking.venue_name}
          </p>
          <p>
            <span className="font-semibold">When: </span>
            {booking.booking_start} – {booking.booking_end}
          </p>
          <p>
            <span className="font-semibold">Total: </span>
            LKR {booking.total_amount}
          </p>
          <p>
            <span className="font-semibold">Status: </span>
            {booking.status}
          </p>
        </div>

        <button
          onClick={() => navigate("/booking-summary")}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
        >
          View all my bookings (future feature)
        </button>
      </div>
    </div>
  );
};

export default BookingSummary;
