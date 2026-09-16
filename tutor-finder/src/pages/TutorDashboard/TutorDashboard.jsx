import React, { useState } from 'react';
import { FaCalendarAlt, FaMoneyBillWave, FaUserCheck, FaStar } from 'react-icons/fa';
import StatsCard from '../../components/dashboard/StatsCard';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';

const TutorDashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Upcoming Bookings',
      value: 8,
      icon: FaCalendarAlt,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'Total Earnings',
      value: '$1,240',
      icon: FaMoneyBillWave,
      color: 'text-green-600 bg-green-100',
    },
    {
      title: 'Active Students',
      value: 12,
      icon: FaUserCheck,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      title: 'Average Rating',
      value: '4.8 ★',
      icon: FaStar,
      color: 'text-yellow-600 bg-yellow-100',
    },
  ];

  const upcomingBookings = [
    {
      id: 1,
      studentName: 'Sarah Johnson',
      subject: 'Calculus',
      date: '2024-01-20',
      time: '2:00 PM',
      duration: '1 hour',
      status: 'confirmed',
    },
    {
      id: 2,
      studentName: 'Michael Chen',
      subject: 'Physics',
      date: '2024-01-21',
      time: '3:30 PM',
      duration: '1.5 hours',
      status: 'pending',
    },
    {
      id: 3,
      studentName: 'Emma Wilson',
      subject: 'Chemistry',
      date: '2024-01-22',
      time: '10:00 AM',
      duration: '1 hour',
      status: 'confirmed',
    },
  ];

  const recentReviews = [
    {
      id: 1,
      studentName: 'David Kim',
      rating: 5,
      comment: 'Excellent tutor! Very patient and knowledgeable.',
      date: '2 days ago',
    },
    {
      id: 2,
      studentName: 'Lisa Park',
      rating: 4,
      comment: 'Great session, helped me understand the concepts clearly.',
      date: '5 days ago',
    },
  ];

  return (
    <div className="space-y-8 w-full min-w-0">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0] || 'Tutor'}!
        </h1>
        <p className="text-gray-600 mt-1">Here's an overview of your tutoring business</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Profile Completion */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Profile Completion</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
          <span className="font-semibold text-primary-600">75%</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {['Photo', 'Bio', 'Subjects', 'Availability'].map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-gray-600">{item}</span>
            </div>
          ))}
          {['Experience', 'Education', 'Pricing'].map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <span className="text-gray-600">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Bookings */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaCalendarAlt className="text-primary-500" />
            Upcoming Bookings
          </h2>
          {upcomingBookings.length > 0 ? (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">{booking.studentName}</p>
                    <p className="text-sm text-gray-500">{booking.subject}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{booking.date}</p>
                    <p className="text-xs text-gray-500">{booking.time} • {booking.duration}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="📅"
              title="No upcoming bookings"
              description="Your schedule is clear for now."
            />
          )}
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaStar className="text-yellow-500" />
            Recent Reviews
          </h2>
          {recentReviews.length > 0 ? (
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div key={review.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{review.studentName}</p>
                    <span className="text-sm text-yellow-500">{'★'.repeat(review.rating)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                  <p className="text-xs text-gray-400 mt-1">{review.date}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="⭐"
              title="No reviews yet"
              description="You haven't received any reviews yet."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;