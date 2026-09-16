import React from 'react';

const SubjectTags = ({ subjects, className = '' }) => {
  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-red-100 text-red-800',
    'bg-indigo-100 text-indigo-800',
    'bg-teal-100 text-teal-800',
  ];

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {subjects.map((subject, index) => (
        <span
          key={index}
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[index % colors.length]}`}
        >
          {subject}
        </span>
      ))}
    </div>
  );
};

export default SubjectTags;