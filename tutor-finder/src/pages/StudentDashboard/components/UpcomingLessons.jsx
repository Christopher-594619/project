import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../../context/AuthContext';
import { FaCalendarAlt, FaClock, FaVideo, FaMapMarkerAlt } from 'react-icons/fa';
import EmptyState from '../common/EmptyState';
import LoadingSkeleton from '../common/LoadingSkeleton';

const UpcomingLessons = () => {
  const { user } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLessons = async () => {
      if (!user) return;
      try {
        const data = await bookingService.getUpcomingBookings(user.id, 'student');
        setLessons(data);
      } catch (error) {
        console.error('Error loading lessons:', error);
      } finally {
        setLoading(false);
      }
    };
    loadLessons();
  }, [user]);

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

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return <LoadingSkeleton type="text" count={3} />;
  }

  if (lessons.length === 0) {
    return (
      <EmptyState
        icon="📅"
        title="No upcoming lessons"
        description="You don't have any upcoming lessons. Book a session with a tutor today!"
        action={
          <a href="/search" className="btn-primary text-sm">
            Find a Tutor
          </a>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {lessons.map((lesson) => (
        <div key={lesson.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-primary-600 font-semibold flex-shrink-0">
              {lesson.tutorAvatar || lesson.tutorName?.[0] || 'T'}
            </div>
            <div>
              <p className="font-medium text-gray-900">{lesson.tutorName}</p>
              <p className="text-sm text-gray-500">{lesson.subject}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <FaCalendarAlt className="w-3 h-3" />
                  {lesson.date}
                </span>
                <span className="flex items-center gap-1">
                  <FaClock className="w-3 h-3" />
                  {lesson.time}
                </span>
                <span>{lesson.duration} min</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lesson.status)}`}>
              {getStatusLabel(lesson.status)}
            </span>
            <p className="text-sm font-medium text-gray-900 mt-1">
              ${lesson.price}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UpcomingLessons;