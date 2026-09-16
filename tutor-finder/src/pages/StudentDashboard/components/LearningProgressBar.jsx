import React from 'react';
import { FaBookOpen, FaChartLine } from 'react-icons/fa';
import EmptyState from '../common/EmptyState';

const LearningProgressCards = ({ progress }) => {
  if (!progress || progress.length === 0) {
    return (
      <EmptyState
        icon="📊"
        title="No progress data"
        description="Start learning to track your progress."
      />
    );
  }

  const getColor = (percentage) => {
    if (percentage >= 80) return 'from-green-500 to-emerald-600';
    if (percentage >= 60) return 'from-blue-500 to-indigo-600';
    if (percentage >= 40) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  return (
    <div className="space-y-4">
      {progress.map((item) => (
        <div key={item.subject} className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FaBookOpen className="text-primary-500 w-4 h-4" />
              <span className="font-medium text-gray-900">{item.subject}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{item.progress}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${getColor(item.progress)} rounded-full transition-all duration-1000`}
              style={{ width: `${item.progress}%` }}
            />
          </div>
          <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
            <FaChartLine className="w-3 h-3" />
            {item.progress >= 80 ? 'Excellent progress!' : 
             item.progress >= 60 ? 'Making good progress' :
             item.progress >= 40 ? 'Keep going!' : 'Need more practice'}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LearningProgressCards;