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
      <DashboardLayout>
        <TutorDashboard />
      </DashboardLayout>
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