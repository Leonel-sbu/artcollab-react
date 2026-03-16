import React from 'react';
import { format } from 'date-fns';
import { ThumbsUp, CheckCircle } from 'lucide-react';
import RatingStars from './RatingStars';

const ReviewCard = ({ review, onMarkHelpful }) => {
    const formatDate = (date) => {
        if (!date) return '';
        return format(new Date(date), 'MMM d, yyyy');
    };

    return (
        <div className="border-b border-gray-100 py-6">
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-600 font-medium">
                        {review.user?.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                </div>

                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900">
                            {review.user?.name || 'Anonymous'}
                        </span>

                        {review.isVerifiedPurchase && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                <CheckCircle size={12} />
                                Verified Purchase
                            </span>
                        )}
                    </div>

                    {/* Rating and date */}
                    <div className="flex items-center gap-3 mt-1">
                        <RatingStars rating={review.rating} readonly size="sm" />
                        <span className="text-sm text-gray-400">
                            {formatDate(review.createdAt)}
                        </span>
                    </div>

                    {/* Title */}
                    {review.title && (
                        <h4 className="font-medium text-gray-900 mt-2">
                            {review.title}
                        </h4>
                    )}

                    {/* Comment */}
                    <p className="text-gray-600 mt-2 whitespace-pre-wrap">
                        {review.comment}
                    </p>

                    {/* Seller/Instructor Reply */}
                    {review.sellerReply && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700">Seller Response:</p>
                            <p className="text-sm text-gray-600 mt-1">{review.sellerReply.text}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {formatDate(review.sellerReply.repliedAt)}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-4">
                        <button
                            onClick={() => onMarkHelpful?.(review._id)}
                            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600"
                        >
                            <ThumbsUp size={16} />
                            Helpful ({review.helpful || 0})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewCard;
