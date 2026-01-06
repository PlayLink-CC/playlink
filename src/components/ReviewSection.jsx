import React, { useState, useEffect } from "react";
import { Star, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

const ReviewSection = ({ venueId, isOwner = false }) => {
    const { isAuthenticated } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Reply state
    const [replyText, setReplyText] = useState("");
    const [replyingTo, setReplyingTo] = useState(null); // Review ID being replied to

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
        fetchReviews();
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
                headers: { "Content-Type": "application/json" },
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
            fetchReviews(); // Refresh reviews
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitReply = async (reviewId) => {
        if (!replyText.trim()) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/venues/${venueId}/reviews/${reviewId}/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ reply: replyText })
            });

            if (!res.ok) throw new Error("Failed to post reply");

            toast.success("Reply posted");
            setReplyingTo(null);
            setReplyText("");
            fetchReviews();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-8">
            <h2 className="text-2xl font-bold mb-6">Reviews & Ratings</h2>

            {/* Reviews List */}
            <div className="space-y-6 mb-8">
                {loading ? (
                    <p className="text-gray-500">Loading reviews...</p>
                ) : reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.review_id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{review.first_name} {review.last_name}</p>
                                        <p className="text-xs text-gray-500">{formatDate(review.created_at)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center bg-green-50 px-2 py-1 rounded-lg">
                                    <Star size={16} className="text-yellow-400 fill-yellow-400 mr-1" />
                                    <span className="font-bold text-gray-700">{review.rating}.0</span>
                                </div>
                            </div>
                            <p className="text-gray-600 mt-2 leading-relaxed">{review.comment}</p>

                            {/* Owner Reply Display */}
                            {review.owner_reply && (
                                <div className="mt-4 ml-6 pl-4 border-l-2 border-green-200 bg-green-50 p-3 rounded-r-lg">
                                    <p className="text-sm font-semibold text-green-800 mb-1">Response from Venue:</p>
                                    <p className="text-sm text-gray-700">{review.owner_reply}</p>
                                </div>
                            )}

                            {/* Owner Reply Input */}
                            {isOwner && !review.owner_reply && (
                                <div className="mt-3 ml-6">
                                    {replyingTo === review.review_id ? (
                                        <div className="flex flex-col gap-2">
                                            <textarea
                                                className="w-full text-sm border rounded-lg p-2 focus:ring-green-500 focus:border-green-500"
                                                rows="2"
                                                placeholder="Write your reply..."
                                                value={replyText}
                                                onChange={e => setReplyText(e.target.value)}
                                            />
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => setReplyingTo(null)}
                                                    className="text-xs px-3 py-1 text-gray-600 hover:bg-gray-100 rounded"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleSubmitReply(review.review_id)}
                                                    className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                                >
                                                    Post Reply
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setReplyingTo(review.review_id);
                                                setReplyText("");
                                            }}
                                            className="text-sm text-green-600 font-medium hover:underline"
                                        >
                                            Reply to this review
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 italic">No reviews yet.</p>
                )}
            </div>

            {/* Add Review Form (Only for non-owners) */}
            {isAuthenticated && !isOwner && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="font-semibold text-lg mb-4">Write a Review</h3>
                    <form onSubmit={handleSubmitReview}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <Star
                                            size={28}
                                            className={`${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Experience</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your thoughts about this venue..."
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-3"
                                rows={3}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Submitting..." : "Submit Review"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ReviewSection;
