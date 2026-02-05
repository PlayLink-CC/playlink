import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

const VenueCalendar = ({ isEmployeeView = false }) => {
    const { user } = useAuth();
    const dateInputRef = useRef(null);
    const [view, setView] = useState("week"); // 'day', 'week', 'month'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [venues, setVenues] = useState([]);
    const [selectedVenueId, setSelectedVenueId] = useState("");
    const [selectedSportId, setSelectedSportId] = useState("all");
    const [supportedSports, setSupportedSports] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial load: Get Venues
    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/venues/my-venues`, {
                    credentials: "include",
                });
                if (res.ok) {
                    const data = await res.json();
                    setVenues(data || []);
                    if (data.length > 0) {
                        setSelectedVenueId(data[0].venue_id);
                    }
                }
            } catch (error) {
                console.error("Error fetching venues", error);
                toast.error("Failed to load venues");
            }
        };
        if (user) fetchVenues();
    }, [user]);

    // Fetch supported sports for selected venue
    useEffect(() => {
        if (!selectedVenueId) return;
        const fetchSports = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/venues/${selectedVenueId}/sports`);
                if (res.ok) {
                    const data = await res.json();
                    setSupportedSports(data || []);
                }
            } catch (error) {
                console.error("Error fetching sports", error);
            }
        };
        fetchSports();
    }, [selectedVenueId]);

    // Fetch Bookings when venue or date changes
    useEffect(() => {
        if (!selectedVenueId) return;

        const fetchBookings = async () => {
            setLoading(true);
            try {
                // Calculate Start/End based on View
                let start = new Date(currentDate);
                let end = new Date(currentDate);

                if (view === 'day') {
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                } else if (view === 'week') {
                    const day = start.getDay();
                    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
                    start.setDate(diff); // Monday
                    start.setHours(0, 0, 0, 0);

                    end = new Date(start);
                    end.setDate(start.getDate() + 6); // Sunday
                    end.setHours(23, 59, 59, 999);
                }

                const formatDateLocal = (d) => {
                    const offset = d.getTimezoneOffset() * 60000;
                    return new Date(d.getTime() - offset).toISOString().split('T')[0];
                };

                const sStr = formatDateLocal(start);
                const eStr = formatDateLocal(end);

                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/bookings/venue/${selectedVenueId}/calendar?start=${sStr}&end=${eStr}`,
                    { credentials: "include" }
                );

                if (res.ok) {
                    const data = await res.json();
                    setBookings(data.bookings || []);
                }
            } catch (error) {
                console.error("Error fetching calendar", error);
                // toast.error("Failed to load bookings");
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [selectedVenueId, currentDate, view]);

    // Helpers
    const navigateDate = (direction) => {
        const newDate = new Date(currentDate);
        if (view === 'day') {
            newDate.setDate(currentDate.getDate() + direction);
        } else if (view === 'week') {
            newDate.setDate(currentDate.getDate() + (direction * 7));
        }
        setCurrentDate(newDate);
    };

    const getWeekDays = () => {
        const start = new Date(currentDate);
        const day = start.getDay(); // 0 is Sunday
        // Assuming Week starts on Monday? Image shows FRI 9, SAT 10... 
        // Let's standardise on Monday start.
        // If today is Friday (5), diff = 5 - 1 = 4. Start - 4 days = Monday.
        // If Sunday (0), diff = 0 - 1 = -1? No. 
        // JS getDay: Sun=0, Mon=1...
        // diff = getDate - day + (day == 0 ? -6 : 1)

        let d = new Date(currentDate);
        // Simply: find Monday
        const dayOfWeek = d.getDay();
        const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        d.setDate(diff);

        const days = [];
        for (let i = 0; i < 7; i++) {
            days.push(new Date(d));
            d.setDate(d.getDate() + 1);
        }
        return days;
    };

    const isBooked = (timeStr, dateStr) => {
        // Simple overlap check?
        // timeStr: "08:00"
        // dateStr: "2026-01-10"

        const slotStart = new Date(`${dateStr}T${timeStr}:00`);
        const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000); // 1 hour slot

        return bookings.find(b => {
            const bStart = new Date(b.booking_start);
            const bEnd = new Date(b.booking_end);

            // If a specific sport is selected, only show conflicts for that sport
            // OR legacy venue-wide blocks (sport_id is null)
            const sportMatch = selectedSportId === "all" ||
                b.sport_id === Number(selectedSportId) ||
                b.sport_id === null;

            // Check overlap
            return sportMatch && (slotStart < bEnd && slotEnd > bStart);
        });
    };

    // Render Logic
    const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM to 9 PM (15 hours)

    // Format header date
    const formatDateRange = () => {
        if (view === 'day') {
            return currentDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
        } else if (view === 'week') {
            const days = getWeekDays();
            const start = days[0];
            const end = days[6];
            return `Week of ${start.getDate()} ${start.toLocaleString('default', { month: 'short' })}`;
        } else {
            return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        }
    };

    const [selectedBooking, setSelectedBooking] = useState(null);
    const [slotActionModal, setSlotActionModal] = useState(null); // { dateStr, timeStr }
    const [walkInDetails, setWalkInDetails] = useState({
        customerName: "",
        customerEmail: "",
        duration: 1,
        amount: "",
        type: 'WALK_IN', // 'WALK_IN' or 'BLOCK'
        sportId: ""
    });

    const handleSlotClick = (booking, dateStr, timeStr) => {
        if (booking) {
            setSelectedBooking(booking);
        } else {
            // Open Action Modal for empty slots
            setSlotActionModal({ dateStr, timeStr });
            setWalkInDetails({
                ...walkInDetails,
                type: 'WALK_IN',
                duration: 1,
                sportId: selectedSportId === "all" ? "" : selectedSportId
            }); // Reset defaults
        }
    };

    const handleCreateWalkIn = async () => {
        if (!slotActionModal) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/venue/${selectedVenueId}/walk-in`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: slotActionModal.dateStr,
                    time: slotActionModal.timeStr,
                    hours: walkInDetails.duration,
                    type: walkInDetails.type,
                    customerName: walkInDetails.customerName,
                    customerEmail: walkInDetails.customerEmail,
                    sportId: walkInDetails.sportId || null,
                    totalAmount: Number(walkInDetails.amount) || 0
                }),
                credentials: "include",
            });

            if (res.ok) {
                toast.success(walkInDetails.type === 'WALK_IN' ? "Walk-in booking created!" : "Slot blocked successfully!");
                setSlotActionModal(null);
                // Refresh calendar
                const currentV = selectedVenueId;
                setSelectedVenueId("");
                setTimeout(() => setSelectedVenueId(currentV), 0);
            } else {
                const err = await res.json();
                toast.error(err.message || "Failed to create booking");
            }
        } catch (error) {
            console.error("Error creating walk-in", error);
            toast.error("Error creating booking");
        }
    };

    const handleCancelBooking = async () => {
        if (!selectedBooking) return;

        const isWalkIn = Number(selectedBooking.total_amount) === 0;
        const confirmMsg = isWalkIn
            ? "Are you sure you want to remove this walk-in booking/block? This action cannot be undone."
            : "Are you sure you want to cancel this booking? The player will be fully refunded.";

        if (!confirm(confirmMsg)) {
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${selectedBooking.booking_id}/cancel`, {
                method: "PATCH",
                credentials: "include",
            });

            if (res.ok) {
                toast.success("Booking cancelled and refunded successfully");
                setSelectedBooking(null);
                // Refresh calendar
                // A quick hack is to toggle view or date, but better to refetch.
                // Triggering refetch by updating a 'refresh' trigger state would be cleaner,
                // but let's just re-set selectedVenueId to itself or similar effect.
                const currentV = selectedVenueId;
                setSelectedVenueId("");
                setTimeout(() => setSelectedVenueId(currentV), 0);
            } else {
                const err = await res.json();
                toast.error(err.message || "Failed to cancel booking");
            }
        } catch (error) {
            console.error("Error cancelling booking", error);
            toast.error("Error cancelling booking");
        }
    };

    // Helper to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 relative">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-8">
                {/* ... existing header ... */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Venue Calendar</h1>
                        <p className="text-gray-500">View and manage time slots</p>
                    </div>

                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
                        {['day', 'week'].map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${view === v
                                    ? 'bg-gray-900 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">

                    {/* Date Navigation */}
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigateDate(-1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 border border-gray-200">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="relative flex items-center justify-center group">
                            <span
                                onClick={() => dateInputRef.current?.showPicker()}
                                className="cursor-pointer hover:bg-gray-100 rounded-lg px-3 py-1.5 transition-colors select-none flex items-center justify-center gap-3"
                            >
                                <div className="text-center">
                                    {view === 'day' ? (
                                        <>
                                            <div className="text-gray-900 font-bold text-lg leading-tight">
                                                {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
                                            </div>
                                            <div className="text-gray-500 text-sm font-medium leading-tight">
                                                {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-lg font-bold text-gray-800 whitespace-nowrap">
                                            {formatDateRange()}
                                        </div>
                                    )}
                                </div>
                                <CalendarIcon size={16} className="text-gray-400 group-hover:text-green-600 transition-colors" />
                            </span>
                            <input
                                type="date"
                                ref={dateInputRef}
                                className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
                                value={(() => {
                                    // Format current date as YYYY-MM-DD for input
                                    const d = new Date(currentDate);
                                    const offset = d.getTimezoneOffset() * 60000;
                                    return new Date(d.getTime() - offset).toISOString().split('T')[0];
                                })()}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        const [y, m, d] = e.target.value.split('-').map(Number);
                                        setCurrentDate(new Date(y, m - 1, d));
                                    }
                                }}
                            />
                        </div>
                        <button onClick={() => navigateDate(1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 border border-gray-200">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <select
                                value={selectedVenueId}
                                onChange={(e) => setSelectedVenueId(e.target.value)}
                                className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
                            >
                                {venues.map(v => (
                                    <option key={v.venue_id} value={v.venue_id}>{v.venue_name}</option>
                                ))}
                                {venues.length === 0 && <option>No Venues Found</option>}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <ChevronRight size={16} className="rotate-90" />
                            </div>
                        </div>

                        <div className="relative flex-1 md:w-64">
                            <select
                                value={selectedSportId}
                                onChange={(e) => setSelectedSportId(e.target.value)}
                                className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
                            >
                                <option value="all">All Sports</option>
                                {supportedSports.map(s => (
                                    <option key={s.sport_id} value={s.sport_id}>{s.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <ChevronRight size={16} className="rotate-90" />
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                const now = new Date();
                                const dateStr = now.toISOString().split('T')[0];
                                const currentHour = now.getHours();
                                const timeStr = `${currentHour.toString().padStart(2, '0')}:00`;

                                setSlotActionModal({ dateStr, timeStr });
                                setWalkInDetails({
                                    customerName: "",
                                    customerEmail: "",
                                    duration: 1,
                                    amount: "",
                                    type: 'WALK_IN',
                                    sportId: selectedSportId === "all" ? "" : selectedSportId
                                });
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center transition shadow-sm whitespace-nowrap"
                        >
                            <Plus size={18} className="mr-2" />
                            New Walk-in
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                    </div>
                )}
                {!['day', 'week'].includes(view) ? (
                    <div className="p-10 text-center text-gray-500">
                        Invalid View
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <div className="min-w-[800px]">
                            {/* Days Header */}
                            <div className="grid grid-cols-[80px_1fr] border-b border-gray-200">
                                <div className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-r border-gray-100">
                                    Time
                                </div>
                                <div className={`grid ${view === 'week' ? 'grid-cols-7' : 'grid-cols-1'}`}>
                                    {(view === 'week' ? getWeekDays() : [currentDate]).map((d, i) => (
                                        <div key={i} className="p-4 text-center border-r last:border-0 border-gray-100">
                                            <div className="text-xs font-bold text-gray-400 uppercase mb-1">
                                                {d.toLocaleDateString('en-US', { weekday: 'short' })}
                                            </div>
                                            <div className={`text-xl font-bold ${d.toDateString() === new Date().toDateString()
                                                ? 'text-green-600'
                                                : 'text-gray-900'
                                                }`}>
                                                {d.getDate()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Time Slots */}
                            <div>
                                {hours.map((hour) => {
                                    const timeLabel = `${hour}:00`;
                                    const timeStr = `${hour.toString().padStart(2, '0')}:00`;

                                    return (
                                        <div key={hour} className="grid grid-cols-[80px_1fr] border-b border-gray-100 last:border-0 h-20 group">
                                            {/* Time Column */}
                                            <div className="p-3 text-sm font-medium text-gray-500 border-r border-gray-100 bg-gray-50/50 flex items-start justify-center">
                                                {timeLabel}
                                            </div>

                                            {/* Days Columns */}
                                            <div className={`grid ${view === 'week' ? 'grid-cols-7' : 'grid-cols-1'}`}>
                                                {(view === 'week' ? getWeekDays() : [currentDate]).map((dayDate, dayIdx) => {
                                                    // Use local date string to match API/Backend
                                                    const dateStr = new Date(dayDate.getTime() - (dayDate.getTimezoneOffset() * 60000))
                                                        .toISOString().split('T')[0];

                                                    const booking = isBooked(timeStr, dateStr);

                                                    // Determine Status Style
                                                    let cellContent = null;
                                                    let cellClass = "hover:bg-gray-50 transition cursor-pointer relative";

                                                    // Alternating shading for Tue, Thu, Sat (indices 1, 3, 5)
                                                    if (view === 'week' && dayIdx % 2 !== 0) {
                                                        cellClass += " bg-gray-50/50";
                                                    }

                                                    if (booking) {
                                                        if (booking.status === 'BLOCKED') {
                                                            cellClass = "bg-gray-100 border-l-4 border-gray-400 p-2 m-1 rounded";
                                                            cellContent = <span className="text-xs font-bold text-gray-600">Blocked</span>;
                                                        } else if (booking.guest_name || booking.created_by === user?.id) {
                                                            // Walk-in Booking
                                                            cellClass = "bg-blue-50 border-l-4 border-blue-400 p-2 m-1 rounded shadow-sm hover:shadow-md transition-shadow";
                                                            cellContent = (
                                                                <div className="overflow-hidden">
                                                                    <span className="block text-[10px] font-bold text-blue-600 truncate uppercase tracking-tighter">Walk-in</span>
                                                                    <div className="flex flex-col mt-0.5">
                                                                        <span className="text-[11px] text-gray-800 font-bold truncate leading-tight">
                                                                            {booking.guest_name || booking.customer_name || 'Walk-in Guest'}
                                                                        </span>
                                                                        {view === 'day' && (
                                                                            <span className="text-[10px] text-gray-500 truncate">
                                                                                {booking.guest_email || 'Manual Entry'}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        } else {
                                                            // Online Booking
                                                            cellClass = "bg-red-50 border-l-4 border-red-400 p-2 m-1 rounded shadow-sm hover:shadow-md transition-shadow";
                                                            cellContent = (
                                                                <div className="overflow-hidden">
                                                                    <span className="block text-[10px] font-bold text-red-600 truncate uppercase tracking-tighter">Online Booking</span>
                                                                    <div className="flex flex-col mt-0.5">
                                                                        <span className="text-[11px] text-gray-800 font-bold truncate leading-tight">
                                                                            {booking.customer_name || 'Player'}
                                                                        </span>
                                                                        {view === 'day' && (
                                                                            <span className="text-[10px] text-gray-500 truncate">
                                                                                {booking.customer_email}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                    }

                                                    return (
                                                        <div
                                                            key={dayIdx}
                                                            className={`border-r last:border-0 border-gray-100 ${cellClass}`}
                                                            onClick={() => handleSlotClick(booking, dateStr, timeStr)}
                                                        >
                                                            {cellContent}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* NEW: Walk-in / Blocking Modal */}
            {slotActionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Manage Time Slot</h2>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={slotActionModal.dateStr}
                                        onChange={(e) => setSlotActionModal({ ...slotActionModal, dateStr: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        value={slotActionModal.timeStr}
                                        onChange={(e) => setSlotActionModal({ ...slotActionModal, timeStr: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                                <button
                                    onClick={() => setWalkInDetails({ ...walkInDetails, type: 'WALK_IN' })}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${walkInDetails.type === 'WALK_IN' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Add Walk-in
                                </button>
                                {!isEmployeeView && (
                                    <button
                                        onClick={() => setWalkInDetails({ ...walkInDetails, type: 'BLOCK' })}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${walkInDetails.type === 'BLOCK' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Block Slot
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Hours)</label>
                                    <select
                                        value={walkInDetails.duration}
                                        onChange={(e) => setWalkInDetails({ ...walkInDetails, duration: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    >
                                        {[1, 1.5, 2, 2.5, 3, 4, 5].map(h => (
                                            <option key={h} value={h}>{h} Hour{h > 1 ? 's' : ''}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
                                    <select
                                        value={walkInDetails.sportId}
                                        onChange={(e) => setWalkInDetails({ ...walkInDetails, sportId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                    >
                                        <option value="">Specific Court (None)</option>
                                        {supportedSports.map(s => (
                                            <option key={s.sport_id} value={s.sport_id}>{s.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        If "None" is selected, the entire venue will be blocked.
                                    </p>
                                </div>

                                {walkInDetails.type === 'WALK_IN' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (LKR)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={walkInDetails.amount}
                                                onChange={(e) => setWalkInDetails({ ...walkInDetails, amount: e.target.value })}
                                                placeholder="0.00"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name (Optional)</label>
                                            <input
                                                type="text"
                                                value={walkInDetails.customerName}
                                                onChange={(e) => setWalkInDetails({ ...walkInDetails, customerName: e.target.value })}
                                                placeholder="John Doe"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email / Contact (Optional)</label>
                                            <input
                                                type="text"
                                                value={walkInDetails.customerEmail}
                                                onChange={(e) => setWalkInDetails({ ...walkInDetails, customerEmail: e.target.value })}
                                                placeholder="john@example.com"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                            />
                                        </div>
                                    </>
                                )}

                                {walkInDetails.type === 'BLOCK' && (
                                    <div className="p-3 bg-gray-50 text-gray-600 text-sm rounded-lg border border-gray-200">
                                        Blocking this slot will make it unavailable for online bookings. You can unblock it later by cancelling the block.
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={() => setSlotActionModal(null)}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateWalkIn}
                                    className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors shadow-sm ${walkInDetails.type === 'WALK_IN' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-800 hover:bg-gray-900'
                                        }`}
                                >
                                    {walkInDetails.type === 'WALK_IN' ? 'Confirm Booking' : 'Block Slot'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="max-w-7xl mx-auto mt-6 flex flex-wrap gap-8">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 opacity-20 border border-green-500"></div>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">Available Slots</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">Online Bookings</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">Walk-in Bookings</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">Blocked / Maintenance</span>
                </div>
            </div>

            {/* Booking Details Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-1">Booking Details</h2>
                            <p className="text-sm text-gray-500 mb-6">Manage this reservation</p>

                            <div className="space-y-4">
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">Customer</span>
                                    <div className="text-right">
                                        <div className="font-medium text-gray-900">{selectedBooking.guest_name || selectedBooking.customer_name || 'N/A'}</div>
                                        <div className="text-xs text-gray-500">{selectedBooking.guest_email || selectedBooking.customer_email || selectedBooking.created_by}</div>
                                    </div>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">Time</span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(selectedBooking.booking_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                        {new Date(selectedBooking.booking_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                {!isEmployeeView && (
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-500">Amount</span>
                                        <span className="font-medium text-gray-900">{formatCurrency(selectedBooking.total_amount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">Sport</span>
                                    <span className="font-medium text-gray-900">{selectedBooking.sport_name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">Court</span>
                                    <span className="font-medium text-gray-900">{selectedBooking.court_name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">Status</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${selectedBooking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :

                                        selectedBooking.status === 'BLOCKED' ? 'bg-gray-100 text-gray-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {selectedBooking.status}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Close
                                </button>
                                {selectedBooking.status !== 'CANCELLED' && (
                                    <button
                                        onClick={handleCancelBooking}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-sm"
                                    >
                                        Cancel Booking
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VenueCalendar;
