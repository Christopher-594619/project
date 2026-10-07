import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { FaSignOutAlt, FaChalkboardTeacher } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const NOTIFICATION_PREFS_KEY = 'studentNotificationPrefs';

const DEFAULT_PREFS = {
  bookingUpdates: true,
  messages: true,
  reminders: true,
};

const PREF_LABELS = {
  bookingUpdates: 'Booking confirmations and cancellations',
  messages: 'New messages from tutors',
  reminders: 'Lesson reminders',
};

const Settings = () => {
  const { user, logout } = useAuth();
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);

  // Notification preferences are a per-device choice, so they live in localStorage.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATION_PREFS_KEY);
      if (stored) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(stored) });
    } catch {
      // A corrupt entry just falls back to the defaults.
    }
  }, []);

  const togglePref = (key) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);

    try {
      localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(next));
    } catch {
      toast.error('Could not save that preference on this device');
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account</p>
      </div>

      {/* Account */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>

        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Email</dt>
            <dd className="text-gray-900 font-medium mt-0.5 break-all">{user?.email || '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Account type</dt>
            <dd className="text-gray-900 font-medium mt-0.5 capitalize">{user?.role || 'student'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Member since</dt>
            <dd className="text-gray-900 font-medium mt-0.5">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
            </dd>
          </div>
        </dl>

        <Link
          to="/dashboard/student/profile"
          className="inline-block mt-4 text-sm text-primary-600 hover:text-primary-700"
        >
          Edit personal details →
        </Link>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Notifications</h2>
        <p className="text-sm text-gray-500 mb-4">These preferences are saved on this device.</p>

        <div className="space-y-3">
          {Object.keys(PREF_LABELS).map((key) => (
            <label key={key} className="flex items-center justify-between gap-4 cursor-pointer">
              <span className="text-sm text-gray-700">{PREF_LABELS[key]}</span>

              <input
                type="checkbox"
                checked={prefs[key]}
                onChange={() => togglePref(key)}
                className="w-4 h-4 accent-primary-600 cursor-pointer"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Become a tutor */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Teach on TutorFinder</h2>
        <p className="text-sm text-gray-500 mb-4">Apply to become a tutor and start taking bookings.</p>

        <Link
          to="/dashboard/student/become-tutor"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
        >
          <FaChalkboardTeacher className="w-4 h-4" />
          Become a tutor
        </Link>
      </div>

      {/* Session */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Session</h2>

        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
        >
          <FaSignOutAlt className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Settings;
