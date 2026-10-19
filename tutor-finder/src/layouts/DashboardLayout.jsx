import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { Navigate, useLocation } from 'react-router-dom';
import { FaBars, FaComment } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useUnreadMessages } from '../hooks/useUnreadMessages';

const DashboardLayout = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const unreadMessages = useUnreadMessages();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    const destination = user.role === 'tutor'
      ? '/dashboard/tutor'
      : user.role === 'student'
        ? '/dashboard/student'
        : user.role === 'admin'
          ? '/dashboard/admin'
          : '/';
    return <Navigate to={destination} replace />;
  }

  const title = user.role === 'tutor' ? 'Tutor Dashboard' : 'Student Dashboard';

  return (
    <div className="flex h-screen w-full min-w-0 overflow-hidden bg-gray-50">
      {/* Desktop sidebar (hidden on phones) */}
      <DashboardSidebar userType={user.role} />

      {/* Phone menu: slides in from the left */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[85%] shadow-xl">
            <DashboardSidebar
              userType={user.role}
              mobile
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
        {/* Phone top bar with the menu button */}
        <div className="md:hidden sticky top-0 z-30 flex items-center gap-3 bg-white border-b border-gray-200 px-4 py-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
            aria-label="Open menu"
          >
            <FaBars className="w-5 h-5" />
          </button>
          <span className="font-semibold text-gray-900 flex-1 truncate">{title}</span>
          <Link
            to="/messages"
            className="relative p-2 -mr-2 text-gray-600 hover:text-primary-600"
            aria-label={unreadMessages ? `Messages, ${unreadMessages} unread` : 'Messages'}
          >
            <FaComment className="w-5 h-5" />
            {unreadMessages > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            )}
          </Link>
        </div>

        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
