import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Activity, Shield } from "lucide-react";
import TimeInput from "../components/TimeInput";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const VenueDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [venue, setVenue] = useState(null);
    const [loading, setLoading] = useState(true);

    const isOwner = isAuthenticated && user?.accountType === "VENUE_OWNER" && venue?.owner_id === user?.id;

    useEffect(() => {
        const fetchVenue = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/venues/${id}`);
                if (!res.ok) throw new Error("Venue not found");
                const data = await res.json();
                setVenue(data);
            } catch (error) {
                console.error("Error fetching venue:", error);
                toast.error("Could not load venue details");
                // navigate("/venues"); // Don't navigate away, let the UI handle the error state
            } finally {
                setLoading(false);
            }
        };
        fetchVenue();
    }, [id]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [blockForm, setBlockForm] = useState({ date: "", startTime: "", duration: "1" });

    const handleEditClick = () => {
        setEditForm({
            name: venue.venue_name,
            description: venue.description,
            pricePerHour: venue.price_per_hour,
            address: venue.address,
            city: venue.city
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/venues/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(editForm)
            });
            if (!res.ok) throw new Error("Failed to update venue");

            toast.success("Venue updated successfully");
            setShowEditModal(false);

            // Update local state with the form data (optimistic update or using form values)
            // Ideally we'd map casing back: pricePerHour -> price_per_hour
            setVenue(prev => ({
                ...prev,
                venue_name: editForm.name,
                description: editForm.description,
                price_per_hour: editForm.pricePerHour,
                address: editForm.address,
                city: editForm.city
            }));

        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleBlockSubmit = async (e) => {
        e.preventDefault();
        try {
            // Calculate end time based on duration
            const [sh, sm] = blockForm.startTime.split(':').map(Number);
            const startTotalMinutes = sh * 60 + sm;
            const endTotalMinutes = startTotalMinutes + (Number(blockForm.duration) * 60);

            const eh = Math.floor(endTotalMinutes / 60);
            const em = endTotalMinutes % 60;
            const endTime = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/venues/${id}/block`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    date: blockForm.date,
                    startTime: blockForm.startTime,
                    endTime: endTime,
                    reason: "Manual block by owner"
                })
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to block slot");
            }
            toast.success("Slot blocked successfully. Refreshing...");

            // Wait a moment then reload to show updated schedule
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error) {
            toast.error(error.message);
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

    if (!venue) return (
        <div className="flex flex-col justify-center items-center min-h-screen text-center p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Venue Not Found</h2>
            <p className="text-gray-600 mb-4">The venue you are looking for does not exist or has been removed.</p>
            <button
                onClick={() => navigate("/venue-dashboard")}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
                Back to Dashboard
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {isOwner && (
                    <button
                        onClick={() => navigate("/venue-dashboard")}
                        className="mb-6 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 font-medium shadow-sm"
                    >
                        ← Back to Dashboard
                    </button>
                )}
                {/* Hero Section */}
                <div className="relative h-96 rounded-2xl overflow-hidden mb-8 shadow-xl">
                    <img
                        src={venue.primary_image || "https://via.placeholder.com/1200x400?text=No+Image"}
                        alt={venue.venue_name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                        <div className="p-8 text-white">
                            <h1 className="text-4xl font-bold mb-2">{venue.venue_name}</h1>
                            <div className="flex items-center gap-4 text-lg">
                                <span className="flex items-center gap-1"><MapPin size={20} /> {venue.location}</span>
                                <span className="bg-green-600 px-3 py-1 rounded-full text-sm font-semibold">
                                    LKR {Number(venue.price_per_hour).toLocaleString()}/hr
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold mb-4">About this venue</h2>
                            <p className="text-gray-600 leading-relaxed">{venue.description}</p>
                        </div>

                        {/* Facilities */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold mb-4">Facilities</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Activity className="text-green-600" /> Sports
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {venue.court_types?.split(", ").map((sport, i) => (
                                            <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                                                {sport}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Shield className="text-green-600" /> Amenities
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {venue.amenities?.split(", ").map((amenity, i) => (
                                            <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                                                {amenity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Action Card */}
                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 sticky top-24">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <p className="text-sm text-gray-500">Price per hour</p>
                                    <p className="text-3xl font-bold text-gray-900">LKR {Number(venue.price_per_hour).toLocaleString()}</p>
                                </div>
                            </div>

                            {isOwner ? (
                                <div className="space-y-3">
                                    <button
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                                        onClick={handleEditClick}
                                    >
                                        Edit Venue Details
                                    </button>
                                    <button
                                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 border border-red-200"
                                        onClick={() => setShowBlockModal(true)}
                                    >
                                        Block Time Slots
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
                                    onClick={() => navigate(`/create-booking`, { state: { venueId: venue.venue_id, venueName: venue.venue_name, price: venue.price_per_hour } })}
                                >
                                    Book Now
                                </button>
                            )}

                            {/* ... (Security badges) ... */}
                        </div>
                    </div>
                </div>

                {/* Edit Modal */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">Edit Venue</h2>
                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Venue Name</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        rows={3}
                                        value={editForm.description}
                                        onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Price per Hour</label>
                                    <input
                                        type="number"
                                        value={editForm.pricePerHour}
                                        onChange={e => setEditForm({ ...editForm, pricePerHour: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Address</label>
                                        <input
                                            type="text"
                                            value={editForm.address}
                                            onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">City</label>
                                        <input
                                            type="text"
                                            value={editForm.city}
                                            onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Block Modal */}
                {showBlockModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl w-full max-w-md p-6">
                            <h2 className="text-xl font-bold mb-4 text-red-600">Block Time Slot</h2>
                            <p className="text-sm text-gray-500 mb-4">Prevent bookings for a specific period.</p>
                            <form onSubmit={handleBlockSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={blockForm.date}
                                        onChange={e => setBlockForm({ ...blockForm, date: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 border p-2"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                        <TimeInput
                                            value={blockForm.startTime}
                                            onChange={val => setBlockForm({ ...blockForm, startTime: val })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Hours)</label>
                                        <select
                                            value={blockForm.duration}
                                            onChange={e => setBlockForm({ ...blockForm, duration: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 border p-2 h-[42px]"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                                                <option key={h} value={h}>{h} Hour{h > 1 ? 's' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowBlockModal(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                                    >
                                        Confirm Block
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VenueDetails;
