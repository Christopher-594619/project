import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  FaSearch,
  FaBan,
  FaCheckCircle,
  FaTrash,
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
  FaStar,
} from 'react-icons/fa';
import { adminService } from '../../services/adminService';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending verification' },
  { key: 'verified', label: 'Verified' },
  { key: 'suspended', label: 'Suspended' },
];

const Tutors = () => {
  const [tutors, setTutors] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async (query = '', statusFilter = 'all') => {
    setLoading(true);
    try {
      const data = await adminService.getTutors({ search: query, status: statusFilter, limit: 50 });
      setTutors(data.tutors || []);
    } catch (error) {
      toast.error(error.message || 'Could not load tutors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(search, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    const timer = setTimeout(() => load(search, status), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const patchTutor = (id, changes) =>
    setTutors((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t)));

  const toggleVerified = async (tutor) => {
    const next = !tutor.verified;
    setBusyId(tutor.id);
    try {
      await adminService.setTutorVerified(tutor.id, next);
      patchTutor(tutor.id, { verified: next });
      toast.success(next ? 'Tutor verified' : 'Verification revoked');
    } catch (error) {
      toast.error(error.message || 'Could not update verification');
    } finally {
      setBusyId(null);
    }
  };

  const toggleListing = async (tutor) => {
    const next = !tutor.isActive;
    setBusyId(tutor.id);
    try {
      await adminService.setTutorListingActive(tutor.id, next);
      patchTutor(tutor.id, { isActive: next });
      toast.success(next ? 'Listing activated' : 'Listing hidden from search');
    } catch (error) {
      toast.error(error.message || 'Could not update the listing');
    } finally {
      setBusyId(null);
    }
  };

  const toggleSuspend = async (tutor) => {
    const suspend = !tutor.isSuspended;

    if (suspend && !window.confirm(`Suspend ${tutor.email}? They will not be able to log in.`)) {
      return;
    }

    setBusyId(tutor.id);
    try {
      await adminService.setUserSuspended(tutor.userId, suspend);
      patchTutor(tutor.id, {
        isSuspended: suspend,
        isActive: suspend ? false : tutor.isActive,
      });
      toast.success(suspend ? 'Tutor suspended' : 'Tutor reactivated');
    } catch (error) {
      toast.error(error.message || 'Could not update this tutor');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (tutor) => {
    if (!window.confirm(`Permanently delete ${tutor.email}? This removes their profile too.`)) return;

    setBusyId(tutor.id);
    try {
      await adminService.deleteUser(tutor.userId);
      setTutors((prev) => prev.filter((t) => t.id !== tutor.id));
      toast.success('Tutor account deleted');
    } catch (error) {
      toast.error(error.message || 'Could not delete this tutor');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0">

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tutors</h1>
          <p className="text-gray-600 mt-1">Verify, moderate and manage every tutor listing</p>
        </div>

        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone"
            className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatus(f.key)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              status === f.key
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        {loading ? (
          <LoadingSkeleton type="text" count={4} />
        ) : tutors.length === 0 ? (
          <EmptyState
            icon="🔎"
            title="No tutors found"
            description={search ? 'Try a different search term.' : 'No tutors match this filter yet.'}
          />
        ) : (
          <div className="space-y-3">
            {tutors.map((tutor) => (
              <div
                key={tutor.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-primary-600 font-semibold overflow-hidden">
                    {tutor.name?.[0]?.toUpperCase() || tutor.email?.[0]?.toUpperCase() || 'T'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900 truncate">{tutor.name || tutor.email}</p>
                      {tutor.verified && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          <FaShieldAlt className="w-2.5 h-2.5" /> Verified
                        </span>
                      )}
                      {tutor.isSuspended && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Suspended</span>
                      )}
                      {!tutor.isActive && !tutor.isSuspended && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">Hidden</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{tutor.email}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaStar className="w-3 h-3 text-yellow-400" />
                        {tutor.rating || 0} ({tutor.reviewsCount || 0})
                      </span>
                      <span>{tutor.subjects?.slice(0, 2).join(', ') || 'No subjects yet'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <Link
                    to={`/tutor/${tutor.id}`}
                    className="px-3 py-2 text-xs font-medium bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    View profile
                  </Link>

                  <button
                    onClick={() => toggleVerified(tutor)}
                    disabled={busyId === tutor.id}
                    className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                      tutor.verified
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                    title={tutor.verified ? 'Revoke verification' : 'Verify tutor'}
                  >
                    <FaShieldAlt className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => toggleListing(tutor)}
                    disabled={busyId === tutor.id}
                    className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                    title={tutor.isActive ? 'Hide from search' : 'Show in search'}
                  >
                    {tutor.isActive ? <FaEye className="w-4 h-4" /> : <FaEyeSlash className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => toggleSuspend(tutor)}
                    disabled={busyId === tutor.id}
                    className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                      tutor.isSuspended
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    }`}
                    title={tutor.isSuspended ? 'Reactivate account' : 'Suspend account'}
                  >
                    {tutor.isSuspended ? <FaCheckCircle className="w-4 h-4" /> : <FaBan className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleDelete(tutor)}
                    disabled={busyId === tutor.id}
                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                    title="Delete account"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tutors;
