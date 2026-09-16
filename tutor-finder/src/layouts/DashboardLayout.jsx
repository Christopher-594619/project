import React from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { Navigate } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-full min-w-0 overflow-hidden bg-gray-50">
      <DashboardSidebar userType={user.role} />

      <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;