import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaSearch, FaBan } from 'react-icons/fa';
import { adminService } from '../../services/adminService';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const statusColor = (status) => {
  switch (status) {
    case 'confirmed': return 'bg-green-100 text-green-700';
    case 'pending': return 'bg-yellow-100 text-yellow-700';
    case 'completed': return 'bg-blue-100 text-blue-700';
    case 'cancelled': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async (query = '', statusFilter = 'all') => {
    setLoading(true);
    try {
      const data = await adminService.getBookings({ search: query, status: statusFilter, limit: 50 });
      setBookings(data.bookings || []);
    } catch (error) {
      toast.error(error.message || 'Could not load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(search, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    const timer = setTimeout(() => load(search, status), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const cancelBooking = async (booking) => {
    if (!window.confirm(`Cancel the session between ${booking.studentName} and ${booking.tutorName}?`)) {
      return;
    }

    setBusyId(booking.id);
    try {
      await adminService.setBookingStatus(booking.id, 'cancelled');
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, status: 'cancelled' } : b)));
      toast.success('Booking cancelled');
    } catch (error) {
      toast.error(error.message || 'Could not cancel this booking');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0">

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-1">Every session booked across the platform</p>
        </div>

        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, tutor or subject"
            className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatus(f.key)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              status === f.key
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        {loading ? (
          <LoadingSkeleton type="text" count={4} />
        ) : bookings.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No bookings found"
            description={search ? 'Try a different search term.' : 'No sessions have been booked yet.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="py-2 pr-4 font-medium">Student</th>
                  <th className="py-2 pr-4 font-medium">Tutor</th>
                  <th className="py-2 pr-4 font-medium">Subject</th>
                  <th className="py-2 pr-4 font-medium">When</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium text-right">Amount</th>
                  <th className="py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4 text-gray-900">{booking.studentName}</td>
                    <td className="py-3 pr-4 text-gray-900">{booking.tutorName}</td>
                    <td className="py-3 pr-4 text-gray-600">{booking.subject}</td>
                    <td className="py-3 pr-4 text-gray-600">
                      {booking.date} · {booking.time} ({booking.duration}m)
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right font-semibold text-gray-900">
                      K{booking.totalAmount}
                    </td>
                    <td className="py-3 text-right">
                      {['pending', 'confirmed'].includes(booking.status) && (
                        <button
                          onClick={() => cancelBooking(booking)}
                          disabled={busyId === booking.id}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                          title="Cancel booking"
                        >
                          <FaBan className="w-4 h-4" />
                        </button>
                      )}
                    </td>
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

export default Bookings;
