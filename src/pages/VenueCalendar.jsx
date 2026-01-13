import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus, Filter, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

const VenueCalendar = () => {
    const { user } = useAuth();
    const dateInputRef = useRef(null);
    const [view, setView] = useState("week"); // 'day', 'week', 'month'
    const [currentDate, setCurrentDate] = useState(new Date());
    const [venues, setVenues] = useState([]);
    const [selectedVenueId, setSelectedVenueId] = useState("");
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

            // Check overlap
            return (slotStart < bEnd && slotEnd > bStart);
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

    const handleSlotClick = (booking, dateStr, timeStr) => {
        if (booking) {
            setSelectedBooking(booking);
        } else {
            // Future: Walk-in creation logic
            console.log("Empty slot clicked", dateStr, timeStr);
        }
    };

    const handleCancelBooking = async () => {
        if (!selectedBooking) return;

        if (!confirm("Are you sure you want to cancel this booking? The player will be fully refunded.")) {
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

                        <button
                            onClick={() => toast("Walk-in creation coming soon!")}
                            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center transition shadow-sm whitespace-nowrap"
                        >
                            <Plus size={18} className="mr-2" />
                            New Walk-in
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                                                        } else {
                                                            cellClass = "bg-red-50 border-l-4 border-red-400 p-2 m-1 rounded";
                                                            cellContent = (
                                                                <div className="overflow-hidden">
                                                                    <span className="block text-xs font-bold text-red-600">Booked</span>
                                                                    {view === 'day' && (
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs text-gray-700 font-medium truncate">{booking.customer_name || 'Unknown User'}</span>
                                                                            <span className="text-[10px] text-gray-500 truncate">{booking.customer_email || `ID: ${booking.created_by}`}</span>
                                                                        </div>
                                                                    )}
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

            {/* Legend */}
            <div className="max-w-7xl mx-auto mt-6 flex gap-8">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">Available Slots</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">Booked / Reserved</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wide">Blocked</span>
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
                                        <div className="font-medium text-gray-900">{selectedBooking.customer_name || 'N/A'}</div>
                                        <div className="text-xs text-gray-500">{selectedBooking.customer_email || selectedBooking.created_by}</div>
                                    </div>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">Time</span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(selectedBooking.booking_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                        {new Date(selectedBooking.booking_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">Amount</span>
                                    <span className="font-medium text-gray-900">{formatCurrency(selectedBooking.total_amount)}</span>
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
                                        <div className="font-medium text-gray-900">{selectedBooking.customer_name || 'N/A'}</div>
                                        <div className="text-xs text-gray-500">{selectedBooking.customer_email || selectedBooking.created_by}</div>
                                    </div>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">Time</span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(selectedBooking.booking_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                        {new Date(selectedBooking.booking_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-500">Amount</span>
                                    <span className="font-medium text-gray-900">{formatCurrency(selectedBooking.total_amount)}</span>
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
