import React, { useState, useEffect } from 'react';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../../context/AuthContext';
import { FaMoneyBillWave, FaCalendarAlt, FaChartLine, FaStar } from 'react-icons/fa';
import LoadingSkeleton from '../common/LoadingSkeleton';

const EarningsOverview = () => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEarnings = async () => {
      if (!user) return;
      try {
        const data = await bookingService.getEarnings(user.id);
        setEarnings(data);
      } catch (error) {
        console.error('Error loading earnings:', error);
      } finally {
        setLoading(false);
      }
    };
    loadEarnings();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <LoadingSkeleton key={i} type="text" />
        ))}
      </div>
    );
  }

  if (!earnings) return null;

  const stats = [
    {
      label: 'Total Earnings',
      value: `$${earnings.totalEarnings}`,
      icon: FaMoneyBillWave,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'This Month',
      value: `$${earnings.thisMonth}`,
      icon: FaCalendarAlt,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Completed Bookings',
      value: earnings.completedBookings,
      icon: FaChartLine,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Average Rating',
      value: `${earnings.averageRating} ★`,
      icon: FaStar,
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-lg font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EarningsOverview;