// src/pages/Landing/components/FeaturedTutors.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tutorService } from '../../../services/tutorService';
import TutorCard from '../../../components/common/TutorCard';
import LoadingSkeleton from '../../../components/common/LoadingSkeleton';
import EmptyState from '../../../components/common/EmptyState';

const FeaturedTutors = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTutors = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await tutorService.getTutors();
        setTutors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading tutors:', err);
        setError(err.message || 'Failed to load tutors');
        setTutors([]);
      } finally {
        setLoading(false);
      }
    };

    loadTutors();
  }, []);

  return (
    <section className="py-10 md:py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <LoadingSkeleton key={i} type="card" />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon="⚠️"
            title="Couldn't load tutors"
            description={error}
          />
        ) : tutors.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No tutors yet"
            description="Check back soon — tutors are being added every day."
          />
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutors.map((tutor) => (
                <TutorCard key={tutor.id} tutor={tutor} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                to="/search"
                className="btn-primary inline-flex items-center gap-2"
              >
                View All Tutors
                <span className="text-sm">→</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedTutors;