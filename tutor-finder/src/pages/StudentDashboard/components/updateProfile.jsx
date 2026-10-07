// src/pages/Profile/StudentProfileEdit.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  FaCamera,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCheck,
  FaLock,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_ENDPOINT_URL;

const StudentProfileEdit = () => {
  const { user, accessToken, updateUser } = useAuth();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);

  // Password state — handled separately
  const [pwd, setPwd] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPwd, setShowPwd] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
      });
      setPreview(
        user.profilePic
          ? user.profilePic.startsWith('http')
            ? user.profilePic
            : `${API_URL}${user.profilePic}`
          : ''
      );
    }
  }, [user]);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Max 5MB');
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photo) fd.append('photo', photo);

      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success('Profile updated');
      updateUser?.(data.user);
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!pwd.currentPassword || !pwd.newPassword || !pwd.confirmPassword) {
      return toast.error('Please fill in all password fields');
    }
    if (pwd.newPassword.length < 8) {
      return toast.error('New password must be at least 8 characters');
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(pwd.newPassword)) {
      return toast.error('Password must contain uppercase, lowercase, and a number');
    }
    if (pwd.newPassword !== pwd.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setSavingPwd(true);

    try {
      const res = await fetch(`${API_URL}/api/users/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          currentPassword: pwd.currentPassword,
          newPassword: pwd.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success('Password updated');
      setPwd({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Password update failed');
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Edit Profile
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Update your personal information
        </p>
      </div>

      {/* ============ PROFILE FORM ============ */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 sm:p-8 space-y-8"
      >
        {/* Photo */}
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 flex-shrink-0">
            <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-primary-600 font-bold text-2xl">
              {preview ? (
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                user?.firstName?.[0] || 'U'
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer shadow-medium hover:bg-primary-700 transition">
              <FaCamera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhoto}
              />
            </label>
          </div>
          <div>
            <p className="font-medium text-gray-900">Profile photo</p>
            <p className="text-sm text-gray-500 mt-1">JPG, PNG, WEBP · Max 5MB</p>
          </div>
        </div>

        {/* Fields */}
        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="First Name" name="firstName" value={form.firstName} onChange={handleChange} icon={FaUser} />
          <Field label="Last Name"  name="lastName"  value={form.lastName}  onChange={handleChange} icon={FaUser} />
          <Field label="Email"      name="email"     value={form.email}     onChange={handleChange} icon={FaEnvelope} type="email" readOnly/>
          <Field label="Phone"      name="phone"     value={form.phone}     onChange={handleChange} icon={FaPhone} type="tel" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
            name="bio"
            rows={4}
            value={form.bio}
            onChange={handleChange}
            placeholder="Tell us a bit about yourself..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary px-6 py-3 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FaCheck className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* ============ PASSWORD FORM ============ */}
      <form
        onSubmit={handlePasswordSubmit}
        className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 sm:p-8 space-y-6"
      >
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Change Password
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Use a strong password you don't use anywhere else
          </p>
        </div>

        <div className="space-y-4">
          <PasswordField
            label="Current Password"
            name="currentPassword"
            value={pwd.currentPassword}
            show={showPwd.current}
            onToggle={() => setShowPwd((s) => ({ ...s, current: !s.current }))}
            onChange={(e) => setPwd((p) => ({ ...p, currentPassword: e.target.value }))}
          />

          <PasswordField
            label="New Password"
            name="newPassword"
            value={pwd.newPassword}
            show={showPwd.next}
            onToggle={() => setShowPwd((s) => ({ ...s, next: !s.next }))}
            onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))}
          />

          <PasswordField
            label="Confirm New Password"
            name="confirmPassword"
            value={pwd.confirmPassword}
            show={showPwd.confirm}
            onToggle={() => setShowPwd((s) => ({ ...s, confirm: !s.confirm }))}
            onChange={(e) => setPwd((p) => ({ ...p, confirmPassword: e.target.value }))}
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={savingPwd}
            className="btn-primary px-6 py-3 disabled:opacity-50 inline-flex items-center gap-2"
          >
            {savingPwd ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <FaLock className="w-4 h-4" />
                Update Password
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// ---- Reusable: text input ----
const Field = ({ label, name, value, onChange, icon: Icon, type = 'text' }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
      />
    </div>
  </div>
);

// ---- Reusable: password input with show/hide ----
const PasswordField = ({ label, name, value, onChange, show, onToggle }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FaLock className="w-4 h-4 text-gray-400" />
      </div>
      <input
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
      >
        {show ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
      </button>
    </div>
  </div>
);

export default StudentProfileEdit;