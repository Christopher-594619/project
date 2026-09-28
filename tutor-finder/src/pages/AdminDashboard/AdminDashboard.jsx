import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaCheckCircle,
  FaHourglassHalf,
  FaBan,
  FaCalendarAlt,
  FaMoneyBillWave,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import StatsCard from '../../components/dashboard/StatsCard';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await adminService.getStats();
        if (!cancelled) {
          setStats(data.stats);
          setRecentUsers(data.recentUsers || []);
        }
      } catch (error) {
        console.error('Error loading admin stats:', error);
        if (!cancelled) toast.error('Could not load dashboard stats');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const cards = [
    {
      title: 'Students',
      value: stats?.students ?? 0,
      icon: FaUserGraduate,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'Tutors',
      value: stats?.tutors ?? 0,
      icon: FaChalkboardTeacher,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      title: 'Verified Tutors',
      value: stats?.verifiedTutors ?? 0,
      icon: FaCheckCircle,
      color: 'text-green-600 bg-green-100',
    },
    {
      title: 'Pending Verification',
      value: stats?.pendingTutors ?? 0,
      icon: FaHourglassHalf,
      color: 'text-yellow-600 bg-yellow-100',
    },
    {
      title: 'Suspended Accounts',
      value: stats?.suspended ?? 0,
      icon: FaBan,
      color: 'text-red-600 bg-red-100',
    },
  ];

  const bookingCards = [
    {
      title: 'Total Bookings',
      value: stats?.totalBookings ?? 0,
      icon: FaCalendarAlt,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'Pending Bookings',
      value: stats?.pendingBookings ?? 0,
      icon: FaHourglassHalf,
      color: 'text-yellow-600 bg-yellow-100',
    },
    {
      title: 'Completed Sessions',
      value: stats?.completedBookings ?? 0,
      icon: FaCheckCircle,
      color: 'text-green-600 bg-green-100',
    },
    {
      title: 'Platform Revenue',
      value: `K${stats?.totalRevenue ?? 0}`,
      icon: FaMoneyBillWave,
      color: 'text-purple-600 bg-purple-100',
    },
  ];

  return (
    <div className="space-y-8 w-full min-w-0">

      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {(user?.name || user?.email || 'Admin').split(' ')[0]}
        </h1>
        <p className="text-gray-600 mt-1">Platform-wide overview of students and tutors</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
              <LoadingSkeleton type="text" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {cards.map((card, index) => (
            <StatsCard key={index} {...card} />
          ))}
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bookingCards.map((card, index) => (
            <StatsCard key={index} {...card} />
          ))}
        </div>
      )}

      {/* Quick actions */}
      {!loading && stats?.pendingTutors > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-yellow-800">
            <strong>{stats.pendingTutors}</strong> tutor{stats.pendingTutors === 1 ? '' : 's'} waiting on verification.
          </p>
          <Link
            to="/dashboard/admin/tutors"
            className="text-sm font-medium text-yellow-900 bg-yellow-100 hover:bg-yellow-200 px-4 py-2 rounded-xl transition-colors"
          >
            Review tutors →
          </Link>
        </div>
      )}

      {/* Recent signups */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent signups</h2>
          <div className="flex gap-3 text-sm">
            <Link to="/dashboard/admin/students" className="text-primary-600 hover:text-primary-700">Students</Link>
            <Link to="/dashboard/admin/tutors" className="text-primary-600 hover:text-primary-700">Tutors</Link>
            <Link to="/dashboard/admin/bookings" className="text-primary-600 hover:text-primary-700">Bookings</Link>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton type="text" count={3} />
        ) : recentUsers.length === 0 ? (
          <EmptyState icon="🧑‍🎓" title="No signups yet" description="New students and tutors will show up here." />
        ) : (
          <div className="space-y-2">
            {recentUsers.map((row) => (
              <div key={row.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{row.email}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(row.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 capitalize">
                    {row.role}
                  </span>
                  {Boolean(row.is_suspended) && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                      Suspended
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
