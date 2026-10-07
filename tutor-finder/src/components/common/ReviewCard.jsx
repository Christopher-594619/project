import React from 'react';
import RatingStars from './RatingStars';
import { formatDistanceToNow } from 'date-fns';

const API_URL = import.meta.env.VITE_ENDPOINT_URL;

// Build full image URL from backend value
const getImageUrl = (photo) => {
  if (!photo) return null;
  if (
    photo.startsWith('http://') ||
    photo.startsWith('https://') ||
    photo.startsWith('data:')
  ) {
    return photo;
  }
  return `${API_URL}${photo.startsWith('/') ? '' : '/'}${photo}`;
};

const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const ReviewCard = ({ review, className = '' }) => {
  const photoUrl = getImageUrl(review.studentProfilePic);
  const initials = getInitials(review.studentName);

  return (
    <div className={`bg-white rounded-xl p-4 border border-gray-100 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-primary-600 font-semibold flex-shrink-0 overflow-hidden">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={review.studentName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ display: photoUrl ? 'none' : 'flex' }}
          >
            {initials}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <p className="font-medium text-gray-900">{review.studentName}</p>
              <div className="flex items-center gap-2">
                <RatingStars rating={review.rating} size="sm" />
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(review.date), { addSuffix: true })}
                </span>
              </div>
            </div>
            {review.subject && (
              <span className="px-2 py-0.5 bg-primary-50 text-primary-600 text-xs rounded-full font-medium">
                {review.subject}
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm mt-2 leading-relaxed">
            {review.content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;