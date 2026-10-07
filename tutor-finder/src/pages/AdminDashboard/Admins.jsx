import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import EmptyState from '../../components/common/EmptyState';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const emptyForm = { name: '', email: '', phone: '', password: '' };

const inputClass =
  'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent';

const Admins = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await adminService.getAdmins();
        if (!cancelled) setAdmins(data.admins || []);
      } catch (error) {
        if (!cancelled) toast.error(error.message || 'Could not load admins');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    try {
      const data = await adminService.createAdmin(form);
      setAdmins((prev) => [...prev, data.admin]);
      setForm(emptyForm);
      toast.success(`${data.admin.email} is now an admin`);
    } catch (error) {
      toast.error(error.message || 'Could not create admin');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0">

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admins</h1>
        <p className="text-gray-600 mt-1">Accounts with full access to this dashboard</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-900">Add an admin</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full name (optional)"
            className={inputClass}
          />
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className={inputClass}
          />
          <input
            name="phone"
            required
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            className={inputClass}
          />
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            placeholder="Temporary password (min 8 characters)"
            className={inputClass}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            Share the password with the new admin privately. They get full admin access immediately.
          </p>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            <FaUserPlus className="w-4 h-4" />
            {saving ? 'Creating…' : 'Create admin'}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        {loading ? (
          <LoadingSkeleton type="text" count={3} />
        ) : admins.length === 0 ? (
          <EmptyState icon="🛡️" title="No admins found" description="Admins you add will show up here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="py-2 pr-4 font-medium">Admin</th>
                  <th className="py-2 pr-4 font-medium">Phone</th>
                  <th className="py-2 font-medium">Added</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-gray-900">
                        {admin.name || 'Unnamed'}
                        {admin.email === user?.email && (
                          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-600">You</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{admin.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{admin.phone || '—'}</td>
                    <td className="py-3 text-gray-600">
                      {new Date(admin.created_at).toLocaleDateString()}
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

export default Admins;
