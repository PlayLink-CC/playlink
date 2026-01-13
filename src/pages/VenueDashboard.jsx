import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, MapPin, Activity, Calendar, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const VenueDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ total_bookings: 0, total_revenue: 0, active_venues: 0 });
    const [analytics, setAnalytics] = useState({ revenueByVenue: [], monthlyRevenue: [] });
    const [bookings, setBookings] = useState([]);
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/analytics/owner/summary`, {
                    credentials: "include",
                });
                if (statsRes.ok) {
                    const data = await statsRes.json();
                    setStats(data);
                }

                const bookingsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/owner`, {
                    credentials: "include",
                });
                if (bookingsRes.ok) {
                    const data = await bookingsRes.json();
                    setBookings(data.bookings || []);
                }

                const analyticsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/analytics/owner/detailed`, {
                    credentials: "include",
                });
                if (analyticsRes.ok) {
                    const data = await analyticsRes.json();
                    setAnalytics(data);
                }

                const venuesRes = await fetch(`${import.meta.env.VITE_API_URL}/api/venues/my-venues`, {
                    credentials: "include",
                });
                if (venuesRes.ok) {
                    const data = await venuesRes.json();
                    setVenues(data || []);
                }
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user]);

    const [unblockModal, setUnblockModal] = useState({ show: false, bookingId: null });

    const processUnblock = async () => {
        const bookingId = unblockModal.bookingId;
        if (!bookingId) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}/cancel`, {
                method: "PATCH",
                credentials: "include"
            });
            if (res.ok) {
                toast.success("Slot unblocked");
                setBookings(prev => prev.filter(b => b.booking_id !== bookingId));
                setUnblockModal({ show: false, bookingId: null });
            } else {
                toast.error("Failed to unblock");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error unblocking slot");
        }
    };

    const handleUnblock = (bookingId) => {
        setUnblockModal({ show: true, bookingId });
    };

    const [cancelModal, setCancelModal] = useState({ show: false, bookingId: null });

    const processCancelBooking = async () => {
        const bookingId = cancelModal.bookingId;
        if (!bookingId) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}/cancel`, {
                method: "PATCH",
                credentials: "include"
            });

            if (res.ok) {
                toast.success("Booking cancelled and refunded successfully");
                setBookings(prev => prev.map(b =>
                    b.booking_id === bookingId ? { ...b, status: 'CANCELLED' } : b
                ));
                setCancelModal({ show: false, bookingId: null });
            } else {
                const err = await res.json();
                toast.error(err.message || "Failed to cancel booking");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error cancelling booking");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome back, {user?.fullName || "Partner"}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Manage your venues and bookings from here.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/venue-calendar" className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-6 py-3 rounded-lg font-semibold flex items-center transition shadow-sm">
                            <Calendar size={20} className="mr-2" />
                            Calendar
                        </Link>
                        <Link to="/create-venue" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center transition shadow-md">
                            <PlusCircle size={20} className="mr-2" />
                            Add New Venue
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-medium uppercase">Total Bookings</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_bookings}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-medium">Revenue</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                            LKR {stats.total_revenue ? Number(stats.total_revenue).toLocaleString() : '0'}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-medium uppercase">Active Venues</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.active_venues}</p>
                    </div>
                </div>



                {/* Analytics Charts */}
                {analytics.revenueByVenue && analytics.revenueByVenue.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                        {/* Revenue by Venue */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue by Venue</h2>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.revenueByVenue}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="venue_name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `LKR ${value}`} />
                                        <RechartsTooltip formatter={(value) => `LKR ${Number(value).toLocaleString()}`} />
                                        <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]} name="Revenue" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Monthly Revenue Trend */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Monthly Revenue Trend</h2>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={(() => {
                                        const grouped = {};
                                        analytics.monthlyRevenue?.forEach(item => {
                                            if (!grouped[item.month]) grouped[item.month] = { name: item.month };
                                            grouped[item.month][item.venue_name] = Number(item.revenue);
                                        });
                                        return Object.values(grouped);
                                    })()}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `LKR ${value}`} />
                                        <RechartsTooltip formatter={(value) => `LKR ${Number(value).toLocaleString()}`} />
                                        <Legend />
                                        {Array.from(new Set(analytics.monthlyRevenue?.map(i => i.venue_name))).map((venueName, index) => (
                                            <Line
                                                key={venueName}
                                                type="monotone"
                                                dataKey={venueName}
                                                stroke={['#16a34a', '#2563eb', '#dc2626', '#d97706', '#9333ea'][index % 5]}
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* Venues List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-10">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">My Venues</h2>
                    {venues.length === 0 ? (
                        <p className="text-gray-500">You haven't listed any venues yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {venues.map((venue) => (
                                <Link to={`/venues/${venue.venue_id}`} key={venue.venue_id} className="block border rounded-xl overflow-hidden hover:shadow-md transition group">
                                    <div className="h-40 bg-gray-200 relative">
                                        <img
                                            src={venue.primary_image || 'https://via.placeholder.com/400x200?text=No+Image'}
                                            alt={venue.venue_name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                        />
                                        <div className="absolute top-2 right-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${venue.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {venue.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 truncate">{venue.venue_name}</h3>
                                        <p className="text-sm text-gray-500 mb-2 truncate">{venue.city}</p>
                                        <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-100">
                                            <span className="font-medium text-green-600">LKR {Number(venue.price_per_hour).toLocaleString()}/hr</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bookings List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Bookings</h2>
                    {bookings.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Activity size={32} className="text-green-600" />
                            </div>
                            <p className="text-gray-500">No bookings yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {/* Regular Bookings */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">Customer Bookings</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-gray-500 text-sm">
                                                <th className="pb-3 font-medium">Venue</th>
                                                <th className="pb-3 font-medium">Customer</th>
                                                <th className="pb-3 font-medium">Date & Time</th>
                                                <th className="pb-3 font-medium">Amount</th>
                                                <th className="pb-3 font-medium">Status</th>
                                                <th className="pb-3 font-medium w-16"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {bookings
                                                .filter(b => b.status !== 'BLOCKED')
                                                .map((booking) => (
                                                    <tr key={booking.booking_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                                        <td className="py-4 font-medium text-gray-900">{booking.venue_name}</td>
                                                        <td className="py-4 text-gray-600">
                                                            <div>{booking.customer_name}</div>
                                                            <div className="text-xs text-gray-400">{booking.customer_email}</div>
                                                        </td>
                                                        <td className="py-4 text-gray-600">
                                                            {new Date(booking.booking_start).toLocaleDateString()} <br />
                                                            <span className="text-xs">
                                                                {new Date(booking.booking_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 font-medium text-gray-900">
                                                            LKR {Number(booking.total_amount).toLocaleString()}
                                                        </td>
                                                        <td className="py-4">
                                                            <div className="flex flex-col">
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit
                                                                ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                                            booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                                                'bg-gray-100 text-gray-700'}`}>
                                                                    {booking.status}
                                                                </span>
                                                                {booking.status === 'CANCELLED' && (
                                                                    <span className="text-xs text-gray-500 mt-1 font-medium">
                                                                        Earned: LKR {booking.paid_amount ? (Number(booking.paid_amount) * 0.10).toLocaleString() : '0'}
                                                                        {/* Note: Ideally backend provides exact 'earned' amount or we calculate based on policy. 
                                                                            For now assuming 10% fee if not explicit, or we can use (paid - refund) if available. 
                                                                            Given Golden Path, we'll estimate 10% of Paid Amount or show 'Fee Applied' */}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-4">
                                                            {booking.status !== 'CANCELLED' && (
                                                                <button
                                                                    onClick={() => setCancelModal({ show: true, bookingId: booking.booking_id })}
                                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                    title="Cancel Booking"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Blocked Slots */}
                            <div className="pt-6 border-t border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">Blocked Time Slots</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-gray-500 text-sm">
                                                <th className="pb-3 font-medium">Venue</th>
                                                <th className="pb-3 font-medium">Date & Time</th>
                                                <th className="pb-3 font-medium">Status</th>
                                                <th className="pb-3 font-medium">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {bookings
                                                .filter(b => b.status === 'BLOCKED')
                                                .map((booking) => (
                                                    <tr key={booking.booking_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 bg-red-50/30">
                                                        <td className="py-4 font-medium text-gray-900">{booking.venue_name}</td>
                                                        <td className="py-4 text-gray-600">
                                                            {new Date(booking.booking_start).toLocaleDateString()} <br />
                                                            <span className="text-xs">
                                                                {new Date(booking.booking_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                {' - '}
                                                                {new Date(booking.booking_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </td>
                                                        <td className="py-4">
                                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                                BLOCKED
                                                            </span>
                                                        </td>
                                                        <td className="py-4">
                                                            <button
                                                                onClick={() => handleUnblock(booking.booking_id)}
                                                                className="px-3 py-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs rounded-lg transition"
                                                            >
                                                                Unblock
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            {bookings.filter(b => b.status === 'BLOCKED').length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="py-4 text-gray-500 text-center italic">No blocked slots</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Unblock Confirmation Modal */}
            {unblockModal.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 transform transition-all scale-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Unblock Time Slot?</h3>
                        <p className="text-gray-600 mb-6">
                            This will make the slot available for booking again. Are you sure you want to proceed?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setUnblockModal({ show: false, bookingId: null })}
                                className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={processUnblock}
                                className="px-5 py-2.5 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium shadow-md transition"
                            >
                                Yes, Unblock Slot
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Booking Modal */}
            {cancelModal.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 transform transition-all scale-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Booking?</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to cancel this booking? The player will be fully refunded (100%).
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setCancelModal({ show: false, bookingId: null })}
                                className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                            >
                                Back
                            </button>
                            <button
                                onClick={processCancelBooking}
                                className="px-5 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium shadow-md transition"
                            >
                                Yes, Cancel Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VenueDashboard;
