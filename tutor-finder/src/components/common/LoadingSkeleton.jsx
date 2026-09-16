import React from 'react';

const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  if (type === 'card') {
    return Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white rounded-2xl shadow-soft overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
        <div className="p-5 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
          <div className="flex justify-between pt-3 border-t border-gray-100">
            <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    ));
  }

  if (type === 'profile') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex-1 space-y-3">
            <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'text') {
    return Array.from({ length: count }).map((_, index) => (
      <div key={index} className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      </div>
    ));
  }

  return null;
};

export default LoadingSkeleton;