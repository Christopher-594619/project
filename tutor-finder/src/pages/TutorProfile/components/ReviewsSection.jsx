import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import ReviewCard from '../../../components/common/ReviewCard';
import RatingStars from '../../../components/common/RatingStars';
import EmptyState from '../../../components/common/EmptyState';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { reviewService } from '../../../services/reviewService';
import toast from 'react-hot-toast';

const ReviewsSection = ({ reviews, tutorId, onReviewAdded }) => {
  const { user } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => Math.floor(r.rating) === star).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { star, count, percentage };
  });

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Please login to leave a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    setSubmitting(true);
    try {
      await reviewService.addReview({
        tutorId,
        studentId: user.id,
        studentName: user.name,
        rating,
        comment,
        date: new Date().toISOString(),
      });
      toast.success('Review submitted successfully!');
      setRating(0);
      setComment('');
      setShowReviewForm(false);
      onReviewAdded();
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Reviews ({reviews.length})
        </h2>
        {user && !reviews.some(r => r.studentId === user.id) && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
          >
            {showReviewForm ? 'Cancel' : 'Write a Review'}
          </button>
        )}
      </div>

      {/* Rating Summary */}
      {reviews.length > 0 && (
        <div className="flex flex-col md:flex-row gap-8 mb-8 p-4 bg-gray-50 rounded-xl">
          <div className="text-center md:text-left">
            <div className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
            <RatingStars rating={averageRating} size="lg" className="justify-center md:justify-start my-2" />
            <div className="text-sm text-gray-500">{reviews.length} reviews</div>
          </div>
          <div className="flex-1 space-y-1.5">
            {ratingDistribution.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-8">{star}</span>
                <FaStar className="text-yellow-400 w-3 h-3" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-500 w-12">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-8 p-4 border border-gray-200 rounded-xl bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-3">Write a Review</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="text-2xl transition-colors"
                  >
                    {star <= (hoverRating || rating) ? (
                      <FaStar className="text-yellow-400" />
                    ) : (
                      <FaRegStar className="text-gray-300 hover:text-yellow-400 transition-colors" />
                    )}
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-500">
                  {rating > 0 ? `${rating} stars` : 'Select rating'}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Share your experience with this tutor..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="btn-primary px-6 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                onClick={() => setShowReviewForm(false)}
                className="btn-secondary px-6 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="💬"
          title="No reviews yet"
          description="Be the first to review this tutor and help others make an informed decision."
        />
      )}
    </div>
  );
};

export default ReviewsSection;