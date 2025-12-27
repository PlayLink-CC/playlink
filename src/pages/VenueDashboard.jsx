import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, MapPin, Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const VenueDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ total_bookings: 0, total_revenue: 0, active_venues: 0 });
    const [bookings, setBookings] = useState([]);
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
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [user]);

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
                    <Link to="/create-venue" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center transition shadow-md">
                        <PlusCircle size={20} className="mr-2" />
                        Add New Venue
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-medium uppercase">Total Bookings</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_bookings}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-medium uppercase">Total Revenue</h3>
                        <p className="text-3xl font-bold text-green-600 mt-2">
                            LKR {Number(stats.total_revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-medium uppercase">Active Venues</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.active_venues}</p>
                    </div>
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
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 text-gray-500 text-sm">
                                        <th className="pb-3 font-medium">Venue</th>
                                        <th className="pb-3 font-medium">Customer</th>
                                        <th className="pb-3 font-medium">Date & Time</th>
                                        <th className="pb-3 font-medium">Amount</th>
                                        <th className="pb-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {bookings.map((booking) => (
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
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                                    ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VenueDashboard;
