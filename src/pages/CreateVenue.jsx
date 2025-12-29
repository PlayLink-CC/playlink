
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

const SPORTS = [
    { id: 1, name: "Football" },
    { id: 2, name: "Futsal" },
    { id: 3, name: "Basketball" },
    { id: 4, name: "Tennis" },
    { id: 5, name: "Badminton" },
];

const AMENITIES = [
    { id: 1, name: "Changing Room" },
    { id: 2, name: "Shower" },
    { id: 3, name: "Parking" },
    { id: 4, name: "Floodlights" },
    { id: 5, name: "Scoreboard" },
];

const POLICIES = [
    { id: 1, name: "Standard (Refund 90% within 5 hours)" },
    { id: 2, name: "Strict (Refund 80% within 24 hours)" },
    { id: 3, name: "Flexible (Refund 90% within 6 hours)" },
];

const CreateVenue = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        address: "",
        city: "",
        pricePerHour: "",
        cancellationPolicyId: 1,
        sportIds: [],
        amenityIds: [],
        imageUrls: [""],
    });

    useEffect(() => {
        if (!isAuthenticated) {
            toast.error("You must be logged in to create a venue");
            navigate("/login"); // fallback provided MainLayout doesn't catch it
            return;
        }
        if (user && user.accountType !== "VENUE_OWNER") {
            toast.error("Access denied. Venue Owners only.");
            navigate("/");
        }
    }, [user, isAuthenticated, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e, type) => {
        const { value, checked } = e.target;
        const id = parseInt(value);
        setFormData((prev) => {
            const list = prev[type];
            if (checked) {
                return { ...prev, [type]: [...list, id] };
            } else {
                return { ...prev, [type]: list.filter((item) => item !== id) };
            }
        });
    };

    const handleImageChange = (index, value) => {
        const newImages = [...formData.imageUrls];
        newImages[index] = value;
        setFormData((prev) => ({ ...prev, imageUrls: newImages }));
    };

    const addImageField = () => {
        if (formData.imageUrls.length < 5) {
            setFormData((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, ""] }));
        } else {
            toast.info("Maximum 5 images allowed");
        }
    };

    const removeImageField = (index) => {
        const newImages = formData.imageUrls.filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, imageUrls: newImages }));
    };

    const validateStep = () => {
        if (step === 1) {
            if (!formData.name || !formData.address || !formData.city) {
                toast.error("Please fill in all required fields");
                return false;
            }
        } else if (step === 2) {
            if (!formData.pricePerHour || isNaN(formData.pricePerHour)) {
                toast.error("Please enter a valid price");
                return false;
            }
        } else if (step === 3) {
            if (formData.sportIds.length === 0) {
                toast.error("Please select at least one sport");
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep()) {
            setStep((prev) => prev + 1);
        }
    };

    const handlePrev = () => {
        setStep((prev) => prev - 1);
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            // Filter out empty image URLs
            const cleanImages = formData.imageUrls.filter((url) => url.trim() !== "");

            const payload = {
                ...formData,
                pricePerHour: parseFloat(formData.pricePerHour),
                cancellationPolicyId: parseInt(formData.cancellationPolicyId),
                imageUrls: cleanImages
            };

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/venues`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Failed to create venue");
            }

            toast.success("Venue created successfully!");
            navigate("/venues");
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderProgress = () => {
        return (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                <div
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${(step / 4) * 100}%` }}
                ></div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden p-8">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">List Your Venue</h2>
                <p className="text-gray-600 mb-8">Share your space with sports enthusiasts</p>

                {renderProgress()}

                <div className="mb-8">
                    {step === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-xl font-semibold text-gray-800">Basic Information</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Venue Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    placeholder="e.g. City Sports Complex"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    placeholder="Tell us about your venue..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        placeholder="Street Address"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        placeholder="City"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-xl font-semibold text-gray-800">Pricing & Policies</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price per Hour (LKR)</label>
                                <input
                                    type="number"
                                    name="pricePerHour"
                                    value={formData.pricePerHour}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    placeholder="2500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cancellation Policy</label>
                                <select
                                    name="cancellationPolicyId"
                                    value={formData.cancellationPolicyId}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                >
                                    {POLICIES.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-xl font-semibold text-gray-800">Facilities</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Available Sports</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {SPORTS.map(sport => (
                                        <label key={sport.id} className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                value={sport.id}
                                                checked={formData.sportIds.includes(sport.id)}
                                                onChange={(e) => handleCheckboxChange(e, 'sportIds')}
                                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                            />
                                            <span className="text-gray-700">{sport.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {AMENITIES.map(amenity => (
                                        <label key={amenity.id} className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                value={amenity.id}
                                                checked={formData.amenityIds.includes(amenity.id)}
                                                onChange={(e) => handleCheckboxChange(e, 'amenityIds')}
                                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                            />
                                            <span className="text-gray-700">{amenity.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-xl font-semibold text-gray-800">Images</h3>
                            <p className="text-sm text-gray-500">Add URLs for your venue images. The first one will be the cover image.</p>

                            {formData.imageUrls.map((url, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={url}
                                        onChange={(e) => handleImageChange(index, e.target.value)}
                                        className="flex-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    {formData.imageUrls.length > 1 && (
                                        <button
                                            onClick={() => removeImageField(index)}
                                            className="text-red-500 hover:text-red-700 px-2"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}

                            {formData.imageUrls.length < 5 && (
                                <button
                                    onClick={addImageField}
                                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                                >
                                    + Add another image URL
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-between mt-8">
                    {step > 1 ? (
                        <button
                            onClick={handlePrev}
                            className="px-6 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Back
                        </button>
                    ) : (
                        <div></div> // Spacer
                    )}

                    {step < 4 ? (
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 shadow-sm"
                        >
                            Continue
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white shadow-sm ${isSubmitting ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                                }`}
                        >
                            {isSubmitting ? "Listing Venue..." : "List Venue"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateVenue;
