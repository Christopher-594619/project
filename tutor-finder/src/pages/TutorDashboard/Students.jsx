import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaComment, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const Students = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!user) return;
      try {
        const [upcoming, history] = await Promise.all([
          bookingService.getUpcomingBookings(user.id, 'tutor'),
          bookingService.getBookingHistory(user.id, 'tutor'),
        ]);
        if (!cancelled) setBookings([...upcoming, ...history]);
      } catch (error) {
        console.error('Error loading students:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [user]);

  // One row per student, rolled up from their bookings.
  const students = useMemo(() => {
    const byStudent = new Map();

    bookings.forEach((booking) => {
      const key = booking.studentId ?? booking.studentName;
      const existing = byStudent.get(key);

      if (existing) {
        existing.sessions += 1;
        existing.subjects.add(booking.subject);
        if (booking.date > existing.lastSession) existing.lastSession = booking.date;
      } else {
        byStudent.set(key, {
          id: key,
          name: booking.studentName,
          avatar: booking.studentAvatar || booking.studentName?.[0] || 'S',
          sessions: 1,
          subjects: new Set([booking.subject]),
          lastSession: booking.date,
        });
      }
    });

    return Array.from(byStudent.values()).map((student) => ({
      ...student,
      subjects: Array.from(student.subjects),
    }));
  }, [bookings]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return students;

    return students.filter(
      (student) =>
        student.name?.toLowerCase().includes(term) ||
        student.subjects.some((subject) => subject.toLowerCase().includes(term))
    );
  }, [students, query]);

  return (
    <div className="space-y-6 w-full min-w-0">

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">Everyone you teach or are scheduled to teach</p>
        </div>

        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search students or subjects"
            className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        {loading ? (
          <LoadingSkeleton type="text" count={3} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon="👥"
            title={students.length === 0 ? 'No students yet' : 'No matching students'}
            description={
              students.length === 0
                ? 'Students appear here once they book a session with you.'
                : 'Try a different name or subject.'
            }
          />
        ) : (
          <div className="space-y-3">
            {visible.map((student) => (
              <div
                key={student.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-primary-600 font-semibold">
                    {student.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{student.name}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {student.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-600"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {student.sessions} session{student.sessions === 1 ? '' : 's'}
                    </p>
                    <p className="text-xs text-gray-500">Last: {student.lastSession}</p>
                  </div>

                  <Link
                    to="/messages"
                    className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-primary-600 transition-colors"
                    title="Message student"
                  >
                    <FaComment className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;
