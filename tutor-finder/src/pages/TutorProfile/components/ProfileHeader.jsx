import React from 'react';
import {
  FaCalendarCheck,
  FaAward,
} from 'react-icons/fa';
import RatingStars from '../../../components/common/RatingStars';
import VerifiedBadge from '../../../components/common/VerifiedBadge';
import LocationBadge from '../../../components/common/LocationBadge';
import { formatters } from '../../../utils/formatters';

const API_URL = import.meta.env.VITE_ENDPOINT_URL;

const buildPhotoUrl = (photo) => {
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
  if (!name) return 'T';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const ProfileHeader = ({ tutor, onBookSession }) => {
  const photoUrl = buildPhotoUrl(tutor.photo);
  const initials = getInitials(tutor.name);
  const qualificationsCount = Array.isArray(tutor.qualifications)
    ? tutor.qualifications.length
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
      <div className="relative h-48 bg-gradient-to-r from-primary-500 to-secondary-500">
        <div className="absolute -bottom-16 left-8">
          <div className="w-32 h-32 rounded-2xl bg-white p-1 shadow-hard overflow-hidden">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={tutor.name}
                className="w-full h-full rounded-xl object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="w-full h-full rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-4xl font-bold text-primary-600"
              style={{ display: photoUrl ? 'none' : 'flex' }}
            >
              {initials}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-20 pb-6 px-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold text-gray-900">
                {tutor.name || 'Tutor'}
              </h1>
              {tutor.verified && <VerifiedBadge />}
            </div>

            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <div className="flex items-center gap-1">
                <RatingStars rating={tutor.rating || 0} size="md" />
                <span className="font-semibold text-gray-900">
                  {(tutor.rating || 0).toFixed(1)}
                </span>
                <span className="text-gray-500 text-sm">
                  ({tutor.reviewsCount || 0} reviews)
                </span>
              </div>

              {tutor.location && (
                <LocationBadge
                  location={tutor.location}
                  distance={
                    tutor.distance != null
                      ? formatters.distance(tutor.distance)
                      : null
                  }
                />
              )}
            </div>

            <div className="flex flex-wrap gap-4 mt-3">
              {tutor.experience && (
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                  <FaCalendarCheck className="text-primary-500" />
                  {tutor.experience} experience
                </span>
              )}
              {qualificationsCount > 0 && (
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                  <FaAward className="text-primary-500" />
                  {qualificationsCount}{' '}
                  {qualificationsCount === 1 ? 'qualification' : 'qualifications'}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="text-right">
              <span className="text-3xl font-bold text-gray-900">
                {formatters.currency(tutor.price)}
              </span>
              <span className="text-gray-500"> / hour</span>
            </div>
            <button
              onClick={onBookSession}
              className="btn-primary px-8 py-3 text-base"
            >
              Book a Session
            </button>
            <p className="text-sm text-gray-500">
              Free cancellation within 24 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;