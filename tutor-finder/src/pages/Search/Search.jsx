// src/pages/Search/Search.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGeolocation } from '../../hooks/useGeolocation';
import TutorCard from '../../components/common/TutorCard';
import SearchFilters from './components/SearchFilters';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { FaSlidersH } from 'react-icons/fa';
import { tutorService } from '../../services/tutorService';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { location } = useGeolocation();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [tutors, setTutors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    query: searchParams.get('q') || '',
    subject: searchParams.get('subject') || '',
    level: '',
    mode: '',
    distance: 10,
    priceRange: [0, 200],
    rating: 0,
    availability: '',
  });

  // ==================== FETCH TUTORS FROM BACKEND ====================
  const fetchTutors = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await tutorService.getTutors();
      // Backend returns: { success, count, tutors: [...] }
      setTutors(Array.isArray(data) ? data : []);
      console.log(data);
    } catch (err) {
      console.error('Failed to fetch tutors:', err);
      setError(err.message || 'Failed to load tutors');
      setTutors([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTutors();
  }, [fetchTutors]);

  // ==================== CLIENT-SIDE FILTERING ====================
  // Filters are applied client-side against the fetched tutors
  const filteredTutors = useMemo(() => {
    let results = [...tutors];

    // Search query (name, subjects, skills, bio, location)
    if (filters.query) {
      const q = filters.query.toLowerCase();
      results = results.filter(t =>
        t.name?.toLowerCase().includes(q) ||
        t.bio?.toLowerCase().includes(q) ||
        t.location?.toLowerCase().includes(q) ||
        t.subjects?.some(s => s.toLowerCase().includes(q)) ||
        t.skills?.some(s => s.toLowerCase().includes(q))
      );
    }

    // Subject
    if (filters.subject) {
      results = results.filter(t =>
        t.subjects?.some(s =>
          s.toLowerCase().includes(filters.subject.toLowerCase())
        )
      );
    }

    // Level
    if (filters.level) {
      results = results.filter(t => t.levels?.includes(filters.level));
    }

    // Mode
    if (filters.mode) {
      results = results.filter(t =>
        t.mode === filters.mode || t.mode === 'both'
      );
    }

    // Rating
    if (filters.rating > 0) {
      results = results.filter(t => (t.rating || 0) >= filters.rating);
    }

    // Distance
    if (filters.distance && filters.distance !== 0) {
      results = results.filter(t => (t.distance || 0) <= filters.distance);
    }

    // Price range
    const [minPrice, maxPrice] = filters.priceRange || [0, 200];
    results = results.filter(t => {
      const price = parseFloat(t.price) || 0;
      return price >= minPrice && price <= maxPrice;
    });

    // Availability
    if (filters.availability) {
      results = results.filter(t =>
        t.availability?.includes(filters.availability)
      );
    }

    // Sort by rating, then distance
    results.sort((a, b) => {
      if ((b.rating || 0) !== (a.rating || 0)) {
        return (b.rating || 0) - (a.rating || 0);
      }
      return (a.distance || 0) - (b.distance || 0);
    });

    return results;
  }, [tutors, filters]);

  // ==================== HANDLERS ====================
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (query) => {
    setFilters(prev => ({ ...prev, query }));
    if (query) {
      searchParams.set('q', query);
    } else {
      searchParams.delete('q');
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      subject: '',
      level: '',
      mode: '',
      distance: 10,
      priceRange: [0, 200],
      rating: 0,
      availability: '',
    });
    searchParams.delete('q');
    searchParams.delete('subject');
    setSearchParams(searchParams);
  };

  // Count active filters for mobile badge
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'query') return false;
    if (key === 'priceRange') return value[0] !== 0 || value[1] !== 200;
    if (key === 'distance') return value !== 10;
    if (key === 'rating') return value !== 0;
    return value && value !== '';
  }).length;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Your Tutor</h1>
          <p className="text-gray-600 mt-2">
            {isLoading
              ? 'Loading tutors...'
              : `${filteredTutors.length} tutor${filteredTutors.length !== 1 ? 's' : ''} found${location ? ' near you' : ''}`
            }
          </p>
        </div>

        {/* Mobile filter button */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl shadow-soft border border-gray-200 hover:shadow-medium transition-all"
          >
            <FaSlidersH className="text-gray-500" />
            <span className="font-medium">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="ml-auto text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Filters sidebar */}
          <div className={`
            fixed inset-0 z-40 lg:relative lg:inset-auto
            ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 transition-transform duration-300
          `}>
            <div className="bg-white lg:bg-transparent w-80 lg:w-72 h-full overflow-y-auto p-6 lg:p-0">
              <div className="lg:sticky lg:top-8">
                <div className="flex items-center justify-between lg:hidden mb-4">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <SearchFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClear={clearFilters}
                />
              </div>
            </div>
            {/* Overlay */}
            {showMobileFilters && (
              <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden"
                onClick={() => setShowMobileFilters(false)}
              />
            )}
          </div>

          {/* Results */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <LoadingSkeleton key={i} type="card" />
                ))}
              </div>
            ) : error ? (
              <EmptyState
                icon="⚠️"
                title="Failed to load tutors"
                description={error}
                action={
                  <button onClick={fetchTutors} className="btn-primary">
                    Try again
                  </button>
                }
              />
            ) : filteredTutors.length > 0 ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTutors.map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="🔍"
                title="No tutors found"
                description="Try adjusting your filters or search terms to find more tutors."
                action={
                  <button onClick={clearFilters} className="btn-primary">
                    Clear all filters
                  </button>
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;