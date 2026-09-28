import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/dashboard/AdminSidebar';

const AdminDashboardLayout = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

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

  // The admin dashboard is admin-only - everyone else gets sent to their own area.
  if (user.role !== 'admin') {
    return (
      <Navigate to={user.role === 'tutor' ? '/dashboard/tutor' : '/dashboard/student'} replace />
    );
  }

  return (
    <div className="flex h-screen w-full min-w-0 overflow-hidden bg-gray-50">

      {/* Desktop sidebar */}
      <aside className="w-64 min-w-64 flex-shrink-0 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto overflow-x-hidden hidden md:block">
        <AdminSidebar />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[85%] bg-white border-r border-gray-200 overflow-y-auto">
            <AdminSidebar showClose onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">

        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-30 flex items-center gap-3 bg-white border-b border-gray-200 px-4 py-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
            aria-label="Open menu"
          >
            <FaBars className="w-5 h-5" />
          </button>
          <span className="font-semibold text-gray-900">Admin Dashboard</span>
        </div>

        <div className="w-full max-w-7xl mx-auto p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
