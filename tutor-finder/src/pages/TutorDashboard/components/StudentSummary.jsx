import React from 'react';
import { FaStar, FaRegStar, FaUser } from 'react-icons/fa';

const ReviewsSummary = ({ reviews }) => {
  // Mock data if no reviews provided
  const mockReviews = [
    { rating: 5, comment: 'Excellent tutor! Very knowledgeable and patient.', student: 'Sarah J.', date: '2 days ago' },
    { rating: 4, comment: 'Great session, explained concepts clearly.', student: 'Michael C.', date: '5 days ago' },
    { rating: 5, comment: 'Best tutor I\'ve ever had! Highly recommend.', student: 'Emma W.', date: '1 week ago' },
    { rating: 4, comment: 'Very helpful and prepared for each session.', student: 'David K.', date: '2 weeks ago' },
  ];

  const displayReviews = reviews || mockReviews;

  const averageRating = displayReviews.length > 0
    ? displayReviews.reduce((acc, r) => acc + r.rating, 0) / displayReviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
    const count = displayReviews.filter(r => Math.floor(r.rating) === star).length;
    const percentage = displayReviews.length > 0 ? (count / displayReviews.length) * 100 : 0;
    return { star, count, percentage };
  });

  return (
    <div className="space-y-4">
      {/* Rating Summary */}
      <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
          <div className="flex items-center gap-0.5 my-1">
            {[...Array(5)].map((_, i) => (
              i < Math.round(averageRating) ? (
                <FaStar key={i} className="w-4 h-4 text-yellow-400" />
              ) : (
                <FaRegStar key={i} className="w-4 h-4 text-gray-300" />
              )
            ))}
          </div>
          <div className="text-sm text-gray-500">{displayReviews.length} reviews</div>
        </div>

        <div className="flex-1 space-y-1">
          {ratingDistribution.map(({ star, percentage }) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-sm text-gray-600 w-6">{star}</span>
              <FaStar className="text-yellow-400 w-3 h-3" />
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 w-10">{percentage.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {displayReviews.map((review, index) => (
          <div key={index} className="p-3 bg-white rounded-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                  {review.student?.[0] || 'U'}
                </div>
                <span className="font-medium text-sm text-gray-900">{review.student || 'Student'}</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  i < review.rating ? (
                    <FaStar key={i} className="w-3 h-3 text-yellow-400" />
                  ) : (
                    <FaRegStar key={i} className="w-3 h-3 text-gray-300" />
                  )
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
            <p className="text-xs text-gray-400 mt-1">{review.date || 'Recently'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsSummary;