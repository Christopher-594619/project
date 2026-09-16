import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProfileHeader from './components/ProfileHeader';
import ProfileInfo from './components/ProfileInfo';
import ReviewsSection from './components/ReviewsSection';
import BookingModal from './components/BookingModal';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import { tutorService } from '../../services/tutorService';

const TutorProfile = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);

    const { user } = useAuth();

  useEffect(() => {
    const loadTutor = async () => {
      setLoading(true);
      try {
        const data = await tutorService.getTutorById(id);
        setTutor(data);
      } catch (error) {
        console.error('Error loading tutor:', error);
        setTutor(null);
      } finally {
        setLoading(false);
      }
    };
    loadTutor();
  }, [id]);

  useEffect(() => {
    // Check if we should open booking modal from URL
    const params = new URLSearchParams(location.search);
    if (params.get('book') === 'true') {
      setShowBookingModal(true);
    }
  }, [location]);

  const handleBookSession = () => {
    if (!user) {
      navigate('/login', { state: { from: `/tutor/${id}` } });
      return;
    }
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSkeleton type="profile" />
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmptyState
          icon="😕"
          title="Tutor Not Found"
          description="The tutor you're looking for doesn't exist or has been removed."
          action={
            <button
              onClick={() => navigate('/search')}
              className="btn-primary"
            >
              Find Other Tutors
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Profile Header */}
          <ProfileHeader 
            tutor={tutor} 
            onBookSession={handleBookSession}
          />

          {/* Profile Info */}
          <ProfileInfo tutor={tutor} />

          {/* Reviews Section */}
          <ReviewsSection 
            reviews={tutor.reviews || []} 
            tutorId={tutor.id}
            onReviewAdded={() => {
              // Refresh reviews
              tutorService.getTutorById(id).then(setTutor);
            }}
          />
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        tutor={tutor}
      />
    </div>
  );
};

export default TutorProfile;