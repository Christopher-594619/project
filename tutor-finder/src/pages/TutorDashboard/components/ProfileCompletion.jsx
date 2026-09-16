import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

const ProfileCompletion = ({ profile }) => {
  const sections = [
    { id: 'photo', label: 'Profile Photo', completed: profile?.photo || false },
    { id: 'bio', label: 'Bio', completed: profile?.bio || false },
    { id: 'subjects', label: 'Subjects', completed: profile?.subjects?.length > 0 || false },
    { id: 'availability', label: 'Availability', completed: profile?.availability?.length > 0 || false },
    { id: 'experience', label: 'Experience', completed: profile?.experience || false },
    { id: 'education', label: 'Education', completed: profile?.education?.length > 0 || false },
    { id: 'pricing', label: 'Pricing', completed: profile?.price || false },
    { id: 'qualifications', label: 'Qualifications', completed: profile?.qualifications?.length > 0 || false },
  ];

  const completedCount = sections.filter(s => s.completed).length;
  const totalCount = sections.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">Profile Completion</p>
          <p className="text-sm text-gray-500">{completedCount} of {totalCount} sections complete</p>
        </div>
        <span className="text-2xl font-bold text-primary-600">{percentage}%</span>
      </div>

      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
        {sections.map((section) => (
          <div key={section.id} className="flex items-center gap-1.5 text-xs">
            {section.completed ? (
              <FaCheck className="text-green-500 w-3 h-3" />
            ) : (
              <FaTimes className="text-red-400 w-3 h-3" />
            )}
            <span className={section.completed ? 'text-gray-600' : 'text-gray-400'}>
              {section.label}
            </span>
          </div>
        ))}
      </div>

      {percentage < 100 && (
        <div className="mt-2 p-3 bg-primary-50 rounded-lg border border-primary-100">
          <p className="text-sm text-primary-700">
            Complete your profile to get more student requests!
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletion;