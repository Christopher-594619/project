import React from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaClock } from 'react-icons/fa';
import EmptyState from '../common/EmptyState';

const RecentSearches = ({ searches }) => {
  if (!searches || searches.length === 0) {
    return (
      <EmptyState
        icon="🔍"
        title="No recent searches"
        description="Your recent searches will appear here."
      />
    );
  }

  return (
    <div className="space-y-2">
      {searches.map((search, index) => (
        <Link
          key={index}
          to={`/search?q=${encodeURIComponent(search.query)}`}
          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
        >
          <FaSearch className="text-gray-400 group-hover:text-primary-500 transition-colors w-4 h-4" />
          <span className="flex-1 text-gray-700">{search.query}</span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <FaClock className="w-3 h-3" />
            {search.timestamp}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default RecentSearches;