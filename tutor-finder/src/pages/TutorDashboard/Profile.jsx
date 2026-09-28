import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FaCamera, FaPlus, FaTrash, FaSave } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { tutorService } from '../../services/tutorService';
import { SUBJECTS, LEVELS, AVAILABILITY_OPTIONS, MODE_OPTIONS } from '../../utils/constants';
import ProfileCompletion from './components/ProfileCompletion';

const LANGUAGES = [
  'English', 'Nyanja', 'Bemba', 'Tonga', 'Lozi',
  'Kaonde', 'Lunda', 'Luvale', 'Spanish', 'French',
];

const API_URL = import.meta.env.VITE_ENDPOINT_URL;

// Stored photos are server-relative paths like /uploads/profiles/x.jpg
const photoUrl = (photo) => {
  if (!photo) return '';
  return photo.startsWith('http') || photo.startsWith('blob:') ? photo : `${API_URL}${photo}`;
};

const emptyForm = {
  bio: '',
  price: '',
  experience: '',
  location: '',
  mode: 'both',
  subjects: [],
  levels: [],
  availability: [],
  languages: [],
  qualifications: [],
  skills: [],
};

const Profile = () => {
  const { profile, refreshUser } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [saving, setSaving] = useState(false);

  // Seed the form from the profile once it is loaded.
  useEffect(() => {
    if (!profile) return;

    setForm({
      bio: profile.bio || '',
      price: profile.price ?? '',
      experience: profile.experience || '',
      location: profile.location || '',
      mode: profile.mode || 'both',
      subjects: profile.subjects || [],
      levels: profile.levels || [],
      availability: profile.availability || [],
      languages: profile.languages || [],
      qualifications: profile.qualifications || [],
      skills: profile.skills || [],
    });
  }, [profile]);

  // Keep the live preview in sync and revoke the blob when it is replaced.
  useEffect(() => {
    if (!photo) {
      setPhotoPreview('');
      return undefined;
    }

    const url = URL.createObjectURL(photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const currentPhoto = photoPreview || photoUrl(profile?.photo);

  // Feed the completion widget the values being edited, not the saved ones.
  const draftProfile = useMemo(
    () => ({ ...form, photo: currentPhoto }),
    [form, currentPhoto]
  );

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleInList = (field, value) => {
    setForm((prev) => {
      const list = prev[field] || [];
      return {
        ...prev,
        [field]: list.includes(value)
          ? list.filter((item) => item !== value)
          : [...list, value],
      };
    });
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be less than 5MB');
      return;
    }

    setPhoto(file);
  };

  const updateListItem = (field, index, value) => {
    setForm((prev) => {
      const list = [...(prev[field] || [])];
      list[index] = value;
      return { ...prev, [field]: list };
    });
  };

  const addListItem = (field) =>
    setForm((prev) => ({ ...prev, [field]: [...(prev[field] || []), ''] }));

  const removeListItem = (field, index) =>
    setForm((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.bio.trim()) {
      toast.error('Add a short bio so students know who you are');
      return;
    }

    if (form.subjects.length === 0) {
      toast.error('Pick at least one subject you teach');
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      formData.append('bio', form.bio);
      formData.append('price', form.price === '' ? 0 : form.price);
      formData.append('experience', form.experience);
      formData.append('location', form.location);
      formData.append('mode', form.mode);

      // Drop blank rows the tutor left behind in the free-text lists.
      const clean = (list) => (list || []).map((item) => item.trim()).filter(Boolean);

      formData.append('subjects', JSON.stringify(form.subjects));
      formData.append('levels', JSON.stringify(form.levels));
      formData.append('availability', JSON.stringify(form.availability));
      formData.append('languages', JSON.stringify(form.languages));
      formData.append('qualifications', JSON.stringify(clean(form.qualifications)));
      formData.append('skills', JSON.stringify(clean(form.skills)));

      if (photo) formData.append('photo', photo);

      await tutorService.updateTutorProfile(formData);
      await refreshUser();

      setPhoto(null);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.message || 'Could not update your profile');
    } finally {
      setSaving(false);
    }
  };

  const chipClass = (selected) =>
    `px-3 py-1.5 rounded-xl text-sm font-medium transition-colors border ${
      selected
        ? 'bg-primary-600 text-white border-primary-600'
        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
    }`;

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full min-w-0">

      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">This is what students see when they find you</p>
      </div>

      {/* Completion */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6">
        <ProfileCompletion profile={draftProfile} />
      </div>

      {/* Photo + basics */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Basics</h2>

        <div className="flex flex-wrap items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
              {currentPhoto ? (
                <img src={currentPhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <FaCamera className="w-6 h-6 text-primary-400" />
              )}
            </div>

            <label className="absolute -bottom-2 -right-2 p-2 bg-white border border-gray-200 rounded-xl shadow-soft cursor-pointer hover:bg-gray-50">
              <FaCamera className="w-3.5 h-3.5 text-gray-600" />
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
          </div>

          <div className="flex-1 min-w-[240px] grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Hourly rate (K)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={(e) => setField('price', e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Experience</label>
              <input
                type="text"
                placeholder="e.g. 5 years"
                value={form.experience}
                onChange={(e) => setField('experience', e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Location</label>
              <input
                type="text"
                placeholder="e.g. Lusaka"
                value={form.location}
                onChange={(e) => setField('location', e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Teaching mode</label>
              <select
                value={form.mode}
                onChange={(e) => setField('mode', e.target.value)}
                className={inputClass}
              >
                {MODE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Bio</label>
          <textarea
            rows={4}
            value={form.bio}
            onChange={(e) => setField('bio', e.target.value)}
            placeholder="Tell students about your teaching style and background"
            className={inputClass}
          />
        </div>
      </div>

      {/* Teaching */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Teaching</h2>

        {[
          { field: 'subjects', label: 'Subjects', options: SUBJECTS },
          { field: 'levels', label: 'Levels', options: LEVELS },
          { field: 'availability', label: 'Available days', options: AVAILABILITY_OPTIONS },
          { field: 'languages', label: 'Languages', options: LANGUAGES },
        ].map(({ field, label, options }) => (
          <div key={field}>
            <label className="block text-sm text-gray-700 mb-2">{label}</label>
            <div className="flex flex-wrap gap-2">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleInList(field, option)}
                  className={chipClass(form[field]?.includes(option))}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Credentials */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Credentials</h2>

        {[
          { field: 'qualifications', label: 'Qualifications', placeholder: 'e.g. BSc Mathematics' },
          { field: 'skills', label: 'Skills', placeholder: 'e.g. Exam preparation' },
        ].map(({ field, label, placeholder }) => (
          <div key={field}>
            <label className="block text-sm text-gray-700 mb-2">{label}</label>

            <div className="space-y-2">
              {(form[field] || []).map((value, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) => updateListItem(field, index, e.target.value)}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem(field, index)}
                    className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Remove"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addListItem(field)}
              className="mt-2 flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
            >
              <FaPlus className="w-3 h-3" />
              Add {label.toLowerCase()}
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaSave className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </form>
  );
};

export default Profile;
