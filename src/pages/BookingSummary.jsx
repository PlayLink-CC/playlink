import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const statusClasses = (status) => {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-100 text-green-700";
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    case "CANCELLED":
      return "bg-red-100 text-red-700";
    case "COMPLETED":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const formatRange = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);

  const date = s.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const opts = { hour: "2-digit", minute: "2-digit" };
  const startTime = s.toLocaleTimeString(undefined, opts);
  const endTime = e.toLocaleTimeString(undefined, opts);

  return { date, startTime, endTime };
};

const BookingSummary = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [bookings, setBookings] = useState([]);
  const [latestBooking, setLatestBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingStripe, setProcessingStripe] = useState(false);
  const [error, setError] = useState("");

  const sessionId = searchParams.get("session_id");
  const cancelled = searchParams.get("cancelled");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const load = async () => {
      try {
        setLoading(true);

        // 1) If we came back from Stripe with a session_id, confirm payment
        if (sessionId && !cancelled) {
          setProcessingStripe(true);
          try {
            const res = await fetch(
              `http://16.171.20.120:3000/api/bookings/checkout-success?session_id=${encodeURIComponent(
                sessionId
              )}`,
              { credentials: "include" }
            );
            const data = await res.json();

            if (!res.ok) {
              console.error("Checkout-success error:", data);
              setError(
                data.message || "Payment completed, but booking sync failed"
              );
            } else {
              setLatestBooking(data.booking);
            }
          } catch (err) {
            console.error(err);
            setError("Error confirming payment");
          } finally {
            setProcessingStripe(false);
          }
        }

        // 2) Fetch all bookings for current user
        const resMy = await fetch(
          "http://16.171.20.120:3000/api/bookings/my",
          { credentials: "include" }
        );
        const dataMy = await resMy.json();

        if (!resMy.ok) {
          setError(dataMy.message || "Failed to load bookings");
        } else {
          setBookings(dataMy.bookings || []);
        }
      } catch (err) {
        console.error(err);
        setError("Unexpected error while loading bookings");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated, navigate, sessionId, cancelled]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">
          {processingStripe
            ? "Confirming your payment..."
            : "Loading your bookings..."}
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Stripe success / error banner */}
        {cancelled && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl text-sm">
            Payment was cancelled. No new booking was confirmed.
          </div>
        )}

        {latestBooking && !cancelled && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm">
            <p className="font-semibold mb-1">
              Booking confirmed for {latestBooking.venue_name}! 🎉
            </p>
            <p>
              {latestBooking.booking_start} – {latestBooking.booking_end}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600 mt-1">
              All your upcoming and past bookings.
            </p>
          </div>
          <button
            onClick={() => navigate("/venues")}
            className="hidden sm:inline-flex bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            Book a new court
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 px-6 py-10 text-center">
            <h2 className="text-lg font-semibold mb-1">
              You don&apos;t have any bookings yet
            </h2>
            <p className="text-gray-600 mb-4">
              Explore venues and book your first court.
            </p>
            <button
              onClick={() => navigate("/venues")}
              className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              Browse venues
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const { date, startTime, endTime } = formatRange(
                b.booking_start,
                b.booking_end
              );

              const isLatest =
                latestBooking &&
                latestBooking.booking_id === b.booking_id &&
                !cancelled;

              return (
                <div
                  key={b.booking_id}
                  className={
                    "bg-white rounded-2xl shadow-sm border px-5 py-4 md:px-6 md:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 " +
                    (isLatest ? "border-green-400" : "border-gray-100")
                  }
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {b.venue_name}
                      </h2>
                      <span
                        className={
                          "inline-flex px-2 py-0.5 rounded-full text-xs font-medium " +
                          statusClasses(b.status)
                        }
                      >
                        {b.status}
                      </span>
                      {isLatest && (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          New
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Date:</span> {date}
                      </p>
                      <p>
                        <span className="font-medium">Time:</span> {startTime} –{" "}
                        {endTime}
                      </p>
                      <p>
                        <span className="font-medium">Location:</span>{" "}
                        {b.venue_address || ""}{" "}
                        {b.venue_city && `• ${b.venue_city}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {b.is_initiator
                          ? "You created this booking"
                          : "You are a participant"}
                      </p>
                    </div>
                  </div>

                  <div className="md:text-right">
                    <div className="text-green-600 font-semibold mb-1">
                      LKR{" "}
                      {Number(
                        b.share_amount || b.total_amount
                      ).toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-500">
                      Payment: {b.payment_status}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingSummary;
