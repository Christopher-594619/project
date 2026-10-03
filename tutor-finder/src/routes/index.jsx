import React from 'react';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import Landing from '../pages/Landing/Landing';
import Search from '../pages/Search/Search';
import TutorProfile from '../pages/TutorProfile/TutorProfile';
import StudentDashboard from '../pages/StudentDashboard/StudentDashboard';
import TutorDashboard from '../pages/TutorDashboard/TutorDashboard';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import BecomeTutor from '../pages/StudentDashboard/components/BecomeTutor';
import TutorBookings from '../pages/TutorDashboard/components/bookings';
import StudentProfileEdit from '../pages/StudentDashboard/components/updateProfile';
import TutorProfileEdit from '../pages/TutorDashboard/components/tutorProfileUpdate';
import Messages from '../pages/TutorDashboard/components/messages';
import ChatList from '../pages/TutorDashboard/components/ChatList';

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
      <DashboardLayout>
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
    path: '/dashboard/student/settings',
    element: (
      <MainLayout>
        <StudentProfileEdit />
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
