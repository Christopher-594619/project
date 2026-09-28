import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaMoneyBillWave, FaUserCheck, FaStar, FaInbox } from 'react-icons/fa';
import StatsCard from '../../components/dashboard/StatsCard';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import ProfileCompletion from './components/ProfileCompletion';
import UpcomingBookings from './components/UpcomingBookings';
import StudentRequests from './components/StudentRequest';
import ReviewsSummary from './components/StudentSummary';

const TutorDashboard = () => {
  const { user, profile } = useAuth();
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadEarnings = async () => {
      if (!user) return;
      try {
        const data = await bookingService.getEarnings(user.id);
        if (!cancelled) setEarnings(data);
      } catch (error) {
        console.error('Error loading earnings:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadEarnings();
    return () => { cancelled = true; };
  }, [user]);

  const stats = [
    {
      title: 'Upcoming Bookings',
      value: earnings?.pendingBookings ?? 0,
      icon: FaCalendarAlt,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'Total Earnings',
      value: `K${earnings?.totalEarnings ?? 0}`,
      icon: FaMoneyBillWave,
      color: 'text-green-600 bg-green-100',
    },
    {
      title: 'Completed Sessions',
      value: earnings?.completedBookings ?? 0,
      icon: FaUserCheck,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      title: 'Average Rating',
      value: `${profile?.rating ?? earnings?.averageRating ?? 0} ★`,
      icon: FaStar,
      color: 'text-yellow-600 bg-yellow-100',
    },
  ];

  return (
    <div className="space-y-8 w-full min-w-0">

      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {(user?.name || user?.email || 'Tutor').split(' ')[0]}!
        </h1>
        <p className="text-gray-600 mt-1">Here's an overview of your tutoring business</p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
              <LoadingSkeleton type="text" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>
      )}

      {/* Profile Completion */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <ProfileCompletion profile={profile} />
        <div className="mt-4">
          <Link to="/dashboard/tutor/profile" className="text-sm text-primary-600 hover:text-primary-700">
            Edit your profile →
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Upcoming Bookings */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FaCalendarAlt className="text-primary-500" />
              Upcoming Bookings
            </h2>
            <Link to="/dashboard/tutor/bookings" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>
          <UpcomingBookings />
        </div>

        {/* Student Requests */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaInbox className="text-primary-500" />
            Student Requests
          </h2>
          <StudentRequests />
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaStar className="text-yellow-500" />
          Reviews
        </h2>
        <ReviewsSummary />
      </div>
    </div>
  );
};

export default TutorDashboard;
