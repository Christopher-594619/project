import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import { FaCalendarAlt, FaHeart, FaSearch, FaBell, FaBookOpen } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { mockStudentData } from '../../data/students';
import EmptyState from '../../components/common/EmptyState';
import StatsCard from '../../components/dashboard/StatsCard';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { notifications } = useNotification();

  const favorites = [0]

  const stats = [
    {
      title: 'Upcoming Lessons',
      value: mockStudentData.upcomingLessons.filter(l => l.status === 'confirmed').length,
      icon: FaCalendarAlt,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'Saved Tutors',
      value: 10,
      icon: FaHeart,
      color: 'text-red-600 bg-red-100',
    },
    {
      title: 'Recent Searches',
      value: mockStudentData.recentSearches.length,
      icon: FaSearch,
      color: 'text-green-600 bg-green-100',
    },
    {
      title: 'Notifications',
      value: notifications.filter(n => !n.read).length,
      icon: FaBell,
      color: 'text-purple-600 bg-purple-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0] || 'Student'}!
        </h1>
        <p className="text-gray-600 mt-1">Here's an overview of your learning journey</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Upcoming Lessons */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FaCalendarAlt className="text-primary-500" />
            Upcoming Lessons
          </h2>
          <Link to="/dashboard/student/lessons" className="text-sm text-primary-600 hover:text-primary-700">
            View all
          </Link>
        </div>
        {mockStudentData.upcomingLessons.length > 0 ? (
          <div className="space-y-3">
            {mockStudentData.upcomingLessons.slice(0, 3).map((lesson) => (
              <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">{lesson.tutorName}</p>
                  <p className="text-sm text-gray-500">{lesson.subject}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{lesson.date}</p>
                  <p className="text-xs text-gray-500">{lesson.time} • {lesson.duration}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="📅"
            title="No upcoming lessons"
            description="Start your learning journey by booking a session with a tutor."
            action={
              <Link to="/search" className="btn-primary text-sm">
                Find a Tutor
              </Link>
            }
          />
        )}
      </div>

      {/* Learning Progress */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Saved Tutors */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaHeart className="text-red-500" />
            Saved Tutors
          </h2>
          {favorites?.length > 0 ? (
            <div className="space-y-2">
              {favorites?.slice(0, 3).map((tutorId) => (
                <div key={tutorId} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <span className="text-sm text-gray-700">Tutor #{tutorId}</span>
                  <Link to={`/tutor/${tutorId}`} className="text-xs text-primary-600 hover:text-primary-700">
                    View Profile
                  </Link>
                </div>
              ))}
              {favorites?.length > 3 && (
                <Link to="/dashboard/student/saved" className="text-sm text-primary-600 hover:text-primary-700 block text-center">
                  View all saved tutors
                </Link>
              )}
            </div>
          ) : (
            <EmptyState
              icon="❤️"
              title="No saved tutors"
              description="Save tutors you're interested in to find them easily later."
            />
          )}
        </div>

        {/* Learning Progress */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaBookOpen className="text-primary-500" />
            Learning Progress
          </h2>
          {mockStudentData.learningProgress.length > 0 ? (
            <div className="space-y-4">
              {mockStudentData.learningProgress.map((progress) => (
                <div key={progress.subject}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{progress.subject}</span>
                    <span className="font-medium text-gray-900">{progress.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-1000"
                      style={{ width: `${progress.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="📊"
              title="No progress data"
              description="Start learning to track your progress."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;