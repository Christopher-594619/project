import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash, FaMapMarkerAlt, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { tutorService } from '../../services/tutorService';
import GetLocationButton from './components/GetLocationButton';

const NOTIFICATION_PREFS_KEY = 'tutorNotificationPrefs';

const DEFAULT_PREFS = {
  bookingRequests: true,
  messages: true,
  reviews: true,
  payouts: false,
};

const PREF_LABELS = {
  bookingRequests: 'New booking requests',
  messages: 'New messages from students',
  reviews: 'New reviews on my profile',
  payouts: 'Payout confirmations',
};

const Settings = () => {
  const { user, profile, refreshUser, logout } = useAuth();
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [visibilitySaving, setVisibilitySaving] = useState(false);

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

  // /api/users/me returns the raw column (1/0); the tutor endpoints return isActive.
  const rawActive = profile?.isActive ?? profile?.is_active;
  const isListed = rawActive === undefined || rawActive === null ? true : Boolean(Number(rawActive));

  const toggleVisibility = async () => {
    setVisibilitySaving(true);

    try {
      const formData = new FormData();
      formData.append('is_active', isListed ? '0' : '1');

      await tutorService.updateTutorProfile(formData);
      await refreshUser();

      toast.success(isListed ? 'Your profile is now hidden' : 'Your profile is live again');
    } catch (error) {
      toast.error(error.message || 'Could not update your visibility');
    } finally {
      setVisibilitySaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0">

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and how you appear to students</p>
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
            <dd className="text-gray-900 font-medium mt-0.5 capitalize">{user?.role || 'tutor'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Verification</dt>
            <dd className="mt-0.5">
              {profile?.verified ? (
                <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Verified</span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700">Pending review</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Member since</dt>
            <dd className="text-gray-900 font-medium mt-0.5">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
            </dd>
          </div>
        </dl>
      </div>

      {/* Visibility */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Profile visibility</h2>
        <p className="text-sm text-gray-500 mb-4">
          {isListed
            ? 'Your profile appears in search results and students can book you.'
            : 'Your profile is hidden from search. Existing bookings are unaffected.'}
        </p>

        <button
          type="button"
          onClick={toggleVisibility}
          disabled={visibilitySaving}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isListed
              ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {isListed ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
          {visibilitySaving
            ? 'Saving...'
            : isListed
              ? 'Hide my profile from search'
              : 'Make my profile visible'}
        </button>
      </div>

      {/* Location */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <FaMapMarkerAlt className="text-primary-500" />
          Location
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Students search by distance, so keep this current if you teach in person.
          {profile?.location ? ` Listed area: ${profile.location}.` : ''}
        </p>

        <GetLocationButton />
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
