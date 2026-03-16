import React, { useState } from 'react';
import toast from 'react-hot-toast';
import RatingStars from './RatingStars';
import { createReview, updateReview } from '../../services/reviewService';

const ReviewForm = ({
    targetType,
    targetId,
    existingReview = null,
    onSuccess
}) => {
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [title, setTitle] = useState(existingReview?.title || '');
    const [comment, setComment] = useState(existingReview?.comment || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setLoading(true);
        try {
            let result;
            if (existingReview?._id) {
                result = await updateReview(existingReview._id, {
                    rating,
                    title,
                    comment,
                });
            } else {
                result = await createReview({
                    targetType,
                    targetId,
                    rating,
                    title,
                    comment,
                });
            }

            if (result.success) {
                toast.success(existingReview ? 'Review updated!' : 'Review submitted!');
                onSuccess?.(result.review);
                // Reset form if new review
                if (!existingReview) {
                    setRating(0);
                    setTitle('');
                    setComment('');
                }
            } else {
                toast.error(result.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Review error:', error);
            toast.error('Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {existingReview ? 'Update Your Review' : 'Write a Review'}
            </h3>

            {/* Rating */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Rating *
                </label>
                <RatingStars
                    rating={rating}
                    onRatingChange={setRating}
                    size="lg"
                />
            </div>

            {/* Title */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (optional)
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Summarize your experience"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    maxLength={100}
                />
            </div>

            {/* Comment */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review *
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    rows={4}
                    maxLength={1000}
                    required
                />
                <p className="text-xs text-gray-400 mt-1">
                    {comment.length}/1000 characters
                </p>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={loading || rating === 0}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading
                    ? 'Submitting...'
                    : existingReview
                        ? 'Update Review'
                        : 'Submit Review'
                }
            </button>

            <p className="text-xs text-gray-400 mt-3 text-center">
                Your review will be visible after moderation
            </p>
        </form>
    );
};

export default ReviewForm;
