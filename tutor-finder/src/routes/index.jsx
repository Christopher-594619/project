import React from 'react';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import TutorDashboardLayout from '../layouts/TutorDashboardLayout';
import AdminDashboardLayout from '../layouts/AdminDashboardLayout';
import Landing from '../pages/Landing/Landing';
import Search from '../pages/Search/Search';
import TutorProfile from '../pages/TutorProfile/TutorProfile';
import StudentDashboard from '../pages/StudentDashboard/StudentDashboard';
import TutorDashboard from '../pages/TutorDashboard/TutorDashboard';
import TutorBookings from '../pages/TutorDashboard/Bookings';
import TutorEarnings from '../pages/TutorDashboard/Earnings';
import TutorStudents from '../pages/TutorDashboard/Students';
import TutorProfileSettings from '../pages/TutorDashboard/Profile';
import TutorSettings from '../pages/TutorDashboard/Settings';
import AdminDashboard from '../pages/AdminDashboard/AdminDashboard';
import AdminStudents from '../pages/AdminDashboard/Students';
import AdminTutors from '../pages/AdminDashboard/Tutors';
import AdminBookings from '../pages/AdminDashboard/Bookings';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import Messages from '../pages/Messages/Messages';
import BecomeTutor from '../pages/StudentDashboard/components/BecomeTutor';

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
    element: (
        <Login />
    ),
  },
  {
    path: '/register',
    element: (
        <Register />
    ),
  },
  {
    path: '/forgot-password',
    element: (
        <ForgotPassword />
    ),
  },
  {
    path: '/dashboard/student',
    element: (
      <DashboardLayout>
        <StudentDashboard />
      </DashboardLayout>
    ),
  },
  {
    path: '/dashboard/student/become-tutor',
    element: (
      <DashboardLayout>
        <BecomeTutor />
      </DashboardLayout>
    ),
  },
  {
    path: '/dashboard/tutor',
    element: (
      <TutorDashboardLayout>
        <TutorDashboard />
      </TutorDashboardLayout>
    ),
  },
  {
    path: '/dashboard/tutor/bookings',
    element: (
      <TutorDashboardLayout>
        <TutorBookings />
      </TutorDashboardLayout>
    ),
  },
  {
    path: '/dashboard/tutor/earnings',
    element: (
      <TutorDashboardLayout>
        <TutorEarnings />
      </TutorDashboardLayout>
    ),
  },
  {
    path: '/dashboard/tutor/students',
    element: (
      <TutorDashboardLayout>
        <TutorStudents />
      </TutorDashboardLayout>
    ),
  },
  {
    path: '/dashboard/tutor/profile',
    element: (
      <TutorDashboardLayout>
        <TutorProfileSettings />
      </TutorDashboardLayout>
    ),
  },
  {
    path: '/dashboard/tutor/settings',
    element: (
      <TutorDashboardLayout>
        <TutorSettings />
      </TutorDashboardLayout>
    ),
  },
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
    path: '/messages',
    element: (
      <MainLayout>
        <Messages />
      </MainLayout>
    ),
  },
];