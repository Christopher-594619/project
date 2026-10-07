import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaHourglassHalf,
  FaCommentDots,
} from 'react-icons/fa';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { formatters } from '../../utils/formatters';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_ENDPOINT_URL;

const StudentDashboard = () => {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openingChatId, setOpeningChatId] = useState(null);

  // Convert booking -> Date object combining date + time
  function bookingDateTime(booking) {
    const base = new Date(booking.date);
    if (isNaN(base.getTime())) return new Date(0);

    const [h, m] = convertTo24h(booking.time).split(':').map(Number);
    base.setHours(h, m, 0, 0);
    return base;
  }

  // "9:00 AM" → "09:00"
  function convertTo24h(timeStr) {
    if (!timeStr) return '00:00';
    const match = String(timeStr).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return '00:00';
    let [, h, m, p] = match;
    h = parseInt(h, 10);
    p = p.toUpperCase();
    if (p === 'AM' && h === 12) h = 0;
    if (p === 'PM' && h !== 12) h += 12;
    return `${String(h).padStart(2, '0')}:${m}`;
  }

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const res = await fetch(`${API_URL}/api/bookings`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load bookings');
        setBookings(data.bookings || []);
      } catch (err) {
        console.error('Error loading bookings:', err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, accessToken]);

  const now = new Date();

  const upcoming = bookings
    .filter(
      (b) =>
        (b.status === 'confirmed' || b.status === 'pending') &&
        bookingDateTime(b) >= now
    )
    .sort((a, b) => bookingDateTime(a) - bookingDateTime(b));

  const completed = bookings
    .filter((b) => b.status === 'completed')
    .sort((a, b) => bookingDateTime(b) - bookingDateTime(a));

  const nextBooking = upcoming[0] || null;

  const handleMessageTutor = async(booking) => {
      setOpeningChatId(booking.id);
      try {
        const res = await fetch(`${API_URL}/api/chats`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
              body: JSON.stringify({
              studentId: booking.studentId,
              tutorId: booking.tutorId,
            }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to start chat');

        const chatId = data.chat?.id;
        if (!chatId) throw new Error('Chat was not created');

        navigate(`/chat/${chatId}`);
      } catch (err) {
        console.error('Chat error:', err);
        toast.error(err.message || 'Failed to start chat');
      } finally {
        setOpeningChatId(null);
      }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName || 'Student'}!
        </h1>
        <p className="text-gray-600 mt-1">Here's your learning overview</p>
      </div>

      {loading ? (
        <>
          <LoadingSkeleton type="text" count={2} />
          <LoadingSkeleton type="text" count={4} />
        </>
      ) : (
        <>
          {/* NEXT SESSION */}
          {nextBooking && (
            <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl shadow-hard p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <FaHourglassHalf className="w-4 h-4" />
                <span className="text-sm font-medium uppercase tracking-wide opacity-90">
                  Next Session
                </span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">
                    {nextBooking.tutorName}
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
                  <div className="flex items-center gap-2 mt-2 md:justify-end">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                        nextBooking.status === 'confirmed'
                          ? 'bg-white/20 text-white'
                          : 'bg-yellow-400/90 text-yellow-900'
                      }`}
                    >
                      {nextBooking.status}
                    </span>

                    {nextBooking.status === 'confirmed' && (
                      <button
                        onClick={() => handleMessageTutor(nextBooking)}
                        disabled={openingChatId === nextBooking.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-white text-primary-600 hover:bg-gray-100 transition-colors"
                      >
                        {openingChatId === nextBooking.id ? (
                          <span className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FaCommentDots className="w-4 h-4" />
                        )}
                        Message
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* UPCOMING */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaCalendarAlt className="text-primary-500" />
                Upcoming Sessions
              </h2>
              <span className="text-sm text-gray-500">
                {upcoming.length}
              </span>
            </div>

            {upcoming.length > 0 ? (
              <div className="space-y-3">
                {upcoming.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {b.tutorName}
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

                      <div className="flex items-center justify-end gap-2 mt-1.5">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                            b.status === 'confirmed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {b.status}
                        </span>

                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => handleMessageTutor(b)}
                            disabled={openingChatId === b.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border border-primary-200 text-primary-600 hover:bg-primary-50 transition-colors"
                          >
                            {openingChatId === b.id ? (
                              <span className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <FaCommentDots className="w-4 h-4" />
                            )}
                            Message
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FaCalendarAlt className="w-12 h-12 text-gray-300 mx-auto" />}
                title="No upcoming sessions"
                description="Book a session with a tutor to get started."
                action={
                  <Link to="/search" className="btn-primary text-sm">
                    Find a Tutor
                  </Link>
                }
              />
            )}
          </div>

          {/* COMPLETED */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                Completed Sessions
              </h2>
              <span className="text-sm text-gray-500">
                {completed.length}
              </span>
            </div>

            {completed.length > 0 ? (
              <div className="space-y-3">
                {completed.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl opacity-90"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {b.tutorName}
                      </p>
                      <p className="text-sm text-gray-500">{b.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {formatters.date(b.date)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {b.time} · {b.duration} min
                      </p>
                      <Link
                        to={`/tutor/${b.tutorId}`}
                        className="inline-block mt-1 text-xs text-primary-600 hover:text-primary-700"
                      >
                        Leave a review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FaCheckCircle className="w-12 h-12 text-gray-300 mx-auto" />}
                title="No completed sessions"
                description="Your finished sessions will appear here."
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

function convertTo24h(timeStr) {
  if (!timeStr) return '00:00:00';
  const match = String(timeStr).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return timeStr;
  let [, h, m, p] = match;
  h = parseInt(h, 10);
  p = p.toUpperCase();
  if (p === 'AM' && h === 12) h = 0;
  if (p === 'PM' && h !== 12) h += 12;
  return `${String(h).padStart(2, '0')}:${m}:00`;
}

export default StudentDashboard;