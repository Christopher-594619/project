// src/pages/BecomeTutor/BecomeTutor.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import {
    FaUser,
    FaGraduationCap,
    FaBook,
    FaDollarSign,
    FaMapMarkerAlt,
    FaGlobe,
    FaClock,
    FaPlus,
    FaTrash,
    FaCheck,
    FaChalkboardTeacher,
    FaBriefcase,
    FaLanguage,
    FaCamera,
    FaArrowRight,
    FaArrowLeft
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const SUBJECTS = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
    'Computer Science', 'Spanish', 'French', 'History', 'Economics',
    'Psychology', 'Music', 'Art', 'Engineering', 'Programming',
    'Statistics', 'Calculus', 'Literature', 'Medicine', 'Robotics'
];

const LEVELS = [
    'Elementary', 'Middle School', 'High School',
    'College', 'Graduate', 'Professional', 'Adult'
];

const DAYS = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday',
    'Friday', 'Saturday', 'Sunday'
];

const LANGUAGES = [
    'English', 'Nyanja', 'Bemba', 'Tonga', 'Lozi',
    'Kaonde', 'Lunda', 'Luvale', 'Spanish', 'French',
    'Mandarin', 'Hindi', 'Portuguese', 'Arabic'
];

const MODES = [
    { value: 'online', label: 'Online Only', icon: '💻' },
    { value: 'physical', label: 'In-Person Only', icon: '🏫' },
    { value: 'both', label: 'Both Online & In-Person', icon: '🌐' }
];

const BecomeTutor = () => {
    const navigate = useNavigate();
    const { user, accessToken} = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [selectedLevels, setSelectedLevels] = useState([]);
    const [selectedDays, setSelectedDays] = useState([]);
    const [selectedLanguages, setSelectedLanguages] = useState(['English']);

    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors }
    } = useForm({
        defaultValues: {
            bio: '',
            price: '',
            experience: '',
            location: '',
            mode: 'both',
            qualifications: [{ value: '' }],
            education: [{ degree: '', institution: '', year: '' }],
            skills: [{ value: '' }]
        }
    });

    const {
        fields: qualificationFields,
        append: appendQualification,
        remove: removeQualification
    } = useFieldArray({ control, name: 'qualifications' });

    const {
        fields: educationFields,
        append: appendEducation,
        remove: removeEducation
    } = useFieldArray({ control, name: 'education' });

    const {
        fields: skillFields,
        append: appendSkill,
        remove: removeSkill
    } = useFieldArray({ control, name: 'skills' });

    const totalSteps = 4;

    // ==================== HANDLERS ====================
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Photo must be less than 5MB');
                return;
            }
            setProfilePhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const toggleItem = (item, list, setList) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const validateStep = (step) => {
        switch (step) {
            case 1:
                if (!photoPreview) {
                    toast.error('Please upload a profile photo');
                    return false;
                }
                return true;
            case 2:
                if (selectedSubjects.length === 0) {
                    toast.error('Please select at least one subject');
                    return false;
                }
                if (selectedLevels.length === 0) {
                    toast.error('Please select at least one teaching level');
                    return false;
                }
                return true;
            case 3:
                if (selectedDays.length === 0) {
                    toast.error('Please select at least one available day');
                    return false;
                }
                return true;
            case 4:
                return true;
            default:
                return true;
        }
    };

    const onSubmit = async (data) => {
        if (selectedSubjects.length === 0) {
            toast.error('Please select at least one subject');
            return;
        }

        if (selectedLevels.length === 0) {
            toast.error('Please select at least one teaching level');
            return;
        }

        if (selectedDays.length === 0) {
            toast.error('Please select at least one available day');
            return;
        }

        if (!profilePhoto) {
            toast.error('Please upload a profile photo');
            return;
        }

        setIsSubmitting(true);

        try {

            // Create multipart/form-data
            const formData = new FormData();

            // Photo
            formData.append('photo', profilePhoto);

            // Basic tutor information
            formData.append('bio', data.bio);
            formData.append('price', data.price);
            formData.append('mode', data.mode);
            formData.append('experience', data.experience);
            formData.append('location', data.location);

            // Arrays must be converted to JSON strings
            formData.append(
                'subjects',
                JSON.stringify(selectedSubjects)
            );

            formData.append(
                'levels',
                JSON.stringify(selectedLevels)
            );

            formData.append(
                'availability',
                JSON.stringify(selectedDays)
            );

            formData.append(
                'languages',
                JSON.stringify(selectedLanguages)
            );

            formData.append(
                'qualifications',
                JSON.stringify(
                    data.qualifications
                        .map(q => q.value)
                        .filter(v => v.trim())
                )
            );

            formData.append(
                'skills',
                JSON.stringify(
                    data.skills
                        .map(s => s.value)
                        .filter(v => v.trim())
                )
            );

            formData.append(
                'education',
                JSON.stringify(
                    data.education
                        .filter(e => e.degree && e.institution)
                        .map(e => ({
                            degree: e.degree,
                            institution: e.institution,
                            year: e.year
                        }))
                )
            );

            const response = await fetch(
                `${import.meta.env.VITE_ENDPOINT_URL}/api/tutors/createTutorProfile`,{
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: formData
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Failed to create tutor profile'
                );
            }

            toast.success('Tutor profile created successfully! 🎓');

            navigate('/dashboard/tutor');

        } catch (error) {
            console.error('Error creating tutor profile:', error);
            toast.error(error.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Profile Photo
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                    Upload a professional photo so students can recognize you
                </p>

                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        {photoPreview ? (
                            <img
                                src={photoPreview}
                                alt="Profile preview"
                                className="w-40 h-40 rounded-2xl object-cover border-4 border-primary-100 shadow-soft"
                            />
                        ) : (
                            <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center border-4 border-dashed border-primary-200">
                                <FaCamera className="w-12 h-12 text-primary-400" />
                            </div>
                        )}
                        <label
                            htmlFor="photo-upload"
                            className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer shadow-medium hover:bg-primary-700 transition-colors"
                        >
                            <FaCamera className="w-5 h-5 text-white" />
                            <input
                                id="photo-upload"
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                    <p className="text-xs text-gray-400">
                        JPG, PNG or WEBP. Max 5MB
                    </p>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Subjects & Levels
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                    Select the subjects you teach and the levels you teach at
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Subjects you teach <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                    {SUBJECTS.map(subject => (
                        <button
                            key={subject}
                            type="button"
                            onClick={() => toggleItem(subject, selectedSubjects, setSelectedSubjects)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                selectedSubjects.includes(subject)
                                    ? 'bg-primary-600 text-white shadow-soft'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {subject}
                        </button>
                    ))}
                </div>
                {selectedSubjects.length > 0 && (
                    <p className="text-xs text-primary-600 mt-2">
                        ✓ {selectedSubjects.length} subject{selectedSubjects.length > 1 ? 's' : ''} selected
                    </p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Teaching levels <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                    {LEVELS.map(level => (
                        <button
                            key={level}
                            type="button"
                            onClick={() => toggleItem(level, selectedLevels, setSelectedLevels)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                selectedLevels.includes(level)
                                    ? 'bg-secondary-600 text-white shadow-soft'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {level}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short bio <span className="text-red-500">*</span>
                </label>
                <textarea
                    {...register('bio', { required: 'Bio is required', minLength: { value: 30, message: 'Bio must be at least 30 characters' } })}
                    rows={4}
                    placeholder="Tell students about your teaching style, expertise and what makes you a great tutor..."
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none ${
                        errors.bio ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hourly rate (USD) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <FaDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="number"
                            min="5"
                            step="1"
                            {...register('price', { required: 'Price is required', min: { value: 5, message: 'Minimum price is $5' } })}
                            placeholder="25"
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                                errors.price ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                    </div>
                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Years of experience <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        {...register('experience', { required: 'Experience is required' })}
                        placeholder="e.g. 5 years"
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            errors.experience ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience.message}</p>}
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Availability & Location
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                    Let students know when and where you can teach
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Available days <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DAYS.map(day => (
                        <button
                            key={day}
                            type="button"
                            onClick={() => toggleItem(day, selectedDays, setSelectedDays)}
                            className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                selectedDays.includes(day)
                                    ? 'bg-primary-600 text-white shadow-soft'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Teaching mode <span className="text-red-500">*</span>
                </label>
                <div className="grid sm:grid-cols-3 gap-3">
                    {MODES.map(mode => (
                        <label
                            key={mode.value}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                watch('mode') === mode.value
                                    ? 'border-primary-600 bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <input
                                type="radio"
                                value={mode.value}
                                {...register('mode')}
                                className="sr-only"
                            />
                            <span className="text-2xl">{mode.icon}</span>
                            <span className="text-sm font-medium text-gray-700 text-center">
                                {mode.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        {...register('location', { required: 'Location is required' })}
                        placeholder="e.g. Lusaka, Zambia"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            errors.location ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                </div>
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Languages you speak
                </label>
                <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map(lang => (
                        <button
                            key={lang}
                            type="button"
                            onClick={() => toggleItem(lang, selectedLanguages, setSelectedLanguages)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                selectedLanguages.includes(lang)
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Background & Skills
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                    Add your qualifications, education and special skills
                </p>
            </div>

            {/* Qualifications */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                        Qualifications
                    </label>
                    <button
                        type="button"
                        onClick={() => appendQualification({ value: '' })}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                    >
                        <FaPlus className="w-3 h-3" /> Add
                    </button>
                </div>
                <div className="space-y-2">
                    {qualificationFields.map((field, index) => (
                        <div key={field.id} className="flex gap-2">
                            <input
                                {...register(`qualifications.${index}.value`)}
                                placeholder="e.g. PhD in Mathematics"
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            />
                            {qualificationFields.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeQualification(index)}
                                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    <FaTrash className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Education */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                        Education
                    </label>
                    <button
                        type="button"
                        onClick={() => appendEducation({ degree: '', institution: '', year: '' })}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                    >
                        <FaPlus className="w-3 h-3" /> Add
                    </button>
                </div>
                <div className="space-y-3">
                    {educationFields.map((field, index) => (
                        <div key={field.id} className="p-4 bg-gray-50 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-500">
                                    Education #{index + 1}
                                </span>
                                {educationFields.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeEducation(index)}
                                        className="p-1 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                        <FaTrash className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                            <input
                                {...register(`education.${index}.degree`)}
                                placeholder="Degree (e.g. BS in Biology)"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    {...register(`education.${index}.institution`)}
                                    placeholder="Institution"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
                                />
                                <input
                                    {...register(`education.${index}.year`)}
                                    placeholder="Year"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-white"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skills */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                        Special Skills
                    </label>
                    <button
                        type="button"
                        onClick={() => appendSkill({ value: '' })}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                    >
                        <FaPlus className="w-3 h-3" /> Add
                    </button>
                </div>
                <div className="space-y-2">
                    {skillFields.map((field, index) => (
                        <div key={field.id} className="flex gap-2">
                            <input
                                {...register(`skills.${index}.value`)}
                                placeholder="e.g. MCAT Preparation"
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            />
                            {skillFields.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeSkill(index)}
                                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    <FaTrash className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const steps = [
        { number: 1, title: 'Photo', icon: FaCamera },
        { number: 2, title: 'Expertise', icon: FaBook },
        { number: 3, title: 'Availability', icon: FaClock },
        { number: 4, title: 'Background', icon: FaGraduationCap }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-3 bg-gradient-to-br from-primary-500 to-secondary-500 p-4 rounded-2xl shadow-soft mb-4">
                        <FaChalkboardTeacher className="text-white text-3xl" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Become a Tutor
                    </h1>
                    <p className="text-gray-500 max-w-lg mx-auto">
                        Share your knowledge, help students succeed and earn money on your own schedule
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.number;
                            const isComplete = currentStep > step.number;

                            return (
                                <React.Fragment key={step.number}>
                                    <div className="flex flex-col items-center">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                            isComplete
                                                ? 'bg-green-500 text-white'
                                                : isActive
                                                    ? 'bg-primary-600 text-white shadow-medium scale-110'
                                                    : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            {isComplete ? <FaCheck className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                        </div>
                                        <span className={`text-xs font-medium mt-2 ${
                                            isActive ? 'text-primary-600' : isComplete ? 'text-green-600' : 'text-gray-400'
                                        }`}>
                                            {step.title}
                                        </span>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className="flex-1 h-0.5 mx-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div className={`h-full bg-primary-600 transition-all duration-500 ${
                                                currentStep > step.number ? 'w-full' : 'w-0'
                                            }`} />
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Form Card */}
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl shadow-hard border border-gray-100/50 p-6 md:p-10"
                >
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {currentStep === 1 && renderStep1()}
                        {currentStep === 2 && renderStep2()}
                        {currentStep === 3 && renderStep3()}
                        {currentStep === 4 && renderStep4()}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
                            {currentStep > 1 ? (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="btn-secondary flex items-center gap-2"
                                >
                                    <FaArrowLeft className="w-4 h-4" />
                                    Back
                                </button>
                            ) : (
                                <div />
                            )}

                            {currentStep < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    Continue
                                    <FaArrowRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Creating profile...
                                        </>
                                    ) : (
                                        <>
                                            <FaCheck className="w-4 h-4" />
                                            Complete Profile
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </motion.div>

                {/* Help text */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    Your profile will be reviewed before being published. This usually takes 24 hours.
                </p>
            </div>
        </div>
    );
};

export default BecomeTutor;