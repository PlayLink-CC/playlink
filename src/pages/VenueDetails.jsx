import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Clock, DollarSign, Shield, Activity, Calendar } from "lucide-react";
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
                navigate("/venues");
            } finally {
                setLoading(false);
            }
        };
        fetchVenue();
    }, [id, navigate]);

    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    if (!venue) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                                        onClick={() => toast.info("Edit feature coming soon!")}
                                    >
                                        Edit Venue Details
                                    </button>
                                    <button
                                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 border border-red-200"
                                        onClick={() => toast.info("Block feature implementation required in UI modal")}
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

                            <div className="mt-6 pt-6 border-t border-gray-100 text-sm text-gray-500">
                                <p className="flex items-center gap-2 mb-2">
                                    <Clock size={16} /> Instant Confirmation
                                </p>
                                <p className="flex items-center gap-2">
                                    <Shield size={16} /> Secure Payment
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VenueDetails;
