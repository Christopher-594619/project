import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import { bookingService } from '../../services/bookingService';
import { formatters } from '../../utils/formatters';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const FILTERS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'history', label: 'Past' },
  { key: 'all', label: 'All' },
];

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-gray-100 text-gray-600',
};

const Lessons = () => {
  const [scope, setScope] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await bookingService.getBookings(null, 'student', scope === 'all' ? {} : { scope });
      setBookings(list);
    } catch (error) {
      toast.error(error.message || 'Could not load your lessons');
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    load();
  }, [load]);

  const cancel = async (booking) => {
    if (!window.confirm(`Cancel your ${booking.subject} lesson with ${booking.tutorName}?`)) return;

    setCancellingId(booking.id);
    try {
      await bookingService.cancelBooking(booking.id);
      toast.success('Lesson cancelled');
      await load();
    } catch (error) {
      toast.error(error.message || 'Could not cancel this lesson');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Lessons</h1>
        <p className="text-gray-600 mt-1">Your booked sessions and their status</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setScope(f.key)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              scope === f.key
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-4 sm:p-6">
        {loading ? (
          <LoadingSkeleton type="text" count={3} />
        ) : bookings.length === 0 ? (
          <EmptyState
            icon="📅"
            title={scope === 'history' ? 'No past lessons' : 'No lessons yet'}
            description="Book a session with a tutor and it will show up here."
            action={
              <Link to="/search" className="btn-primary text-sm">
                Find a Tutor
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => {
              const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

              return (
                <div
                  key={booking.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 flex-shrink-0 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-primary-600 font-bold">
                      {booking.tutorAvatar}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{booking.subject}</p>
                      <Link
                        to={`/tutor/${booking.tutorId}`}
                        className="text-sm text-gray-500 hover:text-primary-600 truncate block"
                      >
                        with {booking.tutorName}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="inline-flex items-center gap-1">
                          <FaCalendarAlt className="w-3 h-3" />
                          {booking.date ? formatters.date(booking.date) : '—'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <FaClock className="w-3 h-3" />
                          {booking.time} · {booking.duration} min
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                    <span className="text-sm font-medium text-gray-900">
                      {formatters.currency(booking.totalAmount || 0)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[booking.status] || STATUS_STYLES.cancelled}`}>
                      {booking.status}
                    </span>
                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => cancel(booking)}
                        disabled={cancellingId === booking.id}
                        className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Lessons;
