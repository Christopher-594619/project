import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';

const SearchBar = ({ 
  placeholder = 'Search...', 
  onSearch, 
  className = '',
  value = '',
  ...props 
}) => {
  const [query, setQuery] = useState(value);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all outline-none placeholder:text-gray-400"
          {...props}
        />
      </div>
    </form>
  );
};

export default SearchBar;