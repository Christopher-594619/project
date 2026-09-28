import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaHome,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUsers,
  FaComment,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaSearch,
  FaTimes,
} from 'react-icons/fa';
import GetLocationButton from '../../pages/TutorDashboard/components/GetLocationButton';

const tutorLinks = [
  { to: '/dashboard/tutor', icon: FaHome, label: 'Overview', end: true },
  { to: '/dashboard/tutor/bookings', icon: FaCalendarAlt, label: 'Bookings' },
  { to: '/dashboard/tutor/earnings', icon: FaMoneyBillWave, label: 'Earnings' },
  { to: '/dashboard/tutor/students', icon: FaUsers, label: 'Students' },
  { to: '/messages', icon: FaComment, label: 'Messages' },
  { to: '/dashboard/tutor/profile', icon: FaUser, label: 'My Profile' },
  { to: '/dashboard/tutor/settings', icon: FaCog, label: 'Settings' },
];

const TutorSidebar = ({ onNavigate = null, showClose = false }) => {
  const { user, profile, logout } = useAuth();

  const displayName = user?.name || user?.email || 'Tutor';

  return (
    <div className="p-6 min-w-0">

      {/* Brand + mobile close */}
      <div className="flex items-center justify-between mb-6 min-w-0">
        <Link to="/" className="font-bold text-gray-900 truncate">
          Tutor<span className="text-primary-600">Finder</span>
        </Link>

        {showClose && (
          <button
            onClick={onNavigate}
            className="p-2 -mr-2 text-gray-500 hover:text-gray-900 md:hidden"
            aria-label="Close menu"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tutor identity */}
      <div className="flex items-center gap-3 mb-8 min-w-0">
        <div className="w-10 h-10 min-w-10 flex-shrink-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold overflow-hidden">
          {user?.profilePic ? (
            <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            displayName[0]?.toUpperCase() || 'T'
          )}
        </div>

        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{displayName}</p>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">Tutor</span>
            {profile?.verified ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                Verified
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                Unverified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 min-w-0">
        {tutorLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={onNavigate}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-2.5
              w-full min-w-0
              rounded-xl text-sm font-medium
              transition-all duration-200
              ${isActive
                ? 'bg-primary-50 text-primary-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <link.icon
                  className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary-600' : 'text-gray-400'}`}
                />

                <span className="truncate">{link.label}</span>

                {isActive && (
                  <div className="ml-auto w-1.5 min-w-1.5 h-8 flex-shrink-0 bg-primary-600 rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-gray-200 mt-6 pt-6 space-y-2 min-w-0">
        <Link
          to="/search"
          onClick={onNavigate}
          className="flex items-center gap-3 px-4 py-2.5 w-full min-w-0 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
        >
          <FaSearch className="w-4 h-4 flex-shrink-0 text-gray-400" />
          <span className="truncate">Browse Tutors</span>
        </Link>

        <GetLocationButton className="w-full" />

        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2.5 w-full min-w-0 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <FaSignOutAlt className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Sign Out</span>
        </button>
      </div>

    </div>
  );
};

export default TutorSidebar;
