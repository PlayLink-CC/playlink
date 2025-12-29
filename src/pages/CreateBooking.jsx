// src/pages/CreateBooking.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapPin, DollarSign, Calendar, AlertCircle, ArrowLeft, Users, X, Search, Wallet, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import TimeInput from "../components/TimeInput.jsx";
import { doesBookingFitInWindow } from "../utils/timeUtil.js";

const CreateBooking = () => {
  const { user, isAuthenticated } = useAuth();
  const { state } = useLocation();
  const navigate = useNavigate();

  // Initialize venue from state if available, but we will refresh it
  const [venue, setVenue] = useState(state?.venue || (state?.venueId ? { venue_id: state.venueId, venue_name: state.venueName, price_per_hour: state.price } : null));

  // Booking State
  // Booking State
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [hours, setHours] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState("");
  const [timeValidationError, setTimeValidationError] = useState("");

  // Split & Wallet State
  const [inviteQuery, setInviteQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [invitees, setInvitees] = useState([]); // Array of user objects
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [searchingUsers, setSearchingUsers] = useState(false);

  useEffect(() => {
    if (!venue) {
      navigate("/venues");
    }
  }, [venue, navigate]);

  // Today's date string for date min attribute
  const today = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const todayString = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  let minTime = null;
  if (selectedDate === todayString) {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const rounded = Math.ceil(minutes / 15) * 15;
    const hh = Math.floor(rounded / 60);
    const mm = rounded % 60;
    if (rounded >= 22 * 60) minTime = "22:00";
    else minTime = `${pad(hh)}:${pad(mm)}`;
  }

  // Fetch Wallet Balance
  useEffect(() => {
    if (isAuthenticated) {
      // Mock fetch or placeholder. 
      // Ideally: fetch('/api/users/me') and check balance if present.
    }
  }, [isAuthenticated]);

  // Fetch fresh venue data to get policy details
  useEffect(() => {
    if (venue?.venue_id) {
      const fetchVenue = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/venues/${venue.venue_id}?_t=${Date.now()}`);
          if (res.ok) {
            const data = await res.json();
            setVenue(prev => ({ ...prev, ...data }));
          }
        } catch (err) {
          console.error("Failed to fetch venue details", err);
        }
      };
      fetchVenue();
    }
  }, [venue?.venue_id]);

  // User Search
  useEffect(() => {
    if (inviteQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/search?query=${inviteQuery}`, {
          credentials: 'include'
        });
        const data = await res.json();
        if (res.ok) {
          // Filter out already invited users and self
          const filtered = (data.users || []).filter(u =>
            u.user_id !== user.user_id &&
            !invitees.find(i => i.user_id === u.user_id)
          );
          setSearchResults(filtered);
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setSearchingUsers(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inviteQuery, invitees, user]);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDate || !venue) return;
      setLoadingSlots(true);
      setSlotError("");
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/booked-slots/${venue.venue_id}?date=${selectedDate}`);
        const data = await res.json();
        if (res.ok) setBookedSlots(data.slots || []);
        else setSlotError("Could not load availability");
      } catch (err) {
        setSlotError("Failed to load availability");
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchBookedSlots();
  }, [selectedDate, venue]);

  useEffect(() => {
    if (selectedTime && hours) {
      if (selectedDate) {
        const selectedStart = new Date(`${selectedDate}T${selectedTime}:00`);
        const now = new Date();
        if (selectedStart.getTime() <= now.getTime()) {
          setTimeValidationError("Bookings must be in the future");
          return;
        }
      }
      const [sh, sm] = selectedTime.split(":").map(Number);
      const startTotal = sh * 60 + sm;
      const minutesUntilClose = 22 * 60 - startTotal;
      const maxDurFromTime = Math.floor(minutesUntilClose / 60);
      const maxAllowed = Math.min(4, Math.max(0, maxDurFromTime));

      if (Number(hours) > maxAllowed && maxAllowed >= 1) {
        setHours(maxAllowed);
        setTimeValidationError(`Duration adjusted to ${maxAllowed} hour${maxAllowed !== 1 ? "s" : ""} — venue closes at 10:00 PM`);
        return;
      }

      if (!doesBookingFitInWindow(selectedTime, parseInt(hours))) {
        setTimeValidationError("Booking must end by 10:00 PM");
      } else {
        setTimeValidationError("");
      }
    } else {
      setTimeValidationError("");
    }
  }, [selectedTime, hours, selectedDate]);

  if (!venue) return null;

  // Pricing Calculation
  const totalPrice = Number(venue.price_per_hour || 0) * Number(hours || 1);
  const totalPeople = invitees.length + 1;
  const sharePrice = totalPrice / totalPeople;

  const checkTimeSlotConflict = () => {
    if (!selectedTime || !selectedDate) return false;
    const selectedStart = new Date(`${selectedDate}T${selectedTime}:00`);
    const selectedEnd = new Date(selectedStart.getTime() + Number(hours) * 60 * 60 * 1000);
    return bookedSlots.some((slot) => {
      const slotStart = new Date(slot.booking_start);
      const slotEnd = new Date(slot.booking_end);
      return (selectedStart < slotEnd && selectedEnd > slotStart);
    });
  };

  const hasConflict = checkTimeSlotConflict();

  const handleAddInvitee = (user) => {
    setInvitees([...invitees, user]);
    setInviteQuery("");
    setSearchResults([]);
  };

  const handleRemoveInvitee = (id) => {
    setInvitees(invitees.filter(i => i.user_id !== id));
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!selectedDate || !selectedTime || !hours) {
      alert("Please select date, time and duration");
      return;
    }
    if (timeValidationError || hasConflict) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/bookings/checkout-session`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            venueId: venue.venue_id,
            date: selectedDate,
            time: selectedTime,
            hours: Number(hours),
            invites: invitees.map(i => i.email), // Send Emails!
            useWallet: useWallet
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to start payment");
        setLoading(false);
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.success) {
        // Direct success (Points)
        navigate(`/booking-summary?session_id=POINTS_PAYMENT`);
      }

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-green-600 font-medium mb-6 transition cursor-pointer">
          <ArrowLeft size={20} className="mr-2" /> Go Back
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8">
              <div className="h-56 w-full overflow-hidden">
                <img src={venue.primary_image} alt={venue.venue_name} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{venue.venue_name}</h1>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin size={18} className="mr-2" />
                  <span>{venue.location}</span>
                </div>
                <div className="flex items-center text-green-600 font-semibold mb-4">
                  <DollarSign size={18} className="mr-1" />
                  <span> LKR {venue.price_per_hour}/hour</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Booking details</h2>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 mb-1">Date</span>
                  <input type="date" value={selectedDate} min={todayString} onChange={(e) => setSelectedDate(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm outline-none" />
                </label>
                <label className="block">
                  <span className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</span>
                  <select value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm">
                    {[1, 2, 3, 4].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </label>
              </div>

              <label className="block mb-6">
                <span className="block text-sm font-medium text-gray-700 mb-1">Start time</span>
                <TimeInput value={selectedTime} onChange={setSelectedTime} minTime={minTime} />
              </label>

              {timeValidationError && (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
                  <AlertCircle size={18} className="text-orange-600 mt-0.5" />
                  <p className="text-sm text-orange-800">{timeValidationError}</p>
                </div>
              )}
              {hasConflict && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle size={18} className="text-red-600 mt-0.5" />
                  <p className="text-sm text-red-800">Time slot conflict.</p>
                </div>
              )}

              {/* Invite Friends Section */}
              <div className="border-t pt-6 mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Users size={20} className="mr-2 text-gray-600" />
                  Invite Friends (Split Cost)
                </h3>

                <div className="relative mb-4">
                  <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:bg-white focus-within:ring-2 ring-green-500 transition">
                    <Search size={18} className="text-gray-400 mr-2" />
                    <input
                      type="text"
                      placeholder="Search friends by name or email..."
                      className="bg-transparent w-full outline-none text-sm"
                      value={inviteQuery}
                      onChange={(e) => setInviteQuery(e.target.value)}
                    />
                  </div>

                  {/* Search Results Dropdown */}
                  {inviteQuery.length >= 2 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {searchingUsers ? (
                        <div className="p-3 text-sm text-gray-500">Searching...</div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map(u => (
                          <button
                            key={u.user_id}
                            onClick={() => handleAddInvitee(u)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex flex-col"
                          >
                            <span className="font-medium text-gray-800">{u.full_name}</span>
                            <span className="text-xs text-gray-500">{u.email}</span>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-sm text-gray-500">No users found</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Invitees List */}
                {invitees.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {invitees.map(invitee => (
                      <div key={invitee.user_id} className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                        <span>{invitee.full_name}</span>
                        <button onClick={() => handleRemoveInvitee(invitee.user_id)} className="ml-2 hover:text-red-500">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment & Breakdown */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Cost Breakdown</h3>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span>Venue Total</span>
                    <span>LKR {totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Friends Invited</span>
                    <span>{invitees.length}</span>
                  </div>
                  <div className="flex justify-between font-medium text-gray-900 bg-gray-50 p-2 rounded">
                    <span>Your Share ({invitees.length > 0 ? `1/${totalPeople}` : "Full"})</span>
                    <span>LKR {sharePrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Wallet Balance Checkbox */}
                <div className="flex items-center mb-6 p-4 border border-green-200 bg-green-50 rounded-lg">
                  <Wallet className="text-green-600 mr-3" size={24} />
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">Playlink Points</p>
                    <p className="text-xs text-green-700">Use your wallet balance to pay</p>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useWallet}
                      onChange={(e) => setUseWallet(e.target.checked)}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm font-medium text-green-900">Apply</span>
                  </label>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading || hasConflict || !!timeValidationError}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? "Processing..." : `Pay LKR ${(useWallet ? Math.max(0, totalPrice - 999999) : totalPrice).toFixed(0) === '0' ? 'via Points' : 'via Stripe'}`}
                </button>
              </div>

            </div>
          </div>

          <div className="lg:col-span-1">
            {/* Booked Slots */}
            {selectedDate && (
              <div className="bg-white rounded-2xl shadow-md p-6 sticky top-10">
                <h3 className="font-bold text-gray-900 mb-4">Availability</h3>
                {loadingSlots ? <p>Loading...</p> : (
                  bookedSlots.length === 0 ? <p className="text-green-600 text-sm">Full availability.</p> :
                    bookedSlots.map((s, i) => (
                      <div key={i} className="text-xs bg-red-50 p-2 mb-1 rounded text-red-700">
                        {new Date(s.booking_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(s.booking_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    ))
                )}

                {/* Cancellation Policy */}
                <div className="mt-6 border-t pt-4">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center text-sm">
                    <Shield size={16} className="mr-2 text-red-500" />
                    Cancellation Policy
                  </h3>
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm">
                    <p className="font-semibold text-red-800 mb-1">{venue.policy_name || "Standard Policy"}</p>
                    <p className="text-red-700 text-xs">
                      {venue.refund_percentage ? (
                        <>
                          LKR {((totalPrice * (100 - Number(venue.refund_percentage))) / 100).toFixed(2)} penalty if cancelled
                          {venue.hours_before_start > 0 ? ` within ${venue.hours_before_start} hours of start time.` : " anytime."}
                        </>
                      ) : (
                        "Review policy with venue owner."
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBooking;
