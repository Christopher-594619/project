import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaHome,
  FaCalendarAlt,
  FaBook,
  FaHeart,
  FaComment,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaUsers,
  FaMoneyBillWave,
  FaArrowUp
} from 'react-icons/fa';
import GetLocationButton from '../../pages/TutorDashboard/components/GetLocationButton';

const DashboardSidebar = ({ userType }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const studentLinks = [
    { to: '/dashboard/student', icon: FaHome, label: 'Overview' },
    { to: '/dashboard/student/lessons', icon: FaCalendarAlt, label: 'My Lessons' },
    { to: '/search', icon: FaBook, label: 'Find Tutors' },
    { to: '/dashboard/student/saved', icon: FaHeart, label: 'Saved Tutors' },
    { to: '/messages', icon: FaComment, label: 'Messages' },
    { to: '/dashboard/student/profile', icon: FaUser, label: 'Profile' },
    { to: '/dashboard/student/settings', icon: FaCog, label: 'Settings' },
    { to: '/dashboard/student/become-tutor', icon: FaArrowUp, label: 'Become a Tutor' },
  ];

  const tutorLinks = [
    { to: '/dashboard/tutor', icon: FaHome, label: 'Overview' },
    { to: '/dashboard/tutor/bookings', icon: FaCalendarAlt, label: 'Bookings' },
    { to: '/dashboard/tutor/earnings', icon: FaMoneyBillWave, label: 'Earnings' },
    { to: '/dashboard/tutor/students', icon: FaUsers, label: 'Students' },
    { to: '/messages', icon: FaComment, label: 'Messages' },
    { to: '/dashboard/tutor/profile', icon: FaUser, label: 'Profile' },
    { to: '/dashboard/tutor/settings', icon: FaCog, label: 'Settings' },
  ];

  const links = userType === 'tutor' ? tutorLinks : studentLinks;

  return (
    <aside className="w-64 min-w-64 flex-shrink-0 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto overflow-x-hidden hidden md:block">
      <div className="p-6 min-w-0">

        {/* User */}
        <div className="flex items-center gap-3 mb-8 min-w-0">
          <div className="w-10 h-10 min-w-10 flex-shrink-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold overflow-hidden">
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              user?.email?.[0]?.toUpperCase() || 'U'
            )}
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">
              {user?.email || 'User'}
            </p>

            <p className="text-xs text-gray-500 capitalize truncate">
              {userType}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 min-w-0">
          {links.map((link) => {
            const isActive = location.pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                className={`
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
                <link.icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive
                      ? 'text-primary-600'
                      : 'text-gray-400'
                  }`}
                />

                <span className="truncate">
                  {link.label}
                </span>

                {isActive && (
                  <div className="ml-auto w-1.5 min-w-1.5 h-8 flex-shrink-0 bg-primary-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-gray-200 mt-6 pt-6 min-w-0">
          <GetLocationButton />

          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2.5 w-full min-w-0 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <FaSignOutAlt className="w-4 h-4 flex-shrink-0" />

            <span className="truncate">
              Sign Out
            </span>
          </button>
        </div>

      </div>
    </aside>
  );
};

export default DashboardSidebar;