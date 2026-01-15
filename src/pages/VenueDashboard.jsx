import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border border-gray-100 shadow-lg rounded-lg max-w-xs">
                <p className="text-gray-900 font-bold mb-2">{label}</p>
                {payload.map((entry, index) => (
                    entry.name !== 'Bookings' && (
                        <div key={index} className="flex justify-between items-center gap-4 mb-1">
                            <span style={{ color: entry.color }} className="text-sm font-medium">{entry.name}:</span>
                            <span className="text-gray-700 text-sm">LKR {Number(entry.value).toLocaleString()}</span>
                        </div>
                    )
                ))}

                {/* Find bookings payload if it exists */}
                {payload.find(p => p.name === 'Bookings') && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-gray-500 text-xs">Total Bookings: {payload.find(p => p.name === 'Bookings').value}</p>
                    </div>
                )}
            </div>
        );
    }
    return null;
};
import { PlusCircle, MapPin, Activity, Calendar, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line, ComposedChart } from 'recharts';

const VenueDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ total_bookings: 0, total_revenue: 0, active_venues: 0 });
    const [analytics, setAnalytics] = useState({ revenueByVenue: [], monthlyRevenue: [] });
    const [bookings, setBookings] = useState([]);
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);

    const [reportFilters, setReportFilters] = useState({ interval: 'daily', venueId: '', startDate: '', endDate: '' });
    const [reportData, setReportData] = useState([]);

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

    useEffect(() => {
        const fetchReport = async () => {
            if (!user) return;
            try {
                const queryParams = new URLSearchParams({
                    interval: reportFilters.interval,
                    ...(reportFilters.venueId && { venueId: reportFilters.venueId }),
                    ...(reportFilters.startDate && { startDate: reportFilters.startDate }),
                    ...(reportFilters.endDate && { endDate: reportFilters.endDate })
                });

                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/analytics/owner/report?${queryParams}`, {
                    credentials: "include"
                });

                if (res.ok) {
                    let data = await res.json();
                    data = processChartData(data, reportFilters.interval, reportFilters.startDate, reportFilters.endDate, venues);
                    setReportData(data);
                }
            } catch (error) {
                console.error("Error fetching report", error);
            }
        };

        if (venues.length > 0) fetchReport(); // Only fetch when venues are loaded
    }, [user, reportFilters, venues]);

    const [unblockModal, setUnblockModal] = useState({ show: false, bookingId: null });
    const [peakTimeFilter, setPeakTimeFilter] = useState('weekday');

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

    const processChartData = (data, interval, startStr, endStr, allVenues) => {
        // 1. Pivot the data: Group by label -> { label, venue1: rev, venue2: rev... }
        const pivotedMap = new Map();

        data.forEach(row => {
            if (!pivotedMap.has(row.label)) {
                pivotedMap.set(row.label, { label: row.label, booking_count: 0 }); // Initialize
            }
            const entry = pivotedMap.get(row.label);
            entry[row.venue_name] = Number(row.revenue);
            entry.booking_count += row.booking_count; // Aggregate total bookings? Or keep per venue? Let's aggregate for the line.
        });

        // 2. Fill gaps in date range
        if (interval === 'weekly') {
            // Return pivoted data values sorted by label if manual weekly filling is too complex for now
            return Array.from(pivotedMap.values());
        }

        const filled = [];
        let start, end;
        const now = new Date();

        if (startStr && endStr) {
            start = new Date(startStr);
            end = new Date(endStr);
        } else {
            if (interval === 'monthly') {
                start = new Date(now.getFullYear(), 0, 1);
                end = new Date(now.getFullYear(), 11, 31);
            } else { // daily
                start = new Date();
                start.setDate(now.getDate() - 30);
                end = new Date();
            }
        }
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        const current = new Date(start);

        // Venues default object to zero-fill
        const zeroFilledVenues = {};
        allVenues.forEach(v => {
            zeroFilledVenues[v.venue_name] = 0;
        });

        let safety = 0;
        while (current <= end && safety < 3000) {
            safety++;
            let label = "";

            if (interval === 'monthly') {
                const y = current.getFullYear();
                const m = String(current.getMonth() + 1).padStart(2, '0');
                label = `${y}-${m}`;
            } else {
                const y = current.getFullYear();
                const m = String(current.getMonth() + 1).padStart(2, '0');
                const d = String(current.getDate()).padStart(2, '0');
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const dayName = days[current.getDay()];
                label = `${y}-${m}-${d} (${dayName})`;
            }

            if (pivotedMap.has(label)) {
                // Merge existing data with zero-defaults to ensure all venues exist
                filled.push({ ...zeroFilledVenues, ...pivotedMap.get(label) });
            } else {
                filled.push({
                    label: label,
                    booking_count: 0,
                    ...zeroFilledVenues
                });
            }

            // Increment
            if (interval === 'monthly') {
                current.setMonth(current.getMonth() + 1);
            } else {
                current.setDate(current.getDate() + 1);
            }
        }
        return filled;
    };

    const handleDateNavigation = (direction) => {
        let { startDate, endDate, interval } = reportFilters;
        let start = startDate ? new Date(startDate) : new Date();
        let end = endDate ? new Date(endDate) : new Date();

        if (!startDate || !endDate) {
            // Initialize defaults if not set
            end = new Date();
            start = new Date();
            if (interval === 'daily') start.setDate(end.getDate() - 30);
            else if (interval === 'weekly') start.setDate(end.getDate() - 84); // 12 weeks
            else start.setFullYear(end.getFullYear() - 1);
        }

        const diffTime = end.getTime() - start.getTime();

        if (direction === -1) {
            start = new Date(start.getTime() - diffTime);
            end = new Date(end.getTime() - diffTime);
        } else {
            start = new Date(start.getTime() + diffTime);
            end = new Date(end.getTime() + diffTime);
        }

        setReportFilters({
            ...reportFilters,
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0]
        });
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
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-gray-900">Peak Booking Times (Last 30 Days)</h2>
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setPeakTimeFilter('weekday')}
                                        className={`px-3 py-1 text-sm font-medium rounded-md transition ${peakTimeFilter === 'weekday' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Weekday
                                    </button>
                                    <button
                                        onClick={() => setPeakTimeFilter('weekend')}
                                        className={`px-3 py-1 text-sm font-medium rounded-md transition ${peakTimeFilter === 'weekend' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Weekend
                                    </button>
                                </div>
                            </div>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={(() => {
                                        // 1. Pivot data: { hour: 7, VenueA: 5, VenueB: 2, ... }
                                        // Restrict to hours 7 to 23
                                        const hours = Array.from({ length: 17 }, (_, i) => {
                                            const h = i + 7;
                                            const row = { hour: h };
                                            // Init venues with 0
                                            venues.forEach(v => row[v.venue_name] = 0);
                                            return row;
                                        });

                                        analytics.peakHours?.forEach(item => {
                                            // Filter by selected day type
                                            if (item.day_type === peakTimeFilter) {
                                                const h = item.hour_of_day;
                                                if (h >= 7 && h <= 23) {
                                                    const rowIndex = h - 7;
                                                    if (hours[rowIndex]) {
                                                        // Aggregate because multiple rows might exist due to day_type group if we didn't filter? 
                                                        // Actually sql groups by day_type too so we get unique rows per (hour, venue, day_type)
                                                        hours[rowIndex][item.venue_name] = item.booking_count;
                                                    }
                                                }
                                            }
                                        });
                                        return hours;
                                    })()}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="hour"
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(h) => {
                                                const d = new Date();
                                                d.setHours(h);
                                                return d.toLocaleTimeString([], { hour: 'numeric', hour12: true });
                                            }}
                                        />
                                        <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                                        <RechartsTooltip
                                            cursor={{ fill: '#f3f4f6' }}
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    const h = payload[0].payload.hour;
                                                    const d = new Date(); d.setHours(h);
                                                    const timeStr = d.toLocaleTimeString([], { hour: 'numeric', hour12: true });
                                                    return (
                                                        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg max-w-xs">
                                                            <span className="font-bold text-gray-900 block mb-2">{timeStr}</span>
                                                            {payload.map((entry, index) => (
                                                                <div key={index} className="flex justify-between items-center gap-4 mb-1">
                                                                    <span style={{ color: entry.color }} className="text-sm font-medium">{entry.name}:</span>
                                                                    <span className="text-gray-700 text-sm font-bold">{entry.value}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Legend />
                                        {venues.map((venue, index) => (
                                            <Bar
                                                key={venue.venue_id}
                                                dataKey={venue.venue_name}
                                                fill={['#2563eb', '#16a34a', '#dc2626', '#d97706', '#9333ea'][index % 5]}
                                                radius={[4, 4, 0, 0]}
                                                name={venue.venue_name}
                                            // stackId="a" // Uncomment if you want them stacked
                                            />
                                        ))}
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* Detailed Revenue Report */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <h2 className="text-xl font-bold text-gray-900">Revenue Reports</h2>
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Navigation */}
                            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                <button onClick={() => handleDateNavigation(-1)} className="p-1 hover:bg-white rounded-md transition shadow-sm">
                                    <ChevronLeft size={18} className="text-gray-600" />
                                </button>
                                <button onClick={() => handleDateNavigation(1)} className="p-1 hover:bg-white rounded-md transition shadow-sm">
                                    <ChevronRight size={18} className="text-gray-600" />
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">From:</span>
                                <input
                                    type="date"
                                    className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                                    value={reportFilters.startDate}
                                    onChange={(e) => {
                                        const newStart = e.target.value;
                                        const newEnd = reportFilters.endDate;
                                        let newInterval = reportFilters.interval;

                                        if (newStart && newEnd) {
                                            const diffTime = Math.abs(new Date(newEnd) - new Date(newStart));
                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                            if (diffDays <= 30) {
                                                newInterval = 'daily';
                                            }
                                        }
                                        setReportFilters({ ...reportFilters, startDate: newStart, interval: newInterval });
                                    }}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">To:</span>
                                <input
                                    type="date"
                                    className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                                    value={reportFilters.endDate}
                                    onChange={(e) => {
                                        const newStart = reportFilters.startDate;
                                        const newEnd = e.target.value;
                                        let newInterval = reportFilters.interval;

                                        if (newStart && newEnd) {
                                            const diffTime = Math.abs(new Date(newEnd) - new Date(newStart));
                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                            if (diffDays <= 30) {
                                                newInterval = 'daily';
                                            }
                                        }
                                        setReportFilters({ ...reportFilters, endDate: newEnd, interval: newInterval });
                                    }}
                                />
                            </div>
                            <div className="w-px h-8 bg-gray-300 mx-2 hidden md:block"></div>
                            <select
                                className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                                value={reportFilters.venueId}
                                onChange={(e) => setReportFilters({ ...reportFilters, venueId: e.target.value })}
                            >
                                <option value="">All Venues</option>
                                {venues.map(v => (
                                    <option key={v.venue_id} value={v.venue_id}>{v.venue_name}</option>
                                ))}
                            </select>
                            <select
                                className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                                value={reportFilters.interval}
                                onChange={(e) => setReportFilters({ ...reportFilters, interval: e.target.value })}
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                    </div>

                    <div className="h-96 w-full">
                        {reportData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                {(() => {
                                    // Colors for venues
                                    const colors = ['#2563eb', '#16a34a', '#dc2626', '#d97706', '#9333ea', '#0891b2', '#be185d'];

                                    // Logic to determine which venues to show
                                    const visibleVenues = reportFilters.venueId
                                        ? venues.filter(v => v.venue_id === Number(reportFilters.venueId))
                                        : venues;

                                    if (reportFilters.interval === 'monthly') {
                                        return (
                                            <LineChart data={reportData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis
                                                    dataKey="label"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tickFormatter={(val) => {
                                                        if (!val) return "";
                                                        const [y, m] = val.split('-');
                                                        const date = new Date(Number(y), Number(m) - 1);
                                                        return date.toLocaleDateString('en-US', { month: 'short' });
                                                    }}
                                                />
                                                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `LKR ${value}`} />
                                                <RechartsTooltip content={<CustomTooltip />} />
                                                <Legend />
                                                {visibleVenues.map((venue, index) => (
                                                    <Line
                                                        key={venue.venue_id}
                                                        type="monotone"
                                                        dataKey={venue.venue_name}
                                                        stroke={colors[index % colors.length]}
                                                        strokeWidth={3}
                                                        dot={{ r: 4 }}
                                                        activeDot={{ r: 8 }}
                                                    />
                                                ))}
                                            </LineChart>
                                        );
                                    } else {
                                        return (
                                            <ComposedChart data={reportData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis
                                                    dataKey="label"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    scale="point"
                                                    padding={{ left: 10, right: 10 }}
                                                    tickFormatter={(val) => {
                                                        if (!val) return "";
                                                        if (val.includes('(')) {
                                                            const parts = val.split(' ');
                                                            const datePart = parts[0];
                                                            const dayName = parts[1].replace(/[()]/g, '');
                                                            const [, , d] = datePart.split('-');
                                                            return `${dayName} ${d}`;
                                                        }
                                                        return val;
                                                    }}
                                                />
                                                <YAxis yAxisId="left" orientation="left" stroke="#374151" allowDecimals={false} />
                                                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `LKR ${value}`} stroke="#16a34a" />
                                                <RechartsTooltip content={<CustomTooltip />} />
                                                <Legend />
                                                {visibleVenues.map((venue, index) => (
                                                    <Bar
                                                        key={venue.venue_id}
                                                        yAxisId="right"
                                                        dataKey={venue.venue_name}
                                                        fill={colors[index % colors.length]}
                                                        radius={[4, 4, 0, 0]}
                                                        name={venue.venue_name}
                                                        // Convert stackId to string or remove if you don't want stacked
                                                        stackId="a"
                                                        barSize={20}
                                                    />
                                                ))}
                                                <Line yAxisId="left" type="monotone" dataKey="booking_count" stroke="#1f2937" strokeWidth={2} dot={{ r: 4 }} name="Bookings" />
                                            </ComposedChart>
                                        );
                                    }
                                })()}
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                                No revenue data for this period
                            </div>
                        )}
                    </div>
                </div>

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
                                                <th className="pb-3 font-medium">Sport</th>
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
                                                            <span className="font-medium">{booking.sport_name}</span>
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
                                                <th className="pb-3 font-medium">Sport</th>
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
                                                            <span className="font-medium">{booking.sport_name || 'All Sports (Venue)'}</span>
                                                        </td>
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
