import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Loader2, Calendar, Clock, User, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/employee/today-summary`, {
                method: "GET",
                credentials: "include", // Important for cookies
            });

            if (!res.ok) {
                throw new Error("Failed to fetch dashboard data");
            }

            const data = await res.json();
            setStats(data);
        } catch (err) {
            console.error(err);
            toast.error("Could not load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();

        // Auto-refresh every minute to keep statuses up to date
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-green-600" />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
                <div className="text-center text-gray-500">
                    <p>Failed to load dashboard.</p>
                    <button onClick={fetchStats} className="mt-4 text-green-600 underline">Try Again</button>
                </div>
            </div>
        );
    }

    const { totalBookings, nextBooking, courtStatus } = stats;

    return (
        <div className="min-h-screen bg-gray-100 p-6 md:p-12">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
                    <p className="text-gray-600 mt-2">Welcome back, {user?.fullName}. Here is today's summary.</p>
                </header>

                {/* Master UI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* Card 1: Today's Total Bookings */}
                    <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-center justify-center border-l-4 border-green-500">
                        <h2 className="text-lg font-medium text-gray-500 mb-2 uppercase tracking-wide">Today's Bookings</h2>
                        <div className="text-6xl font-bold text-gray-900">{totalBookings}</div>
                        <p className="text-sm text-gray-400 mt-2">Confirmed bookings for {format(new Date(), "MMMM do")}</p>
                    </div>

                    {/* Card 2: Next Arrival */}
                    <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col justify-between border-l-4 border-blue-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Clock size={100} />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium text-gray-500 mb-4 uppercase tracking-wide">Next Arrival</h2>
                            {nextBooking ? (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <Clock className="text-blue-500" size={20} />
                                        <span className="text-2xl font-semibold text-gray-900">
                                            {format(new Date(nextBooking.time), "h:mm a")}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <User className="text-gray-400" size={20} />
                                        <span className="text-lg text-gray-700">{nextBooking.player}</span>
                                    </div>
                                    <div className="mt-4 inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                        {nextBooking.court}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 py-4">
                                    <p>No upcoming bookings.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card 3: Current Court Status */}
                    <div className="bg-white rounded-2xl shadow-sm p-8 border-l-4 border-purple-500">
                        <h2 className="text-lg font-medium text-gray-500 mb-6 uppercase tracking-wide">Current Court Status</h2>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                            {courtStatus.map((court) => (
                                <div key={court.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                    <span className="font-medium text-gray-700">{court.name}</span>
                                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold ${court.status === 'Free'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                        }`}>
                                        {court.status === 'Free' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                        <span>{court.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
