import React from 'react';

const AvailabilityBadge = ({ availability, className = '' }) => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const isAvailableToday = availability?.includes(today);

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={`w-2 h-2 rounded-full ${isAvailableToday ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
      <span className="text-xs font-medium text-gray-700">
        {isAvailableToday ? 'Today' : 'This week'}
      </span>
    </span>
  );
};

export default AvailabilityBadge;