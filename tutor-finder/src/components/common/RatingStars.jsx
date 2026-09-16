import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const RatingStars = ({ rating, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  const starSize = sizes[size] || sizes.md;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex items-center ${className}`}>
      {[...Array(fullStars)].map((_, i) => (
        <FaStar key={`full-${i}`} className={`${starSize} text-yellow-400 fill-current`} />
      ))}
      {hasHalfStar && (
        <FaStarHalfAlt className={`${starSize} text-yellow-400 fill-current`} />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <FaRegStar key={`empty-${i}`} className={`${starSize} text-gray-300 fill-current`} />
      ))}
    </div>
  );
};

export default RatingStars;