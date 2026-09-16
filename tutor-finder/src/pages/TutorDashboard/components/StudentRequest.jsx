import React, { useState } from 'react';
import { FaUser, FaCalendarAlt, FaClock, FaCheck, FaTimes, FaComment } from 'react-icons/fa';
import EmptyState from '../common/EmptyState';
import toast from 'react-hot-toast';

const StudentRequests = () => {
  const [requests, setRequests] = useState([
    {
      id: 1,
      studentName: 'Emma Wilson',
      studentAvatar: 'EW',
      subject: 'Chemistry',
      level: 'High School',
      date: '2024-01-25',
      time: '10:00 AM',
      message: 'Looking for help with organic chemistry concepts.',
      status: 'pending',
    },
    {
      id: 2,
      studentName: 'David Kim',
      studentAvatar: 'DK',
      subject: 'Mathematics',
      level: 'College',
      date: '2024-01-26',
      time: '2:00 PM',
      message: 'Need help with calculus derivatives and integrals.',
      status: 'pending',
    },
  ]);

  const handleAccept = (id) => {
    toast.success('Request accepted!');
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const handleDecline = (id) => {
    toast.success('Request declined');
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  if (requests.length === 0) {
    return (
      <EmptyState
        icon="📨"
        title="No pending requests"
        description="You don't have any student requests at the moment."
      />
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-medium transition-all">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-primary-600 font-semibold flex-shrink-0">
              {request.studentAvatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <p className="font-semibold text-gray-900">{request.studentName}</p>
                  <p className="text-sm text-gray-500">{request.subject} • {request.level}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(request.id)}
                    className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    title="Accept"
                  >
                    <FaCheck className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDecline(request.id)}
                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    title="Decline"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{request.message}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <FaCalendarAlt className="w-3 h-3" />
                  {request.date}
                </span>
                <span className="flex items-center gap-1">
                  <FaClock className="w-3 h-3" />
                  {request.time}
                </span>
                <button className="flex items-center gap-1 text-primary-600 hover:text-primary-700 transition-colors">
                  <FaComment className="w-3 h-3" />
                  Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentRequests;