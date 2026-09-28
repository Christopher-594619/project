import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaHome,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaSignOutAlt,
  FaTimes,
  FaShieldAlt,
} from 'react-icons/fa';

const adminLinks = [
  { to: '/dashboard/admin', icon: FaHome, label: 'Overview', end: true },
  { to: '/dashboard/admin/students', icon: FaUserGraduate, label: 'Students' },
  { to: '/dashboard/admin/tutors', icon: FaChalkboardTeacher, label: 'Tutors' },
  { to: '/dashboard/admin/bookings', icon: FaCalendarAlt, label: 'Bookings' },
];

const AdminSidebar = ({ onNavigate = null, showClose = false }) => {
  const { user, logout } = useAuth();

  const displayName = user?.name || user?.email || 'Admin';

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

      {/* Admin identity */}
      <div className="flex items-center gap-3 mb-8 min-w-0">
        <div className="w-10 h-10 min-w-10 flex-shrink-0 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center text-white font-bold">
          {displayName[0]?.toUpperCase() || 'A'}
        </div>

        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{displayName}</p>
          <div className="flex items-center gap-1.5">
            <FaShieldAlt className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-500">Administrator</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 min-w-0">
        {adminLinks.map((link) => (
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
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <link.icon
                  className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`}
                />
                <span className="truncate">{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-gray-200 mt-6 pt-6 min-w-0">
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

export default AdminSidebar;
