import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../../context/AuthContext';
import { FaCalendarAlt, FaClock, FaCheck, FaTimes } from 'react-icons/fa';
import EmptyState from '../common/EmptyState';
import LoadingSkeleton from '../common/LoadingSkeleton';
import toast from 'react-hot-toast';

const UpcomingBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookings = async () => {
      if (!user) return;
      try {
        const data = await bookingService.getUpcomingBookings(user.id, 'tutor');
        setBookings(data);
      } catch (error) {
        console.error('Error loading bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, [user]);

  const handleAccept = async (bookingId) => {
    try {
      await bookingService.updateBookingStatus(bookingId, 'confirmed');
      toast.success('Booking confirmed!');
      setBookings(prev => 
        prev.map(b => b.id === bookingId ? { ...b, status: 'confirmed' } : b)
      );
    } catch (error) {
      toast.error('Failed to accept booking');
    }
  };

  const handleDecline = async (bookingId) => {
    try {
      await bookingService.updateBookingStatus(bookingId, 'cancelled');
      toast.success('Booking declined');
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (error) {
      toast.error('Failed to decline booking');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return <LoadingSkeleton type="text" count={3} />;
  }

  if (bookings.length === 0) {
    return (
      <EmptyState
        icon="📅"
        title="No upcoming bookings"
        description="You don't have any upcoming bookings yet."
      />
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-primary-600 font-semibold flex-shrink-0">
              {booking.studentAvatar || booking.studentName?.[0] || 'S'}
            </div>
            <div>
              <p className="font-medium text-gray-900">{booking.studentName}</p>
              <p className="text-sm text-gray-500">{booking.subject}</p>
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
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
            {booking.status === 'pending' && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleAccept(booking.id)}
                  className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  title="Accept"
                >
                  <FaCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDecline(booking.id)}
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
  );
};

export default UpcomingBookings;