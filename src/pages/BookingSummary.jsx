import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Calendar,
  Clock,
  MapPin,
  Activity,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Users,
  AlertCircle,
  History,
  Trophy
} from "lucide-react";

const statusClasses = (status) => {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-50 text-green-700 border-green-100";
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-100";
    case "COMPLETED":
      return "bg-blue-50 text-blue-700 border-blue-100";
    default:
      return "bg-gray-50 text-gray-700 border-gray-100";
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
  const [activeTab, setActiveTab] = useState("upcoming"); // 'upcoming', 'past', 'cancelled'

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
    const now = new Date();
    const start = new Date(booking.booking_start);
    const hoursRemaining = (start - now) / (1000 * 60 * 60);

    let policyHours = booking.hours_before_start || 0;
    let refundPct = booking.refund_percentage || 0;

    if (booking.custom_refund_percentage !== null && booking.custom_refund_percentage !== undefined) {
      refundPct = booking.custom_refund_percentage;
      policyHours = booking.custom_hours_before_start || 0;
    }

    if (hoursRemaining <= 0) {
      toast.error("Cannot cancel a booking that has already started.");
      return;
    }

    let refund = hoursRemaining > policyHours
      ? Number(booking.total_amount)
      : Number(booking.total_amount) * (Number(refundPct) / 100);

    setCancelModal({ open: true, booking, refundAmount: refund });
  };

  const confirmCancel = async () => {
    if (!cancelModal.booking) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${cancelModal.booking.booking_id}/cancel`, {
        method: 'PATCH',
        credentials: "include"
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
      toast.error("Error cancelling booking");
    }
  };

  const openRescheduleModal = (booking) => {
    const currentStart = new Date(booking.booking_start);
    const dateStr = currentStart.toLocaleDateString('en-CA');
    const timeStr = currentStart.toTimeString().substring(0, 5);
    setRescheduleModal({ open: true, booking, start: dateStr, time: timeStr });
  };

  const confirmReschedule = async () => {
    if (!rescheduleModal.booking) return;
    try {
      const start = new Date(rescheduleModal.booking.booking_start);
      const end = new Date(rescheduleModal.booking.booking_end);
      const hours = (end - start) / (1000 * 60 * 60);

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
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm font-medium">
            {processingStripe ? "Confirming..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Status Alerts */}
        <div className="space-y-3">
          {cancelled && (
            <div className="bg-amber-50 border border-amber-100 text-amber-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
              <AlertCircle size={18} />
              <p>Payment was cancelled.</p>
            </div>
          )}
          {sessionId === 'POINTS_PAYMENT' && (
            <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
              <CheckCircle2 size={18} />
              <p className="font-medium">Confirmed via Playlink Points!</p>
            </div>
          )}
          {latestBooking && !cancelled && (
            <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
              <CheckCircle2 size={18} />
              <p>Confirmed for <strong>{latestBooking.venue_name}</strong>!</p>
            </div>
          )}
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">My Bookings</h1>
            <p className="text-gray-400 mt-2 font-medium">Keep track of your games and reservations.</p>
          </div>
          <button
            onClick={() => navigate("/venues")}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-sm"
          >
            <span>Book Again</span>
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-2xl w-fit">
          {[
            { id: 'upcoming', label: 'Upcoming', icon: Calendar },
            { id: 'past', label: 'History', icon: History },
            { id: 'cancelled', label: 'Cancelled', icon: XCircle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === tab.id
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="space-y-6">
          {(() => {
            const uniqueById = bookings.filter((v, i, a) => a.findIndex(t => t.booking_id === v.booking_id) === i);
            const now = new Date();

            let filtered = [];
            if (activeTab === 'upcoming') {
              filtered = uniqueById.filter(b => b.status !== 'CANCELLED' && new Date(b.booking_start) > now)
                .sort((a, b) => new Date(a.booking_start) - new Date(b.booking_start));
            } else if (activeTab === 'past') {
              filtered = uniqueById.filter(b => b.status !== 'CANCELLED' && new Date(b.booking_start) <= now)
                .sort((a, b) => new Date(b.booking_start) - new Date(a.booking_start));
            } else {
              filtered = uniqueById.filter(b => b.status === 'CANCELLED')
                .sort((a, b) => new Date(b.booking_start) - new Date(a.booking_start));
            }

            if (filtered.length === 0) {
              return (
                <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 py-24 text-center">
                  <div className="mx-auto w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                    <Trophy className="text-gray-200" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 capitalize">No {activeTab} matches</h3>
                  <p className="text-gray-400 mt-2 font-medium">Ready to start a new game?</p>
                </div>
              );
            }

            return filtered.map((b) => {
              const { date, startTime, endTime } = formatRange(b.booking_start, b.booking_end);
              const isLatest = latestBooking && latestBooking.booking_id === b.booking_id && !cancelled;
              const isPendingShare = b.payment_status === 'PENDING' && b.is_initiator === 0;
              const isConfirmed = b.status === "CONFIRMED";
              const isInitiator = b.is_initiator === 1;
              const notPassed = new Date(b.booking_start) > now;

              return (
                <div
                  key={b.booking_id}
                  className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 ${isLatest ? "border-green-400 ring-4 ring-green-400/10" : "border-gray-100 shadow-sm"
                    }`}
                >
                  <div className="flex flex-col md:flex-row items-stretch">
                    {/* Info Side */}
                    <div className="flex-1 p-6 sm:p-8 space-y-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <h2 className="text-2xl font-extrabold text-gray-900 group-hover:text-green-600 transition-colors">{b.venue_name}</h2>
                          {isLatest && <span className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider">LATEST</span>}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${statusClasses(b.status)}`}>
                          {b.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 flex-shrink-0">
                            <Calendar size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">Schedule</p>
                            <p className="font-bold text-gray-900 text-sm whitespace-nowrap">{date}</p>
                            <p className="text-xs text-gray-400 font-medium mt-0.5 leading-none">{startTime} - {endTime}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 flex-shrink-0">
                            <Activity size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">Court Info</p>
                            <p className="font-bold text-gray-900 text-sm">{b.sport_name}</p>
                            <p className="text-xs text-gray-400 font-medium mt-0.5 leading-none">{b.court_name}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 sm:col-span-2">
                          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 flex-shrink-0">
                            <MapPin size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">Address</p>
                            <p className="font-bold text-gray-900 text-sm">{b.venue_address || b.venue_city}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-gray-300" />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${b.is_initiator ? 'text-blue-500' : 'text-amber-500'}`}>
                            {b.is_initiator ? 'Host / Organizer' : 'Participant'}
                          </span>
                        </div>

                        {isConfirmed && isInitiator && notPassed && activeTab === 'upcoming' && (
                          <div className="flex gap-4 ml-auto">
                            <button
                              onClick={() => openRescheduleModal(b)}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border border-blue-100 shadow-sm active:scale-95 cursor-pointer"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => openCancelModal(b)}
                              className="bg-red-50 hover:bg-red-100 text-red-600 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border border-red-100 shadow-sm active:scale-95 cursor-pointer"
                            >
                              Cancel Booking
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pricing Side */}
                    <div className="bg-gray-50/50 border-t md:border-t-0 md:border-l border-gray-100 p-8 w-full md:w-64 flex flex-col justify-between gap-8">
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Your Share</p>
                          <p className="text-3xl font-black text-gray-900 tracking-tighter">
                            <span className="text-sm font-medium text-gray-300 mr-1 italic">LKR</span>
                            {Number(b.is_initiator ? b.total_amount : (b.share_amount || b.total_amount)).toLocaleString()}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Payment Status</p>
                          <span className={`flex items-center w-fit px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${b.payment_status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-green-50 text-green-600 border-green-100'
                            }`}>
                            {b.payment_status}
                          </span>
                        </div>
                      </div>

                      {isPendingShare && (
                        <div className="space-y-3">
                          {payingShareId === b.booking_id ? (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => executePayment(b.booking_id, true)}
                                className="bg-gray-900 hover:bg-black text-white text-[10px] font-black uppercase py-3 rounded-xl transition shadow-lg active:scale-95 cursor-pointer"
                              >
                                Points
                              </button>
                              <button
                                onClick={() => executePayment(b.booking_id, false)}
                                className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase py-3 rounded-xl transition shadow-lg active:scale-95 cursor-pointer"
                              >
                                Card
                              </button>
                              <button
                                onClick={() => setPayingShareId(null)}
                                className="col-span-2 text-gray-400 text-[10px] font-bold py-2 hover:text-gray-600 transition underline underline-offset-4 cursor-pointer"
                              >
                                Cancel Selection
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handlePayShare(b.booking_id)}
                              className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-black uppercase py-4 rounded-xl shadow-xl shadow-green-100 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                            >
                              Pay Share Now
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Styled Modals */}
      {(cancelModal.open || rescheduleModal.open) && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900/60 backdrop-blur-md z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200 p-8 border border-gray-100">
            {cancelModal.open ? (
              <div className="space-y-6">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <AlertCircle size={32} />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Cancel Booking?</h3>
                  <p className="text-sm text-gray-400 mt-2 font-medium leading-relaxed px-2">
                    Are you sure you want to cancel your session at <span className="text-gray-900 font-bold">{cancelModal.booking?.venue_name}</span>?
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-3">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-400 font-bold uppercase tracking-widest">Refund Percentage</span>
                    <span className="font-black text-gray-900">
                      {(() => {
                        const now = new Date();
                        const start = new Date(cancelModal.booking?.booking_start);
                        const hours = (start - now) / (1000 * 60 * 60);
                        let ph = cancelModal.booking?.hours_before_start || 0;
                        if (cancelModal.booking?.custom_refund_percentage !== null && cancelModal.booking?.custom_refund_percentage !== undefined) ph = cancelModal.booking?.custom_hours_before_start || 0;
                        return hours > ph ? '100%' : `${cancelModal.booking?.refund_percentage}%`;
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Est. Refund</span>
                    <p className="text-2xl font-black text-green-600 tracking-tighter">
                      <span className="text-xs font-normal italic opacity-60 mr-1">LKR</span>
                      {cancelModal.refundAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setCancelModal({ open: false, booking: null, refundAmount: 0 })}
                    className="px-6 py-3.5 bg-gray-50 font-bold text-gray-400 rounded-2xl text-sm transition hover:bg-gray-100 cursor-pointer"
                  >
                    Nah, Keep it
                  </button>
                  <button
                    onClick={confirmCancel}
                    className="px-6 py-3.5 bg-red-500 font-bold text-white rounded-2xl text-sm transition hover:bg-red-600 shadow-lg shadow-red-100 cursor-pointer"
                  >
                    Yes, Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Clock size={32} />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">New Match Time</h3>
                  <p className="text-sm text-gray-400 mt-2 font-medium">Re-scheduling <span className="text-gray-900 font-bold">{rescheduleModal.booking?.venue_name}</span>.</p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">New Date</label>
                    <input
                      type="date"
                      value={rescheduleModal.start}
                      onChange={(e) => setRescheduleModal({ ...rescheduleModal, start: e.target.value })}
                      className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-3.5 text-sm font-bold focus:bg-white focus:border-green-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">New Time</label>
                    <input
                      type="time"
                      value={rescheduleModal.time}
                      onChange={(e) => setRescheduleModal({ ...rescheduleModal, time: e.target.value })}
                      className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-3.5 text-sm font-bold focus:bg-white focus:border-green-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button
                    onClick={() => setRescheduleModal({ open: false, booking: null, start: "", time: "" })}
                    className="px-6 py-3.5 bg-gray-50 font-bold text-gray-400 rounded-2xl text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmReschedule}
                    className="px-6 py-3.5 bg-green-600 font-bold text-white rounded-2xl text-sm shadow-lg shadow-green-100 cursor-pointer"
                  >
                    Update
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


    </div>
  );
};

export default BookingSummary;
