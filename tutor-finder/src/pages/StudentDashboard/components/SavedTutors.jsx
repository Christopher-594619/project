import React from 'react';
import { Link } from 'react-router-dom';
import { useTutors } from '../../hooks/useTutors';
import { FaHeart, FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import EmptyState from '../common/EmptyState';
import { formatters } from '../../utils/formatters';

const SavedTutors = () => {
  const { favorites, tutors } = useTutors();
  
  const savedTutors = tutors.filter(t => favorites.includes(t.id));

  if (savedTutors.length === 0) {
    return (
      <EmptyState
        icon="❤️"
        title="No saved tutors"
        description="Save tutors you're interested in to find them easily later."
        action={
          <a href="/search" className="btn-primary text-sm">
            Browse Tutors
          </a>
        }
      />
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {savedTutors.map((tutor) => (
        <Link
          key={tutor.id}
          to={`/tutor/${tutor.id}`}
          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-medium transition-all duration-200 group"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-primary-600 font-bold text-lg flex-shrink-0">
            {tutor.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {tutor.name}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="flex items-center gap-0.5">
                <FaStar className="w-3 h-3 text-yellow-400" />
                <span>{tutor.rating}</span>
              </div>
              <span>•</span>
              <span>{tutor.subjects.slice(0, 2).join(', ')}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
              <FaMapMarkerAlt className="w-3 h-3" />
              <span>{tutor.distance ? formatters.distance(tutor.distance) : 'Online'}</span>
              <span>•</span>
              <span>{formatters.currency(tutor.price)}/hr</span>
            </div>
          </div>
          <FaHeart className="text-red-500 w-4 h-4 flex-shrink-0" />
        </Link>
      ))}
    </div>
  );
};

export default SavedTutors;