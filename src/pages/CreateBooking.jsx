// src/pages/CreateBooking.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapPin, DollarSign, Calendar, AlertCircle, ArrowLeft, Users, X, Search, Wallet, Shield, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import ReviewSection from "../components/ReviewSection";
import BookingProgressBar from "../components/BookingProgressBar";
import PaymentForm from "../components/PaymentForm";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CreateBooking = () => {
  const { user, isAuthenticated } = useAuth();
  const { state } = useLocation();
  const navigate = useNavigate();

  // --- Step State ---
  const [currentStep, setCurrentStep] = useState(1);

  // --- Booking Data State ---
  const initialVenue = state?.venue || state?.bookingState?.venue || (state?.venueId ? { venue_id: state.venueId, venue_name: state.venueName, price_per_hour: state.price, primary_image: state.primary_image, location: state.location } : null);
  const [venue, setVenue] = useState(initialVenue);
  const [selectedDate, setSelectedDate] = useState(state?.bookingState?.selectedDate || "");
  const [selectedSlots, setSelectedSlots] = useState(state?.bookingState?.selectedSlots || []);
  const [selectedSport, setSelectedSport] = useState(state?.bookingState?.selectedSport || null);

  // --- Loading / Error States ---
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState("");
  const [timeValidationError, setTimeValidationError] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingAvailableSlots, setLoadingAvailableSlots] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [calculatingPrice, setCalculatingPrice] = useState(false);

  // --- Invite / Split State ---
  const [inviteQuery, setInviteQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [invitees, setInvitees] = useState(state?.bookingState?.invitees || []);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [isSplitting, setIsSplitting] = useState(null); // null, 'yes', 'no'

  // --- Payment State ---
  // --- Payment State ---
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [bookingSuccessData, setBookingSuccessData] = useState(null);
  const [countdown, setCountdown] = useState(20);
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);

  // --- Effects ---

  // Redirect if no venue
  useEffect(() => {
    if (!venue) navigate("/venues");
  }, [venue, navigate]);

  // Fetch Full Venue Details
  useEffect(() => {
    if (venue?.venue_id) {
      const fetchVenue = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/venues/${venue.venue_id}?_t=${Date.now()}`);
          if (res.ok) {
            const data = await res.json();
            setVenue(prev => ({ ...prev, ...data }));
            if (!selectedSport && data.sports?.length > 0) setSelectedSport(data.sports[0]);
          }
        } catch (err) {
          console.error("Failed to fetch venue", err);
        }
      };
      fetchVenue();
    }
  }, [venue?.venue_id]);

  // Fetch Booked Slots
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDate || !venue) return;
      setLoadingSlots(true);
      try {
        const sportTag = selectedSport ? `&sportId=${selectedSport.sport_id}` : "";
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/booked-slots/${venue.venue_id}?date=${selectedDate}${sportTag}`);
        const data = await res.json();
        if (res.ok) setBookedSlots(data.slots || []);
      } catch {
        setSlotError("Failed to load availability");
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchBookedSlots();
  }, [selectedDate, venue, selectedSport]);

  // Fetch Available Slots
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedDate || !venue || !selectedSport) return;
      setLoadingAvailableSlots(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/available-slots/${venue.venue_id}?date=${selectedDate}&hours=1&sportId=${selectedSport.sport_id}`);
        if (res.ok) {
          const data = await res.json();
          setAvailableSlots(data.slots || []);
        }
      } catch (err) {
        console.error("Failed to load available slots", err);
      } finally {
        setLoadingAvailableSlots(false);
      }
    };
    fetchAvailableSlots();
  }, [selectedDate, venue, selectedSport]);

  // Pricing Calculation
  useEffect(() => {
    if (!venue || !selectedDate || selectedSlots.length === 0) {
      setCalculatedPrice(0);
      return;
    }
    const fetchPrice = async () => {
      setCalculatingPrice(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/calculate-price`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          credentials: 'include',
          body: JSON.stringify({ venueId: venue.venue_id, date: selectedDate, slots: selectedSlots })
        });
        if (res.ok) {
          const data = await res.json();
          setCalculatedPrice(data.totalAmount);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCalculatingPrice(false);
      }
    };
    const timer = setTimeout(fetchPrice, 300);
    return () => clearTimeout(timer);
  }, [venue, selectedDate, selectedSlots]);

  // Fetch Wallet Balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/wallet/my-balance`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setWalletBalance(data.balance || 0);
        }
      } catch (e) {
        console.error("Failed to fetch wallet", e);
      }
    };
    if (isAuthenticated) fetchBalance();
  }, [isAuthenticated]);

  // User Search for Split
  useEffect(() => {
    if (inviteQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/search?query=${inviteQuery}`, { credentials: 'include' });
        const data = await res.json();
        if (res.ok) {
          const filtered = (data.users || []).filter(u => String(u.user_id) !== String(user?.id) && !invitees.find(i => String(i.user_id) === String(u.user_id)));
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

  // Countdown for success page
  useEffect(() => {
    if (currentStep === 4 && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (currentStep === 4 && countdown === 0) {
      navigate('/');
    }
  }, [currentStep, countdown, navigate]);


  // --- Helper Functions ---
  const formatTime = (time24) => {
    if (!time24) return "";
    const [h, m] = time24.split(":").map(Number);
    const date = new Date();
    date.setHours(h, m);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };
  const pad = (n) => String(n).padStart(2, "0");
  const todayString = `${new Date().getFullYear()}-${pad(new Date().getMonth() + 1)}-${pad(new Date().getDate())}`;

  const handleAddInvitee = (u) => { setInvitees([...invitees, u]); setInviteQuery(""); setSearchResults([]); };
  const handleRemoveInvitee = (id) => setInvitees(invitees.filter(i => i.user_id !== id));

  // --- Handlers ---
  const goToSplitStep = () => {
    if (!isAuthenticated) return navigate("/login", { state: { from: "/create-booking", bookingState: { venue, selectedDate, selectedSlots, selectedSport } } });
    if (!selectedDate || selectedSlots.length === 0 || !selectedSport) return alert("Please select date, slots and sport");
    setCurrentStep(2);
  };

  const goToSummaryStep = () => {
    // Step 2 -> Step 3
    setCurrentStep(3);
  };

  const handleBookWithPoints = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/confirm-points-booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem('token')}` },
        credentials: "include",
        body: JSON.stringify({
          venueId: venue.venue_id,
          date: selectedDate,
          slots: selectedSlots,
          sportId: selectedSport?.sport_id,
          invites: invitees.map(i => i.email),
        })
      });
      const data = await res.json();
      if (res.ok) {
        setBookingSuccessData(data);
        setCurrentStep(4);
      } else {
        alert(data.message || "Booking failed");
      }
    } catch (e) {
      alert("Error calling server");
    } finally {
      setLoading(false);
    }
  };

  const initStripePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem('token')}` },
        credentials: "include",
        body: JSON.stringify({
          venueId: venue.venue_id,
          date: selectedDate,
          slots: selectedSlots,
          sportId: selectedSport?.sport_id,
          invites: invitees.map(i => i.email),
          useWallet: useWallet
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to init payment");

      // Safety check if fully covered happened unexpectedly
      if (data.fullyCovered) {
        alert("Unexpected state: Payment fully covered by points. Please use 'Book Now' button.");
        return false;
      }

      setClientSecret(data.clientSecret);
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Called when user clicks "Proceed to Payment" (if Partial) or if they just toggled Points and remainder > 0
  // Actually, we want to show the Form immediately if clientSecret is ready?
  // Or fetch it when they click "Proceed"? 
  // Better UX: Click "Proceed", it fetches secret, then shows form? 
  // Step 3 is "Payment Summary". 
  // Let's make "Proceed" fetch secret and REVEAL the form in the same step.

  const [showStripeForm, setShowStripeForm] = useState(false);

  const handleProceedToPayment = async () => {
    // If we already have a client secret, just show the form
    if (clientSecret) {
      setShowStripeForm(true);
      return;
    }
    const success = await initStripePayment();
    if (success) {
      setShowStripeForm(true);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ paymentIntentId: paymentIntent.id }) // Send intent ID
      });
      const data = await res.json();
      if (res.ok) {
        setBookingSuccessData(data);
        setCurrentStep(4);
      } else {
        alert("Payment succeeded but booking confirmation failed: " + data.message);
      }
    } catch (e) {
      alert("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // --- Renders ---

  const renderStep1 = () => (
    <div className="grid lg:grid-cols-3 gap-8 animate-fadeIn">
      {/* Venue Info & Selection */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="h-56 w-full overflow-hidden relative">
            <img src={venue.primary_image} alt={venue.venue_name} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <h1 className="text-3xl font-bold text-white mb-1">{venue.venue_name}</h1>
              <div className="flex items-center text-white/90">
                <MapPin size={18} className="mr-2" />
                <span>{venue.location}</span>
              </div>
            </div>
          </div>
          <div className="p-6 flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Hourly Rate</p>
              <div className="flex items-center text-green-600 font-bold text-xl">
                <DollarSign size={20} className="mr-1" />
                <span>LKR {venue.price_per_hour}</span>
              </div>
            </div>
            {/* Sport Selection */}
            {venue.sports?.length > 0 && (
              <div className="flex gap-2">
                {venue.sports.map((sport) => (
                  <button
                    key={sport.sport_id}
                    onClick={() => setSelectedSport(sport)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedSport?.sport_id === sport.sport_id
                      ? "bg-green-600 text-white shadow-md ring-2 ring-green-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    {sport.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Select Date & Time</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input type="date" value={selectedDate} min={todayString} onChange={(e) => setSelectedDate(e.target.value)} className="w-full border rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 ring-green-500" />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Slots</label>
            {!selectedDate ? (
              <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed">Select a date to view slots</div>
            ) : loadingAvailableSlots ? (
              <div className="text-center py-8 text-gray-500">Loading availability...</div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8 text-red-500 bg-red-50 rounded-lg">No slots available.</div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => {
                      if (!slot.available) return;
                      setSelectedSlots(prev => prev.includes(slot.time) ? prev.filter(t => t !== slot.time) : [...prev, slot.time].sort());
                    }}
                    disabled={!slot.available}
                    className={`p-3 rounded-xl border2 transition flex flex-col items-center justify-center aspect-square ${!slot.available ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed" :
                      selectedSlots.includes(slot.time) ? "bg-green-600 text-white border-green-600 shadow-lg scale-105" :
                        "bg-white text-gray-700 border-gray-200 hover:border-green-400 hover:bg-green-50"
                      }`}
                  >
                    <span className="font-bold">{formatTime(slot.time)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={goToSplitStep}
            disabled={!selectedDate || selectedSlots.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-200 transition transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next Step
          </button>
        </div>
      </div>

      {/* Side Panel: booked slots */}
      <div className="lg:col-span-1">
        {selectedDate && <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
          <h3 className="font-bold text-gray-900 mb-4">Unavailable Times</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {loadingSlots ? <p>Loading...</p> : bookedSlots.length === 0 ? <p className="text-green-600 text-sm">Full availability!</p> :
              bookedSlots.map((s, i) => (
                <div key={i} className="flex items-center text-xs bg-red-50 p-3 rounded-lg text-red-700 border border-red-100">
                  <Clock size={14} className="mr-2" />
                  {new Date(s.booking_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(s.booking_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              ))
            }
          </div>
        </div>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Split Payment with Friends</h2>

      <div className="animate-fadeIn">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Players</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={inviteQuery}
              onChange={(e) => setInviteQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-xl bg-gray-50 focus:bg-white focus:ring-2 ring-green-500 outline-none transition"
            />
            {searchResults.length > 0 && <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border z-10 max-h-48 overflow-y-auto">
              {searchResults.map(u => (
                <button key={u.user_id} onClick={() => handleAddInvitee(u)} className="w-full text-left px-4 py-3 hover:bg-green-50 flex flex-col border-b last:border-b-0">
                  <span className="font-bold text-gray-800">{u.full_name}</span>
                  <span className="text-xs text-gray-500">{u.email}</span>
                </button>
              ))}
            </div>}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Participants</h3>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md font-medium">
              Est. per person: LKR {(calculatedPrice / (invitees.length + 1)).toFixed(2)}
            </span>
          </div>

          <div className="space-y-2">
            {/* Me */}
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold mr-3">
                  {user?.full_name?.charAt(0) || "Me"}
                </div>
                <span className="font-medium text-gray-900">You (Owner)</span>
              </div>
              <span className="text-sm font-bold text-gray-500">Payer</span>
            </div>

            {invitees.map(invitee => (
              <div key={invitee.user_id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold mr-3">
                    {invitee.full_name?.charAt(0) || "?"}
                  </div>
                  <span className="font-medium text-gray-900">{invitee.full_name || invitee.email}</span>
                </div>
                <button onClick={() => handleRemoveInvitee(invitee.user_id)} className="text-gray-400 hover:text-red-500 transition"><X size={18} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between gap-4 mt-8 pt-6 border-t">
          <button onClick={() => setCurrentStep(1)} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Back</button>
          <button onClick={goToSummaryStep} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-md transition flex items-center">
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const total = calculatedPrice;
    const pointsToUse = useWallet ? Math.min(walletBalance, total) : 0;
    const payAmount = total - pointsToUse;
    const isFullyCovered = payAmount <= 0;

    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 animate-fadeIn">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Summary</h2>

        <div className="bg-gray-50 rounded-xl p-6 space-y-4 mb-6">
          <div className="flex justify-between items-center text-gray-700">
            <span>Total Booking Amount</span>
            <span className="font-bold text-lg">LKR {total.toFixed(2)}</span>
          </div>

          {/* Wallet Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center">
              <Wallet className="text-green-600 mr-3" size={24} />
              <div>
                <p className="font-bold text-gray-900">Use PlayPoints</p>
                <p className="text-xs text-gray-500">Available Balance: LKR {walletBalance.toFixed(2)}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={useWallet} onChange={(e) => {
                setUseWallet(e.target.checked);
                setShowStripeForm(false); // Reset form if they toggle wallet, as amount changes
                setClientSecret("");
              }} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          {useWallet && pointsToUse > 0 && (
            <div className="flex justify-between items-center text-green-700 px-2">
              <span>Points Applied</span>
              <span>- LKR {pointsToUse.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-gray-300">
            <span className="text-xl font-bold text-gray-900">Payable Amount</span>
            <span className="text-2xl font-bold text-green-700">LKR {payAmount.toFixed(2)}</span>
          </div>
        </div>

        {!showStripeForm && !isFullyCovered && (
          <button onClick={handleProceedToPayment} disabled={loading} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50 flex justify-center items-center">
            {loading ? "Processing..." : `Proceed to Payment (LKR ${payAmount.toFixed(2)})`}
          </button>
        )}

        {isFullyCovered && (
          <button onClick={handleBookWithPoints} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center">
            <CheckCircle className="mr-2" /> Book Now (Using Points)
          </button>
        )}

        {showStripeForm && clientSecret && !isFullyCovered && (
          <div className="mt-6 animate-fadeIn">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-gray-700">Card Payment</h3>
              <button onClick={() => setShowStripeForm(false)} className="text-sm text-gray-500 hover:underline">Change Method</button>
            </div>
            <Elements key={clientSecret} stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm amount={payAmount} onSuccess={handlePaymentSuccess} onBack={() => setShowStripeForm(false)} />
            </Elements>
          </div>
        )}
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-10 text-center animate-fadeIn">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={48} strokeWidth={3} />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
      <p className="text-gray-600 mb-8">Your booking has been confirmed.</p>

      <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-500">Venue</span>
          <span className="font-semibold text-gray-900">{venue.venue_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Date</span>
          <span className="font-semibold text-gray-900">{selectedDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Amount Paid</span>
          <span className="font-semibold text-green-700">LKR {calculatedPrice.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition">Home</button>
        <button onClick={() => navigate('/my-bookings')} className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition">View Bookings</button>
      </div>
      <p className="text-xs text-gray-400 mt-6">Redirecting in {countdown}s...</p>
    </div>
  );

  if (!venue) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-4">
      <BookingProgressBar currentStep={currentStep} />
      <div className="max-w-7xl mx-auto px-4">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>
    </div>
  );
};

export default CreateBooking;
