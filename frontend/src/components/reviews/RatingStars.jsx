import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({
    rating,
    onRatingChange,
    readonly = false,
    size = 'md',
    showValue = false
}) => {
    const [hoverRating, setHoverRating] = React.useState(0);

    const sizes = {
        sm: 16,
        md: 24,
        lg: 32,
    };

    const starSize = sizes[size] || sizes.md;
    const displayRating = hoverRating || rating;

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => !readonly && onRatingChange?.(star)}
                    onMouseEnter={() => !readonly && setHoverRating(star)}
                    onMouseLeave={() => !readonly && setHoverRating(0)}
                    className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
                >
                    <Star
                        size={starSize}
                        className={`${star <= displayRating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                    />
                </button>
            ))}
            {showValue && (
                <span className="ml-2 text-sm font-medium text-gray-600">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
};

export default RatingStars;
