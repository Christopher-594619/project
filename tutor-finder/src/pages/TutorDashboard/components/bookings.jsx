// src/pages/TutorBookings/TutorBookings.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  FaCalendarAlt,
  FaClock,
  FaCommentDots,
  FaChevronDown,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';
import EmptyState from '../../../components/common/EmptyState';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton';
import { formatters } from '../../../utils/formatters';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_ENDPOINT_URL;

const STATUS_CONFIG = {
  all:       { label: 'All',       pill: 'bg-gray-100 text-gray-700' },
  pending:   { label: 'Pending',   pill: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmed', pill: 'bg-green-100 text-green-700' },
  completed: { label: 'Completed', pill: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Cancelled', pill: 'bg-red-100 text-red-700' },
};

const TutorBookings = () => {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [openingChatId, setOpeningChatId] = useState(null);

  const convertTo24h = (timeStr) => {
    if (!timeStr) return '00:00';
    const m = String(timeStr).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return '00:00';
    let [, h, min, p] = m;
    h = parseInt(h, 10);
    p = p.toUpperCase();
    if (p === 'AM' && h === 12) h = 0;
    if (p === 'PM' && h !== 12) h += 12;
    return `${String(h).padStart(2, '0')}:${min}`;
  };

  const bookingDateTime = (b) => {
    const base = new Date(b.date);
    if (isNaN(base.getTime())) return new Date(0);
    const [h, m] = convertTo24h(b.time).split(':').map(Number);
    base.setHours(h, m, 0, 0);
    return base;
  };

  const buildPhotoUrl = (photo) => {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    return `${API_URL}${photo.startsWith('/') ? '' : '/'}${photo}`;
  };

  const getInitials = (name) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'S';

  const loadBookings = async () => {
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
      console.log(data)
      if (!res.ok) throw new Error(data.message || 'Failed to load bookings');
      setBookings(data.bookings || []);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, accessToken]);

  const handleUpdateStatus = async (bookingId, status) => {
    setUpdatingId(bookingId);
    setOpenMenuId(null);
    try {
      const res = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update booking');

      toast.success(`Booking marked as ${status}`);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
      );
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to update booking');
    } finally {
      setUpdatingId(null);
    }
  };

  // ============ Create or get chat, then redirect ============
    const handleMessage = async (booking) => {
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

  const filtered = bookings
    .filter((b) => (filter === 'all' ? true : b.status === filter))
    .sort((a, b) => bookingDateTime(b) - bookingDateTime(a));

  const counts = Object.keys(STATUS_CONFIG).reduce((acc, key) => {
    acc[key] = key === 'all'
      ? bookings.length
      : bookings.filter((b) => b.status === key).length;
    return acc;
  }, {});

  useEffect(() => {
    const close = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', close);
      return () => document.removeEventListener('click', close);
    }
  }, [openMenuId]);

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Bookings
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Manage your sessions and student requests
        </p>
      </div>

      {/* Filter tabs */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-2 overflow-x-auto">
        <div className="flex gap-1.5 min-w-max">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  active
                    ? 'bg-primary-600 text-white shadow-soft'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cfg.label}
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                    active ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {counts[key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-soft border border-gray-100 h-56 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 py-16">
          <EmptyState
            icon={<FaCalendarAlt className="w-12 h-12 text-gray-300 mx-auto" />}
            title={filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
            description={
              filter === 'all'
                ? 'New booking requests will appear here.'
                : 'Try another filter to see more.'
            }
          />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {filtered.map((b) => {
            const photoUrl = buildPhotoUrl(b.studentProfilePic);
            const initials = getInitials(b.studentName);
            const statusCfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.all;

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl shadow-soft border border-gray-100 hover:border-primary-100 hover:shadow-medium transition-all p-6 flex flex-col gap-5"
              >
                {/* Header: avatar + name + status */}
                <div className="flex items-start gap-4">
                  <div className="relative w-14 h-14 flex-shrink-0">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-primary-600 font-semibold">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={b.studentName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ display: photoUrl ? 'none' : 'flex' }}
                      >
                        {initials}
                      </div>
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ${
                        b.status === 'confirmed'
                          ? 'bg-green-500'
                          : b.status === 'pending'
                          ? 'bg-yellow-400'
                          : b.status === 'completed'
                          ? 'bg-blue-500'
                          : 'bg-red-500'
                      }`}
                      style={{ boxShadow: '0 0 0 3px white' }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">
                      {b.studentName}
                    </p>
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {b.subject}
                    </p>
                    <span
                      className={`inline-block mt-2 px-2.5 py-0.5 text-[11px] font-semibold rounded-md uppercase tracking-wide ${statusCfg.pill}`}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>

                {/* Meta */}
                <div className="space-y-2.5 py-4 border-y border-gray-100">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaCalendarAlt className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    {formatters.date(b.date)}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <FaClock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    {b.time} · {b.duration} min
                  </div>
                </div>

                {/* Notes */}
                {b.notes && (
                  <div className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3 border-l-2 border-primary-300">
                    <span className="text-[11px] text-gray-400 uppercase tracking-wide font-medium block mb-1">
                      Note
                    </span>
                    {b.notes}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 mt-auto">
                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => handleMessage(b)}
                      disabled={openingChatId === b.id}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl text-primary-600 hover:bg-primary-50 border border-primary-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {openingChatId === b.id ? (
                        <span className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FaCommentDots className="w-4 h-4" />
                      )}
                      Message
                    </button>
                  )}

                  {(b.status === 'pending' || b.status === 'confirmed') && (
                    <div className="relative flex-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === b.id ? null : b.id);
                        }}
                        disabled={updatingId === b.id}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50"
                      >
                        {updatingId === b.id ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            Update
                            <FaChevronDown className="w-3 h-3" />
                          </>
                        )}
                      </button>

                      {openMenuId === b.id && (
                        <div
                          className="absolute bottom-full mb-2 right-0 w-52 bg-white rounded-xl shadow-hard border border-gray-100 py-2 z-20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'completed')}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                          >
                            <FaCheckCircle className="w-4 h-4 text-blue-500" />
                            Mark completed
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                          >
                            <FaCheckCircle className="w-4 h-4 text-blue-500" />
                             Mark Confirmed
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 transition-colors"
                          >
                            <FaTimesCircle className="w-4 h-4 text-red-500" />
                            Cancel booking
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TutorBookings;