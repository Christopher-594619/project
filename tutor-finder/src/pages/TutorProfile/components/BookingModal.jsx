import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaCalendarAlt, FaClock, FaBookOpen, FaCheckCircle } from 'react-icons/fa';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { formatters } from '../../../utils/formatters';

const API_URL = import.meta.env.VITE_ENDPOINT_URL;

const BookingModal = ({ isOpen, onClose, tutor }) => {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();

  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('60');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bookings state
  const [existingBookings, setExistingBookings] = useState([]);
  const [checkingBookings, setCheckingBookings] = useState(false);

  // ============ FETCH USER'S BOOKINGS WITH THIS TUTOR ============
  useEffect(() => {
    const fetchBookings = async () => {
      if (!isOpen || !tutor || !user || !accessToken) return;

      setCheckingBookings(true);
      try {
        const res = await fetch(`${API_URL}/api/bookings`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load bookings');

        // Filter: this student's bookings with this tutor
        const tutorId = tutor.userId || tutor.id;
        const mine = (data.bookings || []).filter(
          (b) =>
            b.tutorId === tutorId &&
            b.studentId === user.id &&
            (b.status === 'pending' || b.status === 'confirmed')
        );

        setExistingBookings(mine);
      } catch (err) {
        console.error('Error loading existing bookings:', err);
        setExistingBookings([]);
      } finally {
        setCheckingBookings(false);
      }
    };

    fetchBookings();
  }, [isOpen, tutor, user, accessToken]);

  if (!isOpen || !tutor) return null;

  const subjects = Array.isArray(tutor.subjects) ? tutor.subjects : [];

  const availableTimes = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  const durations = [
    { value: '30', label: '30 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to book a session');
      navigate('/login');
      return;
    }
    if (!selectedSubject) {
      toast.error('Please select a subject');
      return;
    }
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }
    if (!selectedTime) {
      toast.error('Please select a time');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          tutorId: tutor.userId || tutor.id,
          subject: selectedSubject,
          date: selectedDate,
          time: selectedTime,
          duration: parseInt(selectedDuration, 10),
          notes,
          price: parseFloat(tutor.price) || 0,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Booking failed');

      toast.success(`Booking confirmed with ${tutor.firstName}!`);
      onClose();
      setSelectedSubject('');
      setSelectedDate('');
      setSelectedTime('');
      setSelectedDuration('60');
      setNotes('');
    } catch (err) {
      console.error('Booking error:', err);
      toast.error(err.message || 'Failed to book session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasExistingBookings = existingBookings.length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-hard max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {hasExistingBookings ? 'Your Bookings' : 'Book a Session'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">with {tutor.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaTimes className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Loading state while checking */}
          {checkingBookings ? (
            <div className="p-6 space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : hasExistingBookings ? (
            /* ============ ALREADY BOOKED VIEW ============ */
            <div className="p-6 space-y-6">
              <div className="flex items-start gap-3 p-4 bg-primary-50 border border-primary-200 rounded-xl">
                <FaCheckCircle className="text-primary-600 w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-primary-900">
                    You've already booked {tutor.name}
                  </p>
                  <p className="text-sm text-primary-700 mt-1">
                    Here are your existing session{existingBookings.length > 1 ? 's' : ''}.
                    You can't book another unless these are cancelled or completed.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {existingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 border border-gray-200 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">
                        {b.subject}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          b.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : b.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : b.status === 'completed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1.5">
                        <FaCalendarAlt className="w-3 h-3 text-primary-500" />
                        {b.date}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <FaClock className="w-3 h-3 text-primary-500" />
                        {b.time} · {b.duration} min
                      </span>
                    </div>

                    {b.notes && (
                      <p className="text-xs text-gray-500 italic">
                        "{b.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full btn-primary py-3"
              >
                Close
              </button>
            </div>
          ) : (
            /* ============ BOOKING FORM ============ */
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Tutor info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-primary-600 font-bold overflow-hidden">
                  {tutor.photo ? (
                    <img
                      src={
                        tutor.photo.startsWith('http')
                          ? tutor.photo
                          : `${API_URL}${tutor.photo.startsWith('/') ? '' : '/'}${tutor.photo}`
                      }
                      alt={tutor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    tutor.name?.[0] || 'T'
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{tutor.name}</p>
                  <p className="text-sm text-gray-500">
                    {subjects.slice(0, 3).join(', ')}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatters.currency(tutor.price)}/hour
                  </p>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaBookOpen className="inline mr-2 text-primary-500" />
                  Select Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a subject...</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
                {subjects.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    This tutor hasn't listed any subjects yet.
                  </p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendarAlt className="inline mr-2 text-primary-500" />
                  Select Date
                </label>
                <input
                  type="date"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaClock className="inline mr-2 text-primary-500" />
                  Select Time
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                        selectedTime === time
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-primary-300 text-gray-600'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {durations.map((dur) => (
                    <option key={dur.value} value={dur.value}>
                      {dur.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Any specific topics you'd like to cover?"
                />
              </div>

              {/* Price Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subject</span>
                  <span className="font-medium">{selectedSubject || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Hourly rate</span>
                  <span className="font-medium">
                    {formatters.currency(tutor.price)}/hour
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">
                    {parseInt(selectedDuration, 10) / 60} hour
                    {parseInt(selectedDuration, 10) > 60 ? 's' : ''}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-medium">
                  <span>Total</span>
                  <span className="text-primary-600">
                    {formatters.currency(
                      ((parseFloat(tutor.price) || 0) *
                        parseInt(selectedDuration, 10)) /
                        60
                    )}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 btn-secondary py-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;