import React from 'react';
import { FaMapMarkerAlt, FaStar, FaCalendarCheck, FaAward } from 'react-icons/fa';
import RatingStars from '../../../components/common/RatingStars';
import VerifiedBadge from '../../../components/common/VerifiedBadge';
import LocationBadge from '../../../components/common/LocationBadge';
import { formatters } from '../../../utils/formatters';

const ProfileHeader = ({ tutor, onBookSession }) => {
  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
      <div className="relative h-48 bg-gradient-to-r from-primary-500 to-secondary-500">
        <div className="absolute -bottom-16 left-8">
          <div className="w-32 h-32 rounded-2xl bg-white p-1 shadow-hard">
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-4xl font-bold text-primary-600">
              {tutor.avatar}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-20 pb-6 px-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{tutor.name}</h1>
              {tutor.verified && <VerifiedBadge />}
            </div>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <div className="flex items-center gap-1">
                <RatingStars rating={tutor.rating} size="md" />
                <span className="font-semibold text-gray-900">{tutor.rating}</span>
                <span className="text-gray-500 text-sm">
                  ({tutor.reviewsCount} reviews)
                </span>
              </div>
              <LocationBadge 
                location={tutor.location} 
                distance={tutor.distance ? formatters.distance(tutor.distance) : null}
              />
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                <FaCalendarCheck className="text-primary-500" />
                {tutor.experience} experience
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                <FaAward className="text-primary-500" />
                {tutor.qualifications?.length || 0} qualifications
              </span>
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
            <p className="text-sm text-gray-500">Free cancellation within 24 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;