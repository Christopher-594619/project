import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { useSavedTutors } from '../../hooks/useSavedTutors';
import { formatters } from '../../utils/formatters';
import EmptyState from '../../components/common/EmptyState';

const API_URL = import.meta.env.VITE_ENDPOINT_URL;

const photoUrl = (photo) => {
  if (!photo) return null;
  return /^(https?:|data:|blob:)/.test(photo) ? photo : `${API_URL}${photo.startsWith('/') ? '' : '/'}${photo}`;
};

const Saved = () => {
  const { saved, removeSaved } = useSavedTutors();

  return (
    <div className="space-y-6 w-full min-w-0">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Saved Tutors</h1>
        <p className="text-gray-600 mt-1">Tutors you've saved with the ❤️ button while browsing</p>
      </div>

      {saved.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <EmptyState
            icon="❤️"
            title="No saved tutors"
            description="Tap the heart on a tutor's card to save them here."
            action={
              <Link to="/search" className="btn-primary text-sm">
                Browse Tutors
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {saved.map((tutor) => {
            const img = photoUrl(tutor.photo);

            return (
              <div
                key={tutor.id}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-soft min-w-0"
              >
                <Link to={`/tutor/${tutor.id}`} className="flex items-center gap-4 flex-1 min-w-0 group">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-primary-600 font-bold text-lg flex-shrink-0 overflow-hidden">
                    {img ? (
                      <img src={img} alt={tutor.name} className="w-full h-full object-cover" />
                    ) : (
                      tutor.name?.[0]?.toUpperCase() || 'T'
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                      {tutor.name}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0">
                      <span className="inline-flex items-center gap-0.5 flex-shrink-0">
                        <FaStar className="w-3 h-3 text-yellow-400" />
                        {Number(tutor.rating || 0).toFixed(1)}
                      </span>
                      <span className="truncate">{tutor.subjects.slice(0, 2).join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5 min-w-0">
                      <FaMapMarkerAlt className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{tutor.location || 'Online'}</span>
                      {tutor.price != null && <span className="flex-shrink-0">· {formatters.currency(tutor.price)}/hr</span>}
                    </div>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => removeSaved(tutor.id)}
                  aria-label={`Remove ${tutor.name} from saved tutors`}
                  className="p-2 rounded-full hover:bg-red-50 flex-shrink-0"
                >
                  <FaHeart className="text-red-500 w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Saved;
