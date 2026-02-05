import React, { useState, useEffect } from "react";
import { Star, User, MessageSquare, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

const VenueReviewSection = ({ venueId, averageRating }) => {
    const { isAuthenticated, user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const isPlayer = isAuthenticated && user?.accountType === "PLAYER";

    const fetchReviews = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/venues/${venueId}/reviews`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (venueId) {
            fetchReviews();
        }
    }, [venueId]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/venues/${venueId}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                credentials: "include",
                body: JSON.stringify({ rating, comment })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to submit review");
            }

            toast.success("Review submitted successfully");
            setRating(0);
            setComment("");
            fetchReviews(); // Refresh review list
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6 mb-8">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageSquare className="text-green-600" size={20} />
                    <h2 className="text-xl font-bold text-gray-900">Venue Reviews</h2>
                </div>
                <div className="flex items-center bg-green-50 px-3 py-1 rounded-full">
                    <Star size={18} className="text-yellow-400 fill-yellow-400 mr-1.5" />
                    <span className="font-bold text-green-700 text-lg">{Number(averageRating || 0).toFixed(1)}</span>
                </div>
            </div>

            <div className="p-6">
                {/* Review Form (Players Only) */}
                {isPlayer ? (
                    <div className="bg-gray-50 rounded-xl p-5 mb-10 border border-gray-100 shadow-inner">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span>Leave a Review</span>
                            <span className="text-xs font-normal text-gray-400">(Only after your first booking)</span>
                        </h3>
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Select Rating</label>
                                <div className="flex gap-1.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none transition-transform active:scale-90"
                                        >
                                            <Star
                                                size={32}
                                                className={`transition-colors duration-200 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Write your comment</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Tell others about your experience at this venue..."
                                    className="w-full rounded-lg border-gray-200 bg-white shadow-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 p-3 min-h-[100px] text-gray-600 transition"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {submitting ? "Posting..." : "Post Review"}
                            </button>
                        </form>
                    </div>
                ) : (
                    !isAuthenticated && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-8 flex items-center gap-3">
                            <AlertCircle className="text-amber-500" size={20} />
                            <p className="text-sm text-amber-700">Please log in as a Player to leave a review.</p>
                        </div>
                    )
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide border-b border-gray-50 pb-2">Recent Comments</h3>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        </div>
                    ) : reviews.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {reviews.map((review) => (
                                <div key={review.review_id} className="py-5 first:pt-0 last:pb-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 ring-4 ring-green-50">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{review.full_name}</p>
                                                <p className="text-xs text-gray-400 font-medium">{formatDate(review.created_at)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                            <Star size={14} className="text-yellow-400 fill-yellow-400 mr-1" />
                                            <span className="font-bold text-gray-700 text-sm">{review.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed pl-[52px]">
                                        {review.comment || <span className="italic text-gray-300">No comment provided.</span>}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-400 italic">No reviews yet for this venue.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VenueReviewSection;
