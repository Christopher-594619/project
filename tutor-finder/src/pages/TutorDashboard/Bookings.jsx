import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FaCalendarAlt, FaClock, FaCheck, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Calendar from './components/Calendar';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const statusColor = (status) => {
  switch (status) {
    case 'confirmed': return 'bg-green-100 text-green-700';
    case 'pending': return 'bg-yellow-100 text-yellow-700';
    case 'completed': return 'bg-blue-100 text-blue-700';
    case 'cancelled': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!user) return;
      try {
        const [upcoming, history] = await Promise.all([
          bookingService.getUpcomingBookings(user.id, 'tutor'),
          bookingService.getBookingHistory(user.id, 'tutor'),
        ]);
        if (!cancelled) setBookings([...upcoming, ...history]);
      } catch (error) {
        console.error('Error loading bookings:', error);
        if (!cancelled) toast.error('Could not load your bookings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [user]);

  const visible = useMemo(
    () => (filter === 'all' ? bookings : bookings.filter((b) => b.status === filter)),
    [bookings, filter]
  );

  const updateStatus = async (bookingId, status, message) => {
    const previous = bookings;
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)));

    try {
      await bookingService.updateBookingStatus(bookingId, status);
      toast.success(message);
    } catch {
      setBookings(previous);
      toast.error('Could not update the booking');
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0">

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-600 mt-1">Accept, decline and keep track of your sessions</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Booking list */}
        <div className="lg:col-span-2 space-y-4">

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  filter === f.key
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
            {loading ? (
              <LoadingSkeleton type="text" count={3} />
            ) : visible.length === 0 ? (
              <EmptyState
                icon="📅"
                title="No bookings here"
                description={
                  filter === 'all'
                    ? "You don't have any bookings yet."
                    : `You have no ${filter} bookings.`
                }
              />
            ) : (
              <div className="space-y-3">
                {visible.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-primary-600 font-semibold">
                        {booking.studentAvatar || booking.studentName?.[0] || 'S'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{booking.studentName}</p>
                        <p className="text-sm text-gray-500 truncate">{booking.subject}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaCalendarAlt className="w-3 h-3" />
                            {booking.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaClock className="w-3 h-3" />
                            {booking.time}
                          </span>
                          <span>{booking.duration} min</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-gray-900">K{booking.price}</p>
                      <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${statusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>

                      {booking.status === 'pending' && (
                        <div className="flex gap-2 mt-2 justify-end">
                          <button
                            onClick={() => updateStatus(booking.id, 'confirmed', 'Booking confirmed!')}
                            className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            title="Accept"
                          >
                            <FaCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateStatus(booking.id, 'cancelled', 'Booking declined')}
                            className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            title="Decline"
                          >
                            <FaTimes className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Availability calendar */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Your availability</h2>
          <Calendar />
        </div>
      </div>
    </div>
  );
};

export default Bookings;
