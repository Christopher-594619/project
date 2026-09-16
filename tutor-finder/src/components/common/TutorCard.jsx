// src/components/common/TutorCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RatingStars from './RatingStars';
import VerifiedBadge from './VerifiedBadge';
import PriceBadge from './PriceBadge';
import SubjectTags from './SubjectTags';
import { FaHeart, FaRegHeart, FaMapMarkerAlt } from 'react-icons/fa';
import { formatters } from '../../utils/formatters';

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

// Fallback initials
const getInitials = (name) => {
  if (!name) return 'T';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const TutorCard = ({ tutor }) => {
  const [isFav, setIsFav] = useState(false);

  const imageUrl = getImageUrl(tutor.photo);
  const initials = getInitials(tutor.name);
  const subjects = tutor.subjects || [];

  const availableToday = tutor.availability?.includes(
    new Date().toLocaleDateString('en-US', { weekday: 'long' })
  );

  return (
    <div className="card card-hover overflow-hidden group flex flex-col">
      {/* ===== Image Header ===== */}
      <div className="relative h-52 bg-gradient-to-br from-primary-100 to-secondary-100 overflow-hidden">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={tutor.name || 'Tutor'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling.style.display = 'flex';
            }}
          />
        )}

        {/* Fallback avatar */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ display: imageUrl ? 'none' : 'flex' }}
        >
          <div className="w-24 h-24 rounded-full bg-white/90 backdrop-blur-sm shadow-medium flex items-center justify-center text-3xl font-bold text-primary-600 ring-4 ring-white/50">
            {initials}
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        {/* Favorite */}
        <button
          type="button"
          onClick={() => setIsFav((v) => !v)}
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-soft hover:bg-white hover:scale-110 transition-all duration-200"
        >
          {isFav ? (
            <FaHeart className="text-red-500 w-4 h-4" />
          ) : (
            <FaRegHeart className="text-gray-500 w-4 h-4" />
          )}
        </button>

        {/* Verified */}
        {tutor.verified && (
          <div className="absolute top-3 left-3">
            <VerifiedBadge />
          </div>
        )}

        {/* Available today pill */}
        {availableToday && (
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/95 backdrop-blur-sm rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-medium text-white">Available today</span>
          </div>
        )}
      </div>

      {/* ===== Content ===== */}
      <div className="p-5 flex flex-col flex-1">
        {/* Name + price */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <Link to={`/tutor/${tutor.id}`} className="block">
              <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors truncate">
                {tutor.name}
              </h3>
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <RatingStars rating={tutor.rating || 0} size="sm" />
              <span className="font-medium text-gray-900">
                {(tutor.rating || 0).toFixed(1)}
              </span>
              <span className="text-gray-400">({tutor.reviewsCount || 0})</span>
            </div>
          </div>
          <PriceBadge price={tutor.price} />
        </div>

        {/* Location + distance */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <FaMapMarkerAlt className="w-3 h-3 text-primary-500 flex-shrink-0" />
          <span className="truncate">{tutor.location || 'Online'}</span>
          {tutor.distance > 0 && (
            <>
              <span className="w-px h-3.5 bg-gray-200" />
              <span className="text-xs">{formatters.distance(tutor.distance)}</span>
            </>
          )}
        </div>

        {/* Bio */}
        {tutor.bio && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
            {tutor.bio}
          </p>
        )}

        {/* Subjects */}
        {subjects.length > 0 && (
          <div className="mb-3 flex items-center flex-wrap gap-1">
            <SubjectTags subjects={subjects.slice(0, 3)} />
            {subjects.length > 3 && (
              <span className="text-xs text-gray-400">
                +{subjects.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-auto">
          <Link
            to={`/tutor/${tutor.id}`}
            className="flex-1 text-center px-3 py-2 text-sm font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
          >
            View Profile
          </Link>
          <Link
            to={`/tutor/${tutor.id}?book=true`}
            className="flex-1 text-center btn-primary px-3 py-2 text-sm"
          >
            Book
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TutorCard;