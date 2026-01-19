import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    PlusCircle,
    MapPin,
    Activity,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Bell,
    Users,
    TrendingUp,
    Search,
    Filter,
    BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    ComposedChart,
    AreaChart,
    Area
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border border-gray-100 shadow-2xl rounded-2xl max-w-xs animate-in zoom-in-95 duration-200">
                <p className="text-gray-900 font-black mb-3 text-sm uppercase tracking-wider">{label}</p>
                <div className="space-y-2">
                    {payload.map((entry, index) => (
                        entry.name !== 'Bookings' && (
                            <div key={index} className="flex justify-between items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                    <span className="text-xs font-bold text-gray-500">{entry.name}</span>
                                </div>
                                <span className="text-gray-900 text-xs font-black">LKR {Number(entry.value).toLocaleString()}</span>
                            </div>
                        )
                    ))}
                </div>

                {payload.find(p => p.name === 'Bookings') && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Volume</span>
                        <span className="text-sm font-black text-green-600">{payload.find(p => p.name === 'Bookings').value} Bookings</span>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

const VenueDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ total_bookings: 0, total_revenue: 0, active_venues: 0 });
    const [analytics, setAnalytics] = useState({ revenueByVenue: [], monthlyRevenue: [], peakHours: [] });
    const [bookings, setBookings] = useState([]);
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'history'
    const [reportFilters, setReportFilters] = useState({ interval: 'daily', venueId: '', startDate: '', endDate: '' });
    const [reportData, setReportData] = useState([]);
    const [bookingSearch, setBookingSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [peakTimeFilter, setPeakTimeFilter] = useState('weekday');

    // Modals
    const [unblockModal, setUnblockModal] = useState({ show: false, bookingId: null });
    const [cancelModal, setCancelModal] = useState({ show: false, bookingId: null });

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

        if (venues.length > 0) fetchReport();
    }, [user, reportFilters, venues]);

    const processChartData = (data, interval, startStr, endStr, allVenues) => {
        const pivotedMap = new Map();
        data.forEach(row => {
            if (!pivotedMap.has(row.label)) {
                pivotedMap.set(row.label, { label: row.label, booking_count: 0 });
            }
            const entry = pivotedMap.get(row.label);
            entry[row.venue_name] = Number(row.revenue);
            entry[`${row.venue_name}_online`] = Number(row.online_revenue || 0);
            entry[`${row.venue_name}_walkin`] = Number(row.walkin_revenue || 0);
            entry.booking_count += row.booking_count;
        });

        if (interval === 'weekly') return Array.from(pivotedMap.values());

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
            } else {
                start = new Date();
                start.setDate(now.getDate() - 30);
                end = new Date();
            }
        }
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        const current = new Date(start);
        const zeroFilledVenues = {};
        allVenues.forEach(v => {
            zeroFilledVenues[v.venue_name] = 0;
            zeroFilledVenues[`${v.venue_name}_online`] = 0;
            zeroFilledVenues[`${v.venue_name}_walkin`] = 0;
        });
        let safety = 0;
        while (current <= end && safety < 3000) {
            safety++;
            let label = "";
            if (interval === 'monthly') {
                label = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
            } else {
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                label = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')} (${days[current.getDay()]})`;
            }

            if (pivotedMap.has(label)) {
                filled.push({ ...zeroFilledVenues, ...pivotedMap.get(label) });
            } else {
                filled.push({ label, booking_count: 0, ...zeroFilledVenues });
            }

            if (interval === 'monthly') current.setMonth(current.getMonth() + 1);
            else current.setDate(current.getDate() + 1);
        }
        return filled;
    };

    const handleDateNavigation = (direction) => {
        let { startDate, endDate, interval } = reportFilters;
        let start = startDate ? new Date(startDate) : new Date();
        let end = endDate ? new Date(endDate) : new Date();

        if (!startDate || !endDate) {
            end = new Date();
            start = new Date();
            if (interval === 'daily') start.setDate(end.getDate() - 30);
            else if (interval === 'weekly') start.setDate(end.getDate() - 84);
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

    const processCancelBooking = async () => {
        const bookingId = cancelModal.bookingId;
        if (!bookingId) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}/cancel`, {
                method: "PATCH",
                credentials: "include"
            });

            if (res.ok) {
                toast.success("Booking cancelled successfully");
                setBookings(prev => prev.map(b => b.booking_id === bookingId ? { ...b, status: 'CANCELLED' } : b));
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome back, {user?.fullName || "Partner"}
                        </h1>
                        <p className="text-gray-600 mt-1 font-medium">
                            Manage your venues and track performance.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link to="/venue-calendar" className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-6 py-3 rounded-xl font-semibold flex items-center transition shadow-sm">
                            <Calendar size={18} className="mr-2 text-green-600" />
                            Calendar
                        </Link>
                        <Link to="/create-venue" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center transition shadow-md">
                            <PlusCircle size={18} className="mr-2" />
                            Add New Venue
                        </Link>
                    </div>
                </div>

                {/* Main Tabs */}
                <div className="flex border-b border-gray-200 mb-8 overflow-x-auto scrollbar-hide">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-8 py-4 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'overview'
                            ? 'border-green-600 text-green-600 bg-green-50/30'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-8 py-4 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'history'
                            ? 'border-green-600 text-green-600 bg-green-50/30'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Booking History
                    </button>
                </div>

                {activeTab === 'overview' ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Bookings</h3>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_bookings}</p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Revenue</h3>
                                <p className="text-3xl font-bold text-green-600 mt-2">
                                    LKR {stats.total_revenue ? Number(stats.total_revenue).toLocaleString() : '0'}
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                                <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Active Venues</h3>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.active_venues}</p>
                            </div>
                        </div>

                        {/* Visual Analytics */}
                        {analytics.revenueByVenue && analytics.revenueByVenue.length > 0 && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Revenue by Venue */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue by Venue</h2>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={analytics.revenueByVenue}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="venue_name" axisLine={false} tickLine={false} fontSize={11} fontWeight="bold" tick={{ fill: '#94a3b8' }} />
                                                <YAxis axisLine={false} tickLine={false} fontSize={11} fontWeight="bold" tick={{ fill: '#94a3b8' }} tickFormatter={(value) => `${value}`} />
                                                <RechartsTooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
                                                <Bar dataKey="value" fill="#16a34a" radius={[12, 12, 0, 0]} name="Revenue" barSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Peak Booking Times */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-lg font-bold text-gray-900">Peak Booking Times</h2>
                                        <div className="flex bg-gray-100 p-1 rounded-lg">
                                            <button
                                                onClick={() => setPeakTimeFilter('weekday')}
                                                className={`px-3 py-1 text-xs font-bold rounded-md transition ${peakTimeFilter === 'weekday' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                Weekday
                                            </button>
                                            <button
                                                onClick={() => setPeakTimeFilter('weekend')}
                                                className={`px-3 py-1 text-xs font-bold rounded-md transition ${peakTimeFilter === 'weekend' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                Weekend
                                            </button>
                                        </div>
                                    </div>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={(() => {
                                                const hours = Array.from({ length: 17 }, (_, i) => {
                                                    const h = i + 7;
                                                    const row = { hour: h };
                                                    venues.forEach(v => row[v.venue_name] = 0);
                                                    return row;
                                                });
                                                analytics.peakHours?.forEach(item => {
                                                    if (item.day_type === peakTimeFilter) {
                                                        const h = item.hour_of_day;
                                                        if (h >= 7 && h <= 23) {
                                                            const rowIndex = h - 7;
                                                            if (hours[rowIndex]) hours[rowIndex][item.venue_name] = item.booking_count;
                                                        }
                                                    }
                                                });
                                                return hours;
                                            })()}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis
                                                    dataKey="hour"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    fontSize={10}
                                                    fontWeight="bold"
                                                    tick={{ fill: '#94a3b8' }}
                                                    tickFormatter={(h) => {
                                                        const d = new Date(); d.setHours(h);
                                                        return d.toLocaleTimeString([], { hour: 'numeric', hour12: true });
                                                    }}
                                                />
                                                <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" tick={{ fill: '#94a3b8' }} />
                                                <RechartsTooltip content={<CustomTooltip />} />
                                                <Legend iconType="circle" />
                                                {venues.map((venue, index) => (
                                                    <Area
                                                        key={venue.venue_id}
                                                        type="monotone"
                                                        dataKey={venue.venue_name}
                                                        stroke={['#2563eb', '#16a34a', '#dc2626', '#d97706', '#9333ea'][index % 5]}
                                                        fillOpacity={0.1}
                                                        fill={['#2563eb', '#16a34a', '#dc2626', '#d97706', '#9333ea'][index % 5]}
                                                        strokeWidth={2}
                                                    />
                                                ))}
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Periodic Performance Report */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                                <h2 className="text-xl font-bold text-gray-900">Revenue Reports</h2>
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                        <button onClick={() => handleDateNavigation(-1)} className="p-1 hover:bg-white rounded-md transition shadow-sm">
                                            <ChevronLeft size={16} />
                                        </button>
                                        <button onClick={() => handleDateNavigation(1)} className="p-1 hover:bg-white rounded-md transition shadow-sm">
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                    <input
                                        type="date"
                                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-green-500 outline-none"
                                        value={reportFilters.startDate}
                                        onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value })}
                                    />
                                    <input
                                        type="date"
                                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-green-500 outline-none"
                                        value={reportFilters.endDate}
                                        onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value })}
                                    />
                                    <select
                                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-green-500 outline-none"
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
                                        {reportFilters.interval === 'monthly' ? (
                                            <LineChart data={reportData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="label" axisLine={false} tickLine={false} fontSize={11} fontWeight="bold" tick={{ fill: '#94a3b8' }} />
                                                <YAxis axisLine={false} tickLine={false} fontSize={11} fontWeight="bold" tick={{ fill: '#94a3b8' }} tickFormatter={(v) => `LKR ${v}`} />
                                                <RechartsTooltip content={<CustomTooltip />} />
                                                <Legend iconType="circle" />
                                                {venues.map((v, i) => (
                                                    <React.Fragment key={v.venue_id}>
                                                        <Line
                                                            type="monotone"
                                                            dataKey={`${v.venue_name}_online`}
                                                            stroke={['#2563eb', '#16a34a', '#dc2626'][i % 3]}
                                                            name={`${v.venue_name} (Online)`}
                                                            strokeWidth={3}
                                                            dot={{ r: 4 }}
                                                        />
                                                        <Line
                                                            type="monotone"
                                                            dataKey={`${v.venue_name}_walkin`}
                                                            stroke={['#60a5fa', '#34d399', '#f87171'][i % 3]}
                                                            name={`${v.venue_name} (Walk-in)`}
                                                            strokeWidth={2}
                                                            strokeDasharray="5 5"
                                                            dot={{ r: 3 }}
                                                        />
                                                    </React.Fragment>
                                                ))}
                                            </LineChart>
                                        ) : (
                                            <ComposedChart data={reportData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="label" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" tick={{ fill: '#94a3b8' }} />
                                                <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" tick={{ fill: '#94a3b8' }} allowDecimals={false} />
                                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" tick={{ fill: '#16a34a' }} tickFormatter={(v) => `LKR ${v}`} />
                                                <RechartsTooltip content={<CustomTooltip />} />
                                                <Legend iconType="circle" />
                                                {venues.map((v, i) => (
                                                    <React.Fragment key={v.venue_id}>
                                                        <Bar
                                                            yAxisId="right"
                                                            dataKey={`${v.venue_name}_online`}
                                                            fill={['#2563eb', '#16a34a', '#dc2626'][i % 3]}
                                                            stackId={v.venue_name}
                                                            name={`${v.venue_name} (Online)`}
                                                            barSize={30}
                                                        />
                                                        <Bar
                                                            yAxisId="right"
                                                            dataKey={`${v.venue_name}_walkin`}
                                                            fill={['#60a5fa', '#34d399', '#f87171'][i % 3]}
                                                            stackId={v.venue_name}
                                                            name={`${v.venue_name} (Walk-in)`}
                                                            barSize={30}
                                                            radius={[6, 6, 0, 0]}
                                                        />
                                                    </React.Fragment>
                                                ))}
                                                <Line yAxisId="left" type="monotone" dataKey="booking_count" stroke="#2c2c2cff" strokeWidth={1.0} name="Total Bookings" dot={{ fill: '#000000', r: 2 }} />
                                            </ComposedChart>
                                        )}
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
                                        <BarChart3 size={40} className="mb-2 opacity-20" />
                                        <p className="text-sm font-medium">No analytics data for this period</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Venue Portfolio */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">My Venues</h2>
                            {venues.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-xl">
                                    <p className="text-gray-500 mb-2">You haven't listed any venues yet.</p>
                                    <Link to="/create-venue" className="text-green-600 font-bold hover:underline">Create your first venue</Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {venues.map((venue) => (
                                        <Link to={`/venues/${venue.venue_id}`} key={venue.venue_id} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
                                            <div className="h-48 bg-gray-100 relative overflow-hidden">
                                                <img
                                                    src={venue.primary_image || 'https://via.placeholder.com/400x200?text=No+Image'}
                                                    alt={venue.venue_name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                                />
                                                <div className="absolute top-4 right-4">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${venue.is_active ? 'bg-green-500 text-white shadow-sm' : 'bg-red-500 text-white shadow-sm'}`}>
                                                        {venue.is_active ? 'Active' : 'Offline'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-5">
                                                <h3 className="font-bold text-gray-900 truncate text-lg group-hover:text-green-600 transition">{venue.venue_name}</h3>
                                                <div className="flex items-center text-gray-400 text-sm mt-1 mb-4">
                                                    <MapPin size={14} className="mr-1" />
                                                    <span className="truncate">{venue.city}</span>
                                                </div>
                                                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                                    <span className="text-xs font-bold text-gray-400 uppercase">Rate</span>
                                                    <span className="font-bold text-green-600">LKR {Number(venue.price_per_hour).toLocaleString()}/hr</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Booking History View */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Booking History</h2>
                                    <p className="text-gray-500 text-sm mt-1 font-medium">Detailed record of all venue activity</p>
                                </div>

                                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                                    <div className="relative flex-1 md:flex-none">
                                        <input
                                            type="text"
                                            placeholder="Search bookings..."
                                            value={bookingSearch}
                                            onChange={(e) => setBookingSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-green-500 outline-none transition-all"
                                        />
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    </div>
                                    <div className="relative flex items-center group">
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
                                        >
                                            <option value="all">All Statuses</option>
                                            <option value="CONFIRMED">Confirmed</option>
                                            <option value="CANCELLED">Cancelled</option>
                                            <option value="BLOCKED">Blocked</option>
                                        </select>
                                        <Filter className="absolute right-3 text-gray-400 pointer-events-none" size={14} />
                                    </div>
                                </div>
                            </div>

                            {bookings.length === 0 ? (
                                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                                    <Activity size={40} className="text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900">No activity found</h3>
                                    <p className="text-gray-500 text-sm mt-1">When bookings come in, they'll appear here.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto -mx-8">
                                    <table className="w-full text-left min-w-[900px]">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                                                <th className="px-8 pb-4">Venue & Sport</th>
                                                <th className="pb-4">Customer</th>
                                                <th className="pb-4">Date & Time</th>
                                                <th className="pb-4">Amount</th>
                                                <th className="pb-4">Status & Earnings</th>
                                                <th className="px-8 pb-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {bookings
                                                .filter(b => {
                                                    const text = `${b.venue_name} ${b.customer_name} ${b.customer_email} ${b.sport_name}`.toLowerCase();
                                                    const matchesSearch = text.includes(bookingSearch.toLowerCase());
                                                    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
                                                    return matchesSearch && matchesStatus;
                                                })
                                                .map((booking) => (
                                                    <tr key={booking.booking_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition duration-200 group">
                                                        <td className="px-8 py-5">
                                                            <div className="font-bold text-gray-900 text-base">{booking.venue_name}</div>
                                                            <div className="text-xs text-green-600 font-bold uppercase tracking-tight mt-0.5">{booking.sport_name || 'All Sports'}</div>
                                                        </td>
                                                        <td className="py-5">
                                                            {booking.status === 'BLOCKED' ? (
                                                                <div className="flex items-center text-gray-400 font-medium text-xs">
                                                                    Manual Time Block
                                                                </div>
                                                            ) : (
                                                                <div className="flex flex-col">
                                                                    <div className="font-bold text-gray-900">{booking.customer_name}</div>
                                                                    <div className="text-xs text-gray-400">{booking.customer_email}</div>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-5">
                                                            <div className="font-bold text-gray-700">{new Date(booking.booking_start).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                                            <div className="text-xs text-gray-400 mt-0.5">
                                                                {new Date(booking.booking_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                {booking.status === 'BLOCKED' && (
                                                                    <span> - {new Date(booking.booking_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-5">
                                                            {booking.status === 'BLOCKED' ? (
                                                                <span className="text-gray-300">—</span>
                                                            ) : (
                                                                <span className="font-bold text-gray-900">LKR {Number(booking.total_amount).toLocaleString()}</span>
                                                            )}
                                                        </td>
                                                        <td className="py-5">
                                                            <div className="flex flex-col gap-1.5">
                                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase w-fit
                                                                ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                                            booking.status === 'CANCELLED' ? 'bg-red-50 text-red-600' :
                                                                                booking.status === 'BLOCKED' ? 'bg-gray-800 text-white' :
                                                                                    'bg-gray-100 text-gray-600'}`}>
                                                                    {booking.status}
                                                                </span>
                                                                {booking.status === 'CANCELLED' && (
                                                                    <span className="text-[10px] text-gray-500 font-bold italic">
                                                                        Earned: LKR {booking.paid_amount ? (Number(booking.paid_amount) * 0.10).toLocaleString() : '0'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5 text-right">
                                                            {booking.status === 'BLOCKED' ? (
                                                                <button
                                                                    onClick={() => setUnblockModal({ show: true, bookingId: booking.booking_id })}
                                                                    className="px-4 py-1.5 bg-gray-900 text-white text-[10px] font-bold rounded-lg hover:bg-black transition"
                                                                >
                                                                    UNBLOCK
                                                                </button>
                                                            ) : (
                                                                booking.status !== 'CANCELLED' && (
                                                                    <button
                                                                        onClick={() => setCancelModal({ show: true, bookingId: booking.booking_id })}
                                                                        className="px-4 py-1.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg hover:bg-red-100 hover:text-red-700 transition border border-red-100"
                                                                    >
                                                                        CANCEL
                                                                    </button>
                                                                )
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Confirmation Modals */}
            {cancelModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Booking?</h3>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Are you sure you want to cancel this booking? The player will receive a 100% refund. This action cannot be undone.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setCancelModal({ show: false, bookingId: null })}
                                className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                            >
                                Back
                            </button>
                            <button
                                onClick={processCancelBooking}
                                className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition"
                            >
                                Yes, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {unblockModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Unblock Slot?</h3>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            This will make the time slot available for players to book again. Proceed?
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setUnblockModal({ show: false, bookingId: null })}
                                className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={processUnblock}
                                className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition"
                            >
                                Yes, Unblock
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VenueDashboard;
