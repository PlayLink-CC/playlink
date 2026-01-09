import React, { useEffect, useState } from "react";
import { toast } from "sonner";
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
  const { isAuthenticated, fetchWalletBalance } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [bookings, setBookings] = useState([]);
  const [latestBooking, setLatestBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingStripe, setProcessingStripe] = useState(false);
  const [error, setError] = useState("");
  const [payingShareId, setPayingShareId] = useState(null);

  // Modal States
  const [cancelModal, setCancelModal] = useState({ open: false, booking: null, refundAmount: 0 });
  const [rescheduleModal, setRescheduleModal] = useState({ open: false, booking: null, start: "", time: "" });

  const sessionId = searchParams.get("session_id");
  const cancelled = searchParams.get("cancelled");

  const loadBookings = async () => {
    try {
      const resMy = await fetch(
        `${import.meta.env.VITE_API_URL}/api/bookings/my`,
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
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const load = async () => {
      try {
        setLoading(true);

        if (sessionId && !cancelled && sessionId !== 'POINTS_PAYMENT') {
          setProcessingStripe(true);
          try {
            const res = await fetch(
              `${import.meta.env.VITE_API_URL}/api/bookings/checkout-success?session_id=${encodeURIComponent(
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
              fetchWalletBalance();
            }
          } catch (err) {
            console.error(err);
            setError("Error confirming payment");
          } finally {
            setProcessingStripe(false);
          }
        }
        else if (sessionId === 'POINTS_PAYMENT') {
          // handled via simple load but refresh wallet needed
          fetchWalletBalance();
        }

        await loadBookings();

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated, navigate, sessionId, cancelled]);

  const handlePayShare = async (bookingId) => {
    setPayingShareId(bookingId);
  };

  const executePayment = async (bookingId, useWallet) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/pay-split-share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ bookingId, useWallet })
      });
      const data = await res.json();

      if (res.ok) {
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          toast.success("Payment successful!");
          await loadBookings();
          setPayingShareId(null);
          fetchWalletBalance();
        }
      } else {
        toast.error(data.message || "Payment failed");
        setPayingShareId(null);
      }
    } catch (e) {
      toast.error("Error processing payment");
      setPayingShareId(null);
    }
  };

  const openCancelModal = (booking) => {
    // Calculate refund
    const now = new Date();
    const start = new Date(booking.booking_start);
    const hoursRemaining = (start - now) / (1000 * 60 * 60);

    let policyHours = booking.hours_before_start || 0;
    let refundPct = booking.refund_percentage || 0;

    if (booking.custom_refund_percentage !== null && booking.custom_refund_percentage !== undefined) {
      refundPct = booking.custom_refund_percentage;
      policyHours = booking.custom_hours_before_start || 0;
    }

    let refund = 0;


    // Check if started
    if (hoursRemaining <= 0) {
      toast.error("Cannot cancel a booking that has already started.");
      return;
    }

    if (hoursRemaining > policyHours) {
      refund = Number(booking.total_amount); // 100%
    } else {
      refund = Number(booking.total_amount) * (Number(refundPct) / 100); // 90% or whatever percent
    }

    setCancelModal({ open: true, booking, refundAmount: refund });
  };

  const confirmCancel = async () => {
    if (!cancelModal.booking) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${cancelModal.booking.booking_id}/cancel`, {
        method: 'PATCH',
        credentials: 'include'
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setCancelModal({ open: false, booking: null, refundAmount: 0 });
        loadBookings();
        fetchWalletBalance();
      } else {
        toast.error("Failed to cancel: " + data.message);
      }
    } catch (e) {
      console.error(e);
      toast.error("Error cancelling booking: " + e.message);
    }
  };

  const openRescheduleModal = (booking) => {
    // Initial guess: just default inputs to empty or current?
    // Let's current date/time
    const currentStart = new Date(booking.booking_start);
    const dateStr = currentStart.toLocaleDateString('en-CA'); // YYYY-MM-DD
    const timeStr = currentStart.toTimeString().substring(0, 5); // HH:MM

    setRescheduleModal({ open: true, booking, start: dateStr, time: timeStr });
  };

  const confirmReschedule = async () => {
    if (!rescheduleModal.booking) return;
    try {
      // Calculate hours from original booking duration
      const start = new Date(rescheduleModal.booking.booking_start);
      const end = new Date(rescheduleModal.booking.booking_end);
      const durationMs = end - start;
      const hours = durationMs / (1000 * 60 * 60);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${rescheduleModal.booking.booking_id}/reschedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          date: rescheduleModal.start,
          time: rescheduleModal.time,
          hours: hours
        })
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Booking rescheduled successfully!");
        setRescheduleModal({ open: false, booking: null, start: "", time: "" });
        loadBookings();
      } else {
        toast.error(data.message || "Failed to reschedule.");
      }
    } catch (e) {
      toast.error("Error rescheduling booking");
    }
  };

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

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {cancelled && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl text-sm">
            Payment was cancelled. No new booking was confirmed.
          </div>
        )}

        {sessionId === 'POINTS_PAYMENT' && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl text-sm">
            <p className="font-semibold mb-1">Booking confirmed using Playlink Points! 🎉</p>
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
          (() => {
            // Sort Descending
            const sorted = [...bookings].sort((a, b) => new Date(b.booking_start) - new Date(a.booking_start));
            const cancelledList = sorted.filter(b => b.status === 'CANCELLED');
            const activeList = sorted.filter(b => b.status !== 'CANCELLED');

            const renderCard = (b) => {
              const { date, startTime, endTime } = formatRange(
                b.booking_start,
                b.booking_end
              );

              const isLatest =
                latestBooking &&
                latestBooking.booking_id === b.booking_id &&
                !cancelled;

              const isPendingShare = b.payment_status === 'PENDING' && b.is_initiator === 0;
              const isConfirmed = b.status === "CONFIRMED";
              const isInitiator = b.is_initiator === 1;
              const notPassed = new Date(b.booking_start) > new Date();

              return (
                <div
                  key={b.booking_id}
                  className={
                    "bg-white rounded-2xl shadow-sm border px-5 py-4 md:px-6 md:py-5 flex flex-col md:flex-row md:justify-between gap-4 " +
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

                    {/* Action Buttons for Initiator */}
                    {isConfirmed && isInitiator && notPassed && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => openRescheduleModal(b)}
                          className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => openCancelModal(b)}
                          className="px-3 py-1 text-xs font-medium bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="md:text-right flex flex-col items-end gap-2">
                    <div className="text-green-600 font-semibold mb-1">
                      LKR{" "}
                      {Number(
                        b.is_initiator ? b.total_amount : (b.share_amount || b.total_amount)
                      ).toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      Payment: <span className={b.payment_status === 'PENDING' ? 'text-red-500 font-bold' : 'text-green-600'}>{b.payment_status}</span>
                    </p>
                    {b.points_used > 0 && (
                      <div className="text-xs text-gray-500 text-right mt-1">
                        <div>Points Used: LKR {Number(b.points_used).toFixed(2)}</div>
                        <div>Amount Paid: LKR {Number(b.paid_amount).toFixed(2)}</div>
                      </div>
                    )}

                    {isPendingShare && (
                      <div className="flex flex-col gap-2 items-end">
                        {payingShareId === b.booking_id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => executePayment(b.booking_id, true)}
                              className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded-lg shadow-sm font-medium transition"
                            >
                              Use Points
                            </button>
                            <button
                              onClick={() => executePayment(b.booking_id, false)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg shadow-sm font-medium transition"
                            >
                              Pay Card
                            </button>
                            <button
                              onClick={() => setPayingShareId(null)}
                              className="text-gray-500 hover:text-gray-700 text-xs px-2 py-1.5"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePayShare(b.booking_id)}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg shadow-sm font-medium transition"
                          >
                            Pay Your Share
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            };

            return (
              <div className="space-y-10">
                {/* Active Section */}
                <div>
                  {activeList.length > 0 && (
                    <div className="space-y-4">
                      {activeList.map(renderCard)}
                    </div>
                  )}
                  {activeList.length === 0 && cancelledList.length > 0 && (
                    <p className="text-gray-500 italic mb-4">No active bookings.</p>
                  )}
                </div>

                {/* Cancelled Section */}
                {cancelledList.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-t pt-8">Cancellation History</h2>
                    <div className="space-y-4 opacity-75 grayscale-[30%]">
                      {cancelledList.map(renderCard)}
                    </div>
                  </div>
                )}
              </div>
            );
          })()
        )}
      </div>

      {/* Cancel Modal */}
      {cancelModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cancel Booking?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This booking will be cancelled. All participants who have already paid their share will be automatically refunded to their Playlink Wallets based on the venue's policy.
            </p>
            <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">Refund Tier:</span>
                <span className="font-medium text-gray-700">
                  {/* Re-calculate to show tier text */}
                  {(() => {
                    const now = new Date();
                    const start = new Date(cancelModal.booking?.booking_start);
                    const hours = (start - now) / (1000 * 60 * 60);

                    let policyHours = cancelModal.booking?.hours_before_start || 0;
                    let refundPct = cancelModal.booking?.refund_percentage || 0;

                    if (cancelModal.booking?.custom_refund_percentage !== undefined && cancelModal.booking?.custom_refund_percentage !== null) {
                      refundPct = cancelModal.booking?.custom_refund_percentage;
                      policyHours = cancelModal.booking?.custom_hours_before_start || 0;
                    }

                    if (hours > policyHours) return "Early Cancellation (100%)";
                    return `Late Cancellation (${refundPct}%)`;
                  })()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Est. Refund:</span>
                <span className="font-bold text-green-600">LKR {cancelModal.refundAmount.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {(() => {
                  const now = new Date();
                  const start = new Date(cancelModal.booking?.booking_start);
                  const hours = (start - now) / (1000 * 60 * 60);

                  let policyHours = cancelModal.booking?.hours_before_start || 0;
                  // Use custom if present
                  if (cancelModal.booking?.custom_refund_percentage !== undefined && cancelModal.booking?.custom_refund_percentage !== null) {
                    policyHours = cancelModal.booking?.custom_hours_before_start || 0;
                  }

                  if (hours > policyHours) {
                    return `You are cancelling early (> ${policyHours}h before). You will receive a 100% refund.`;
                  } else {
                    const pct = (cancelModal.booking?.custom_refund_percentage !== undefined && cancelModal.booking?.custom_refund_percentage !== null)
                      ? cancelModal.booking?.custom_refund_percentage
                      : (cancelModal.booking?.refund_percentage || 0);

                    return `You are within the late cancellation window (<= ${policyHours}h before). You will receive a ${pct}% refund.`;
                  }
                })()}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCancelModal({ open: false, booking: null, refundAmount: 0 })}
                className="px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium hover:bg-red-700 rounded-lg"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reschedule Booking</h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose a new time for your game at <span className="font-semibold">{rescheduleModal.booking?.venue_name}</span>.
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">New Date</label>
                <input
                  type="date"
                  value={rescheduleModal.start}
                  onChange={(e) => setRescheduleModal({ ...rescheduleModal, start: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">New Time</label>
                <input
                  type="time"
                  value={rescheduleModal.time}
                  onChange={(e) => setRescheduleModal({ ...rescheduleModal, time: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRescheduleModal({ open: false, booking: null, start: "", time: "" })}
                className="px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={confirmReschedule}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 rounded-lg"
              >
                Reschedule
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default BookingSummary;
