import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-soft border border-gray-100 p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;