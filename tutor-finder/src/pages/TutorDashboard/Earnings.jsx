import React, { useEffect, useMemo, useState } from 'react';
import { FaMoneyBillWave, FaCalendarAlt, FaChartLine, FaStar } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import StatsCard from '../../components/dashboard/StatsCard';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const Earnings = () => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!user) return;
      try {
        const [summary, history] = await Promise.all([
          bookingService.getEarnings(user.id),
          bookingService.getBookingHistory(user.id, 'tutor'),
        ]);
        if (!cancelled) {
          setEarnings(summary);
          setPayouts(history.filter((b) => b.status === 'completed'));
        }
      } catch (error) {
        console.error('Error loading earnings:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [user]);

  const stats = useMemo(() => ([
    {
      title: 'Total Earnings',
      value: `K${earnings?.totalEarnings ?? 0}`,
      icon: FaMoneyBillWave,
      color: 'text-green-600 bg-green-100',
    },
    {
      title: 'This Month',
      value: `K${earnings?.thisMonth ?? 0}`,
      icon: FaCalendarAlt,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'This Week',
      value: `K${earnings?.thisWeek ?? 0}`,
      icon: FaChartLine,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      title: 'Average Rating',
      value: `${earnings?.averageRating ?? 0} ★`,
      icon: FaStar,
      color: 'text-yellow-600 bg-yellow-100',
    },
  ]), [earnings]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-9 w-48 bg-gray-200 rounded animate-pulse" />
        <LoadingSkeleton type="text" count={4} />
      </div>
    );
  }

  const completionRate = earnings?.totalBookings
    ? Math.round((earnings.completedBookings / earnings.totalBookings) * 100)
    : 0;

  return (
    <div className="space-y-8 w-full min-w-0">

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
        <p className="text-gray-600 mt-1">What you have made from your sessions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Booking breakdown */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Session breakdown</h2>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: 'Total bookings', value: earnings?.totalBookings ?? 0 },
            { label: 'Completed', value: earnings?.completedBookings ?? 0 },
            { label: 'Pending', value: earnings?.pendingBookings ?? 0 },
          ].map((item) => (
            <div key={item.label} className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700">Completion rate</span>
            <span className="font-medium text-gray-900">{completionRate}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-1000"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Payment history */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment history</h2>

        {payouts.length === 0 ? (
          <EmptyState
            icon="💰"
            title="No payments yet"
            description="Completed sessions will show up here once you have taught them."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="py-2 pr-4 font-medium">Student</th>
                  <th className="py-2 pr-4 font-medium">Subject</th>
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Duration</th>
                  <th className="py-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4 text-gray-900">{payout.studentName}</td>
                    <td className="py-3 pr-4 text-gray-600">{payout.subject}</td>
                    <td className="py-3 pr-4 text-gray-600">{payout.date}</td>
                    <td className="py-3 pr-4 text-gray-600">{payout.duration} min</td>
                    <td className="py-3 text-right font-semibold text-gray-900">K{payout.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Earnings;
