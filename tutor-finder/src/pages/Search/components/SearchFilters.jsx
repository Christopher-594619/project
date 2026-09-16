import React, { useState } from 'react';
import { 
  SUBJECTS, 
  LEVELS, 
  MODE_OPTIONS, 
  DISTANCE_OPTIONS, 
  RATING_OPTIONS,
  PRICE_RANGES 
} from '../../../utils/constants';
import { FiX } from 'react-icons/fi';

const SearchFilters = ({ filters, onFilterChange, onClear }) => {
  const [expandedSections, setExpandedSections] = useState({
    subject: true,
    level: true,
    mode: true,
    distance: true,
    price: true,
    rating: true,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'priceRange') return value[0] !== 0 || value[1] !== 200;
    if (key === 'distance') return value !== 10;
    if (key === 'rating') return value !== 0;
    return value && value !== '';
  }).length;

  const FilterSection = ({ title, section, children }) => (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between text-left"
      >
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="text-gray-400 text-sm">
          {expandedSections[section] ? '−' : '+'}
        </span>
      </button>
      {expandedSections[section] && (
        <div className="mt-3 space-y-3">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        {activeFiltersCount > 0 && (
          <button
            onClick={onClear}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            <FiX className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      <FilterSection title="Subject" section="subject">
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((subject) => (
            <button
              key={subject}
              onClick={() => onFilterChange('subject', subject === filters.subject ? '' : subject)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${filters.subject === subject
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {subject}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Level" section="level">
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => onFilterChange('level', level === filters.level ? '' : level)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${filters.level === level
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {level}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Mode" section="mode">
        <div className="flex flex-wrap gap-2">
          {MODE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onFilterChange('mode', option.value === filters.mode ? '' : option.value)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${filters.mode === option.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </FilterSection>
{/* 
      <FilterSection title="Distance" section="distance">
        <select
          value={filters.distance}
          onChange={(e) => onFilterChange('distance', Number(e.target.value))}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {DISTANCE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FilterSection> */}

      <FilterSection title="Price Range" section="price">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs text-gray-500">Min</label>
              <input
                type="number"
                value={filters.priceRange[0]}
                onChange={(e) => onFilterChange('priceRange', [Number(e.target.value), filters.priceRange[1]])}
                className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="0"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500">Max</label>
              <input
                type="number"
                value={filters.priceRange[1]}
                onChange={(e) => onFilterChange('priceRange', [filters.priceRange[0], Number(e.target.value)])}
                className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="0"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRICE_RANGES.map((range, index) => (
              <button                key={index}
                onClick={() => onFilterChange('priceRange', [range.min, range.max])}
                className={`
                  px-2 py-1 text-xs rounded-lg transition-all
                  ${filters.priceRange[0] === range.min && filters.priceRange[1] === range.max
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Minimum Rating" section="rating">
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={filters.rating}
            onChange={(e) => onFilterChange('rating', Number(e.target.value))}
            className="w-full accent-primary-600"
          />
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">0 stars</span>
            <span className="font-medium text-primary-600">{filters.rating} stars</span>
            <span className="text-gray-500">5 stars</span>
          </div>
        </div>
      </FilterSection>

      {/* Active filters summary */}
      {activeFiltersCount > 0 && (
        <div className="pt-4 border-t border-gray-100 mt-4">
          <p className="text-sm text-gray-500">
            {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;