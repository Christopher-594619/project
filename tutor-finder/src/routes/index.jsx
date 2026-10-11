import React from 'react';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminDashboardLayout from '../layouts/AdminDashboardLayout';

import Landing from '../pages/Landing/Landing';
import Search from '../pages/Search/Search';
import TutorProfile from '../pages/TutorProfile/TutorProfile';

import StudentDashboard from '../pages/StudentDashboard/StudentDashboard';
import TutorDashboard from '../pages/TutorDashboard/TutorDashboard';

import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ForgotPassword from '../pages/Auth/ForgotPassword';

import BecomeTutor from '../pages/StudentDashboard/components/BecomeTutor';
import StudentProfileEdit from '../pages/StudentDashboard/components/updateProfile';

import TutorBookings from '../pages/TutorDashboard/components/bookings';
import TutorProfileEdit from '../pages/TutorDashboard/components/tutorProfileUpdate';
import Messages from '../pages/TutorDashboard/components/messages';
import ChatList from '../pages/TutorDashboard/components/ChatList';

import AdminDashboard from '../pages/AdminDashboard/AdminDashboard';
import AdminStudents from '../pages/AdminDashboard/Students';
import AdminTutors from '../pages/AdminDashboard/Tutors';
import AdminBookings from '../pages/AdminDashboard/Bookings';
import AdminAdmins from '../pages/AdminDashboard/Admins';

export const routes = [
  {
    path: '/',
    element: (
      <MainLayout>
        <Landing />
      </MainLayout>
    ),
  },
  {
    path: '/search',
    element: (
      <MainLayout>
        <Search />
      </MainLayout>
    ),
  },
  {
    path: '/tutor/:id',
    element: (
      <MainLayout>
        <TutorProfile />
      </MainLayout>
    ),
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },

  // Student Dashboard
  {
    path: '/dashboard/student',
    element: (
      <DashboardLayout requiredRole="student">
        <StudentDashboard />
      </DashboardLayout>
    ),
  },
  {
    path: '/dashboard/student/become-tutor',
    element: (
      <DashboardLayout requiredRole="student">
        <BecomeTutor />
      </DashboardLayout>
    ),
  },
  {
    path: '/dashboard/student/settings',
    element: (
      <MainLayout>
        <StudentProfileEdit />
      </MainLayout>
    ),
  },

  // Tutor Dashboard
  {
    path: '/dashboard/tutor',
    element: (
      <DashboardLayout requiredRole="tutor">
        <TutorDashboard />
      </DashboardLayout>
    ),
  },
  {
    path: '/dashboard/tutor/bookings',
    element: (
      <MainLayout>
        <TutorBookings />
      </MainLayout>
    ),
  },
  {
    path: '/dashboard/tutor/settings',
    element: (
      <MainLayout>
        <TutorProfileEdit />
      </MainLayout>
    ),
  },

  // Admin Dashboard
  {
    path: '/dashboard/admin',
    element: (
      <AdminDashboardLayout>
        <AdminDashboard />
      </AdminDashboardLayout>
    ),
  },
  {
    path: '/dashboard/admin/students',
    element: (
      <AdminDashboardLayout>
        <AdminStudents />
      </AdminDashboardLayout>
    ),
  },
  {
    path: '/dashboard/admin/tutors',
    element: (
      <AdminDashboardLayout>
        <AdminTutors />
      </AdminDashboardLayout>
    ),
  },
  {
    path: '/dashboard/admin/bookings',
    element: (
      <AdminDashboardLayout>
        <AdminBookings />
      </AdminDashboardLayout>
    ),
  },
  {
    path: '/dashboard/admin/admins',
    element: (
      <AdminDashboardLayout>
        <AdminAdmins />
      </AdminDashboardLayout>
    ),
  },

  // Chat
  {
    path: '/chat/:chatId',
    element: (
      <MainLayout>
        <Messages />
      </MainLayout>
    ),
  },
  {
    path: '/messages',
    element: (
      <MainLayout>
        <ChatList />
      </MainLayout>
    ),
  },
];