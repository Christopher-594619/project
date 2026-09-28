import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaSearch, FaBan, FaCheckCircle, FaTrash } from 'react-icons/fa';
import { adminService } from '../../services/adminService';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async (query = '') => {
    setLoading(true);
    try {
      const data = await adminService.getStudents({ search: query, limit: 50 });
      setStudents(data.users || []);
    } catch (error) {
      toast.error(error.message || 'Could not load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Debounce the search box so we are not hitting the API on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => load(search), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const toggleSuspend = async (student) => {
    const suspend = !student.is_suspended;

    if (suspend && !window.confirm(`Suspend ${student.email}? They will not be able to log in.`)) {
      return;
    }

    setBusyId(student.id);
    try {
      await adminService.setUserSuspended(student.id, suspend);
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, is_suspended: suspend ? 1 : 0 } : s))
      );
      toast.success(suspend ? 'Student suspended' : 'Student reactivated');
    } catch (error) {
      toast.error(error.message || 'Could not update this student');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`Permanently delete ${student.email}? This cannot be undone.`)) return;

    setBusyId(student.id);
    try {
      await adminService.deleteUser(student.id);
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
      toast.success('Student account deleted');
    } catch (error) {
      toast.error(error.message || 'Could not delete this student');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0">

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">Every student account on the platform</p>
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

      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        {loading ? (
          <LoadingSkeleton type="text" count={4} />
        ) : students.length === 0 ? (
          <EmptyState
            icon="🔎"
            title="No students found"
            description={search ? 'Try a different search term.' : 'No students have signed up yet.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="py-2 pr-4 font-medium">Student</th>
                  <th className="py-2 pr-4 font-medium">Phone</th>
                  <th className="py-2 pr-4 font-medium">Joined</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-gray-900">{student.name || 'Unnamed'}</p>
                      <p className="text-xs text-gray-500">{student.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{student.phone || '—'}</td>
                    <td className="py-3 pr-4 text-gray-600">
                      {new Date(student.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 pr-4">
                      {student.is_suspended ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          Suspended
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleSuspend(student)}
                          disabled={busyId === student.id}
                          className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                            student.is_suspended
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          }`}
                          title={student.is_suspended ? 'Reactivate' : 'Suspend'}
                        >
                          {student.is_suspended ? <FaCheckCircle className="w-4 h-4" /> : <FaBan className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(student)}
                          disabled={busyId === student.id}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                          title="Delete account"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;
