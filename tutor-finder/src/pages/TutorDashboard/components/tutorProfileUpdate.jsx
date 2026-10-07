// src/pages/Profile/TutorProfileEdit.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  FaCamera,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaPlus,
  FaTrash,
  FaCheck,
  FaLock,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_ENDPOINT_URL;

const SUBJECTS = ['Mathematics','Physics','Chemistry','Biology','English','Computer Science','Spanish','French','History','Economics','Psychology','Music','Art','Engineering','Programming'];
const LEVELS   = ['Elementary','Middle School','High School','College','Graduate','Professional','Adult'];
const DAYS     = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const LANGUAGES= ['English','Nyanja','Bemba','Tonga','Lozi','Kaonde','Lunda','Luvale','Spanish','French'];

const TutorProfileEdit = () => {
  const { user, accessToken, updateUser } = useAuth();

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', bio: '',
    price: '', experience: '', location: '', mode: 'both',
  });
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [days, setDays] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [skills, setSkills] = useState([]);
  const [education, setEducation] = useState([{ degree: '', institution: '', year: '' }]);

  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);

  // Password state — separate
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

  // ============ Load existing tutor profile ============
  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        const u = data?.user;
        const p = u?.profile;

        if (u) {
          setForm({
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            email: u.email || '',
            phone: u.phone || '',
            bio: u.bio || p?.bio || '',
            price: p?.price?.toString() || '',
            experience: p?.experience || '',
            location: p?.location || '',
            mode: p?.mode || 'both',
          });
          setPreview(u.profilePic ? `${API_URL}${u.profilePic}` : '');
        }

        if (p) {
          setSubjects(p.subjects || []);
          setLevels(p.levels || []);
          setDays(p.availability || []);
          setLanguages(p.languages || []);
          setQualifications(p.qualifications || []);
          setSkills(p.skills || []);
          setEducation(
            p.education?.length
              ? p.education
              : [{ degree: '', institution: '', year: '' }]
          );
        }
      } catch (err) {
        console.error('Failed to load tutor profile:', err);
      }
    };
    load();
  }, [user?.id, accessToken]);

  // ============ Handlers ============
  const toggle = (item, list, setList) =>
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

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
      fd.append('firstName', form.firstName);
      fd.append('lastName', form.lastName);
      fd.append('email', form.email);
      fd.append('phone', form.phone);
      fd.append('bio', form.bio);
      fd.append('subjects', JSON.stringify(subjects));
      fd.append('levels', JSON.stringify(levels));
      fd.append('availability', JSON.stringify(days));
      fd.append('languages', JSON.stringify(languages));
      fd.append('qualifications', JSON.stringify(qualifications.filter(Boolean)));
      fd.append('skills', JSON.stringify(skills.filter(Boolean)));
      fd.append('education', JSON.stringify(education.filter(e => e.degree && e.institution)));
      fd.append('price', form.price);
      fd.append('experience', form.experience);
      fd.append('location', form.location);
      fd.append('mode', form.mode);

      if (photo) fd.append('photo', photo);

      const res = await fetch(`${API_URL}/api/tutors/profile`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success('Profile updated');
      if (data?.tutor) updateUser?.(data.tutor);
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  // ============ Password submit ============
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
      const res = await fetch(`${API_URL}/api/tutors/password`, {
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Edit Tutor Profile
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Manage your public tutor profile
        </p>
      </div>

      {/* ============ PROFILE FORM ============ */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* IDENTITY */}
        <Card title="Identity">
          <div className="flex items-center gap-6 mb-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-primary-600 font-bold text-2xl">
                {preview ? (
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  user?.firstName?.[0] || 'T'
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer shadow-medium hover:bg-primary-700 transition">
                <FaCamera className="w-4 h-4 text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </label>
            </div>
            <div>
              <p className="font-medium text-gray-900">Profile photo</p>
              <p className="text-sm text-gray-500 mt-1">JPG, PNG, WEBP · Max 5MB</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <Field label="First Name" name="firstName" value={form.firstName} onChange={handleChange} icon={FaUser} />
            <Field label="Last Name"  name="lastName"  value={form.lastName}  onChange={handleChange} icon={FaUser} />
            <Field label="Email"      name="email"     value={form.email}     onChange={handleChange} icon={FaEnvelope} type="email" readOnly/>
            <Field label="Phone"      name="phone"     value={form.phone}     onChange={handleChange} icon={FaPhone} type="tel" />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea
              name="bio"
              rows={4}
              value={form.bio}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>
        </Card>

        {/* TEACHING */}
        <Card title="Teaching">
          <TagPicker label="Subjects" items={SUBJECTS} selected={subjects} onToggle={(i) => toggle(i, subjects, setSubjects)} />
          <TagPicker label="Levels" items={LEVELS} selected={levels} onToggle={(i) => toggle(i, levels, setLevels)} />
          <TagPicker label="Languages" items={LANGUAGES} selected={languages} onToggle={(i) => toggle(i, languages, setLanguages)} />

          <div className="grid sm:grid-cols-2 gap-6 mt-6">
            <Field label="Hourly Rate (USD)" name="price" value={form.price} onChange={handleChange} type="number" />
            <Field label="Years of Experience" name="experience" value={form.experience} onChange={handleChange} />
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mt-6">
            <Field label="Location" name="location" value={form.location} onChange={handleChange} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
              <select
                name="mode"
                value={form.mode}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="online">Online</option>
                <option value="physical">In-person</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>

          <TagPicker label="Availability" items={DAYS} selected={days} onToggle={(i) => toggle(i, days, setDays)} />
        </Card>

        {/* BACKGROUND */}
        <Card title="Background">
          <ListEditor
            label="Qualifications"
            items={qualifications}
            onChange={setQualifications}
            placeholder="e.g. PhD in Mathematics"
          />
          <ListEditor
            label="Skills"
            items={skills}
            onChange={setSkills}
            placeholder="e.g. MCAT Preparation"
          />

          {/* Education */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Education</label>
              <button
                type="button"
                onClick={() => setEducation((p) => [...p, { degree: '', institution: '', year: '' }])}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
              >
                <FaPlus className="w-3 h-3" /> Add
              </button>
            </div>

            <div className="space-y-3">
              {education.map((edu, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Education #{i + 1}</span>
                    {education.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setEducation((p) => p.filter((_, idx) => idx !== i))}
                        className="p-1 text-red-500 hover:bg-red-100 rounded-lg"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <input
                    placeholder="Degree"
                    value={edu.degree}
                    onChange={(e) => setEducation((p) => p.map((x, idx) => idx === i ? { ...x, degree: e.target.value } : x))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="Institution"
                      value={edu.institution}
                      onChange={(e) => setEducation((p) => p.map((x, idx) => idx === i ? { ...x, institution: e.target.value } : x))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
                    />
                    <input
                      placeholder="Year"
                      value={edu.year}
                      onChange={(e) => setEducation((p) => p.map((x, idx) => idx === i ? { ...x, year: e.target.value } : x))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* PROFILE ACTIONS */}
        <div className="flex justify-end gap-3">
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

      {/* ============ PASSWORD FORM (separate) ============ */}
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

// ---- Reusable pieces ----
const Card = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-6 sm:p-8">
    <h2 className="text-lg font-semibold text-gray-900 mb-6">{title}</h2>
    {children}
  </div>
);

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

const TagPicker = ({ label, items, selected, onToggle }) => (
  <div className="mt-6 first:mt-0">
    <label className="block text-sm font-medium text-gray-700 mb-3">{label}</label>
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onToggle(item)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            selected.includes(item)
              ? 'bg-primary-600 text-white shadow-soft'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  </div>
);

const ListEditor = ({ label, items, onChange, placeholder }) => (
  <div className="mt-6 first:mt-0">
    <div className="flex items-center justify-between mb-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <button
        type="button"
        onClick={() => onChange([...items, ''])}
        className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
      >
        <FaPlus className="w-3 h-3" /> Add
      </button>
    </div>
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="text-sm text-gray-400 italic">None added yet</p>
      )}
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={item}
            placeholder={placeholder}
            onChange={(e) =>
              onChange(items.map((x, idx) => (idx === i ? e.target.value : x)))
            }
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  </div>
);

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

export default TutorProfileEdit;