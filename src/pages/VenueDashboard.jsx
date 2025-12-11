import React from "react";
import { Link } from "react-router-dom";
import { PlusCircle, MapPin, Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const VenueDashboard = () => {
    const { user } = useAuth();

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
                    <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center transition shadow-md">
                        <PlusCircle size={20} className="mr-2" />
                        Add New Venue
                    </button>
                </div>

                {/* Stats Placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-medium uppercase">Total Bookings</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-medium uppercase">Total Revenue</h3>
                        <p className="text-3xl font-bold text-green-600 mt-2">LKR 0.00</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-medium uppercase">Active Venues</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                    </div>
                </div>

                {/* Empty State for Venues */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MapPin size={32} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No properties listed yet</h2>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                        Get started by adding your first sports venue. It only takes a few minutes to publish your listing.
                    </p>
                    <button className="text-green-600 font-semibold hover:text-green-700 transition">
                        Create your first listing &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VenueDashboard;
