import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUserCheck,
  FaStar,
  FaClock,
  FaHourglassHalf,
  FaCheckCircle,
} from 'react-icons/fa';
import StatsCard from '../../components/dashboard/StatsCard';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';
import { formatters } from '../../utils/formatters';

const API_URL = import.meta.env.VITE_ENDPOINT_URL;

const TutorDashboard = () => {
  const { user, accessToken } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // "9:00 AM" → "09:00"
  const convertTo24h = (timeStr) => {
    if (!timeStr) return '00:00';
    const match = String(timeStr).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return '00:00';
    let [, h, m, p] = match;
    h = parseInt(h, 10);
    p = p.toUpperCase();
    if (p === 'AM' && h === 12) h = 0;
    if (p === 'PM' && h !== 12) h += 12;
    return `${String(h).padStart(2, '0')}:${m}`;
  };

  const bookingDateTime = (b) => {
    const base = new Date(b.date);
    if (isNaN(base.getTime())) return new Date(0);
    const [h, m] = convertTo24h(b.time).split(':').map(Number);
    base.setHours(h, m, 0, 0);
    return base;
  };

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };

      try {
        // Inside TutorDashboard useEffect:

        const [bookingsRes, profileRes] = await Promise.allSettled([
          fetch(`${API_URL}/api/bookings`, { headers }).then((r) => r.json()),
          fetch(`${API_URL}/api/users/me`, { headers }).then((r) => r.json()),
        ]);

        if (bookingsRes.status === 'fulfilled' && bookingsRes.value?.bookings) {
          setBookings(bookingsRes.value.bookings);
        }

        // The response shape is { user: { ..., profile: {...} } }
        if (profileRes.status === 'fulfilled' && profileRes.value?.user) {
          setProfile(profileRes.value.user);
        }
      } catch (err) {
        console.error('Error loading tutor dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, accessToken]);

  // ============ DERIVED ============
  const now = new Date();

  const pending = bookings
    .filter((b) => b.status === 'pending')
    .sort((a, b) => bookingDateTime(a) - bookingDateTime(b));

  const upcoming = bookings
    .filter(
      (b) => b.status === 'confirmed' && bookingDateTime(b) >= now
    )
    .sort((a, b) => bookingDateTime(a) - bookingDateTime(b));

  const completed = bookings.filter((b) => b.status === 'completed');

  const uniqueStudents = new Set(bookings.map((b) => b.studentId)).size;

  const totalEarnings = completed.reduce(
    (sum, b) => sum + (parseFloat(b.price) || 0),
    0
  );

  const nextBooking = upcoming[0] || pending[0] || null;

  // Profile completion
  const completion = computeCompletion(profile);

  const stats = [
    {
      title: 'Upcoming',
      value: upcoming.length,
      icon: FaCalendarAlt,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'Pending',
      value: pending.length,
      icon: FaHourglassHalf,
      color: 'text-yellow-600 bg-yellow-100',
    },
    {
      title: 'Earnings',
      value: formatters.currency(totalEarnings),
      icon: FaMoneyBillWave,
      color: 'text-green-600 bg-green-100',
    },
    {
      title: 'Students',
      value: uniqueStudents,
      icon: FaUserCheck,
      color: 'text-purple-600 bg-purple-100',
    },
  ];

  return (
    <div className="space-y-8 w-full min-w-0">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName || 'Tutor'}!
        </h1>
        <p className="text-gray-600 mt-1">Here's your tutoring overview</p>
      </div>

      {loading ? (
        <>
          <LoadingSkeleton type="text" count={2} />
          <LoadingSkeleton type="text" count={4} />
        </>
      ) : (
        <>
          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <StatsCard key={i} {...s} />
            ))}
          </div>

          {/* PROFILE COMPLETION */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Profile Completion
              </h2>
              <span className="font-semibold text-primary-600">
                {completion.percentage}%
              </span>
            </div>

            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
                style={{ width: `${completion.percentage}%` }}
              />
            </div>

            {completion.missing.length > 0 && (
              <p className="text-sm text-gray-500 mt-3">
                Missing:{' '}
                <span className="text-gray-700">
                  {completion.missing.join(', ')}
                </span>
              </p>
            )}

            {completion.percentage < 100 && (
              <Link
                to="/become-tutor"
                className="inline-block mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Complete your profile
              </Link>
            )}
          </div>

          {/* NEXT SESSION HERO */}
          {nextBooking && (
            <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl shadow-hard p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <FaHourglassHalf className="w-4 h-4" />
                <span className="text-sm font-medium uppercase tracking-wide opacity-90">
                  {nextBooking.status === 'confirmed' ? 'Next Session' : 'Awaiting Confirmation'}
                </span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    {nextBooking.studentName}
                  </h2>
                  <p className="text-white/90 mt-1">
                    {nextBooking.subject}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-lg font-semibold">
                    {formatters.date(nextBooking.date)}
                  </p>
                  <p className="text-sm text-white/90 flex items-center gap-1 md:justify-end">
                    <FaClock className="w-3 h-3" />
                    {nextBooking.time} · {nextBooking.duration} min
                  </p>
                  <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-white/20 text-white">
                    {nextBooking.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* BOOKINGS SUMMARY */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaCalendarAlt className="text-primary-500" />
                Booking Requests & Sessions
              </h2>
              <span className="text-sm text-gray-500">
                {pending.length + upcoming.length}
              </span>
            </div>

            {pending.length > 0 || upcoming.length > 0 ? (
              <div className="space-y-3">
                {[...pending, ...upcoming].slice(0, 5).map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {b.studentName}
                      </p>
                      <p className="text-sm text-gray-500">{b.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatters.date(b.date)}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                        <FaClock className="w-3 h-3" />
                        {b.time} · {b.duration} min
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                          b.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FaCalendarAlt className="w-12 h-12 text-gray-300 mx-auto" />}
                title="No bookings yet"
                description="New booking requests will appear here."
              />
            )}
          </div>

          {/* REVIEWS SUMMARY */}
          {/* REVIEWS SUMMARY */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaStar className="text-yellow-500" />
                Reviews
              </h2>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">
                  {(parseFloat(profile?.profile?.rating) || 0).toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ({profile?.profile?.reviews_count || 0})
                </span>
              </div>
            </div>

            {Number(profile?.profile?.reviews_count) > 0 ? (
              <p className="text-sm text-gray-500">
                {profile.profile.reviews_count} review
                {Number(profile.profile.reviews_count) !== 1 ? 's' : ''} total
              </p>
            ) : (
              <EmptyState
                icon={<FaStar className="w-12 h-12 text-gray-300 mx-auto" />}
                title="No reviews yet"
                description="Reviews will appear after your first completed sessions."
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Compute profile completion from real data
function computeCompletion(userData) {
  const p = userData?.profile;

  if (!p) {
    return {
      percentage: 0,
      missing: ['Photo', 'Bio', 'Subjects', 'Levels', 'Price', 'Availability', 'Education', 'Skills'],
    };
  }

  // Helper — treats undefined, null, empty string, empty array as missing
  const has = (v) => {
    if (v === null || v === undefined) return false;
    if (typeof v === 'string') return v.trim().length > 0;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'number') return !isNaN(v);
    return true;
  };

  const checks = [
    { label: 'Photo',         ok: has(userData?.profilePic) || has(p.photo) },
    { label: 'Bio',           ok: has(userData?.bio) || has(p.bio) },
    { label: 'Subjects',      ok: has(p.subjects) },
    { label: 'Levels',        ok: has(p.levels) },
    { label: 'Price',         ok: has(p.price) && parseFloat(p.price) > 0 },
    { label: 'Availability',  ok: has(p.availability) },
    { label: 'Education',     ok: has(p.education) },
    { label: 'Skills',        ok: has(p.skills) },
  ];

  const done = checks.filter((c) => c.ok).length;
  const percentage = Math.round((done / checks.length) * 100);

  return {
    percentage,
    missing: checks.filter((c) => !c.ok).map((c) => c.label),
  };
}

export default TutorDashboard;