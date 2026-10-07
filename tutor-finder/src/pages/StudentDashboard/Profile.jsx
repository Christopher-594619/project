import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaSave } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const FIELDS = [
  { name: 'first_name', label: 'First name', required: true },
  { name: 'middle_name', label: 'Middle name' },
  { name: 'last_name', label: 'Last name', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'mobile_phone', label: 'Mobile phone', type: 'tel' },
  { name: 'telephone', label: 'Telephone', type: 'tel' },
  { name: 'date_of_birth', label: 'Date of birth', type: 'date' },
  { name: 'gender', label: 'Gender', options: ['', 'male', 'female', 'other'] },
  { name: 'nationality', label: 'Nationality' },
  { name: 'physical_address', label: 'Physical address', wide: true },
  { name: 'postal_address', label: 'Postal address', wide: true },
];

const inputClass =
  'w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent';

const Profile = () => {
  const { refreshUser } = useAuth();
  // Full details as loaded - the update endpoint overwrites every field, so we
  // always send this whole object back with the edits applied.
  const [details, setDetails] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    userService
      .getDetails()
      .then(setDetails)
      .catch((error) => toast.error(error.message || 'Could not load your profile'));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updated = await userService.updateDetails({
        ...details,
        profile_completed: Boolean(
          details.profile_completed || (details.first_name && details.last_name && details.mobile_phone)
        ),
      });
      // The update response returns raw dates; reload to keep the form in yyyy-mm-dd.
      setDetails(await userService.getDetails().catch(() => ({ ...details, ...updated })));
      await refreshUser();
      toast.success('Profile saved');
    } catch (error) {
      toast.error(error.message || 'Could not save your profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Your personal details</p>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-4 sm:p-6">
        {!details ? (
          <LoadingSkeleton type="text" count={4} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              {FIELDS.map((field) => (
                <div key={field.name} className={field.wide ? 'sm:col-span-2' : ''}>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1.5">
                    {field.label}
                    {field.required && <span className="text-red-500"> *</span>}
                  </label>

                  {field.options ? (
                    <select
                      id={field.name}
                      name={field.name}
                      value={details[field.name] || ''}
                      onChange={handleChange}
                      className={`${inputClass} capitalize`}
                    >
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>{opt || 'Prefer not to say'}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type || 'text'}
                      value={details[field.name] || ''}
                      onChange={handleChange}
                      required={field.required}
                      className={inputClass}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSave className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
