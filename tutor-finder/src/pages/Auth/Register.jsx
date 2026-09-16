import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaPhone, FaUserPlus, FaCheck, FaTimes, FaGraduationCap } from 'react-icons/fa';
import EmailVerification from './VerifyEmail';

const Register = () => {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const [pendingUserData, setPendingUserData] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { register, handleSubmit, watch, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setError('');
        setIsLoading(true);

        try {
            // First, send verification email
            const emailResponse = await fetch(`${import.meta.env.VITE_ENDPOINT_URL}/api/auth/send-verification-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: data.email }),
            });

            const emailData = await emailResponse.json();

            if (!emailResponse.ok) {
                if (emailData.available === false) {
                    throw new Error('User already exists with this email');
                }
                throw new Error(emailData.message);
            }

            // Store user data temporarily
            setPendingUserData({
                email: data.email,
                phone: data.phone,
                password: data.password,
            });

            setSuccess('Verification code sent to your email!');
            setShowVerification(true);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerificationSuccess = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_ENDPOINT_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pendingUserData),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            setSuccess('Account created successfully! You can now login.');
            setShowVerification(false);

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            setError('Failed to create account: ' + err.message);
        }
    };

    const passwordValue = watch('password', '');

    const passwordRequirements = [
        { label: 'At least 8 characters', test: (p) => p.length >= 8 },
        { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
        { label: 'Contains lowercase letter', test: (p) => /[a-z]/.test(p) },
        { label: 'Contains a number', test: (p) => /[0-9]/.test(p) },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
            <motion.div
                className="max-w-md w-full space-y-8 bg-white p-8 md:p-10 rounded-2xl shadow-hard border border-gray-100/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {!showVerification ? (
                    <>
                        <div className="text-center">
                            <div className="flex justify-center">
                                <div className="bg-gradient-to-br from-primary-500 to-secondary-500 p-3 rounded-2xl shadow-soft">
                                    <FaGraduationCap className="text-white text-3xl" />
                                </div>
                            </div>
                            <h2 className="mt-4 text-3xl font-bold text-gray-900">
                                Create Account
                            </h2>
                            <p className="mt-2 text-sm text-gray-500">
                                Join Tutor Finder and start learning today
                            </p>
                        </div>

                        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaEnvelope className="text-gray-400" />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white ${
                                                errors.email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="you@example.com"
                                            {...register('email', {
                                                required: 'Email is required',
                                                pattern: {
                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                    message: 'Invalid email address'
                                                }
                                            })}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaPhone className="text-gray-400" />
                                        </div>
                                        <input
                                            id="phone"
                                            type="tel"
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white ${
                                                errors.phone ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="0978123456 or +260978123456"
                                            {...register('phone', {
                                                required: 'Phone number is required',
                                                pattern: {
                                                    value: /^(?:\+260|0)[97]\d{8}$/,
                                                    message: 'Invalid Zambian phone number'
                                                }
                                            })}
                                        />
                                    </div>
                                    {errors.phone && (
                                        <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">Format: 09xxxxxxxx or +2609xxxxxxxx</p>
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaLock className="text-gray-400" />
                                        </div>
                                        <input
                                            id="password"
                                            type="password"
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white ${
                                                errors.password ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Create a strong password"
                                            {...register('password', {
                                                required: 'Password is required',
                                                minLength: {
                                                    value: 8,
                                                    message: 'Password must be at least 8 characters'
                                                },
                                                pattern: {
                                                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/,
                                                    message: 'Password must contain uppercase, lowercase, and a number'
                                                }
                                            })}
                                        />
                                    </div>
                                    {errors.password && (
                                        <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                                    )}

                                    {passwordValue && (
                                        <div className="mt-2 space-y-1">
                                            {passwordRequirements.map((req, index) => (
                                                <div key={index} className="flex items-center gap-2 text-sm">
                                                    {req.test(passwordValue) ? (
                                                        <FaCheck className="text-green-500" />
                                                    ) : (
                                                        <FaTimes className="text-red-500" />
                                                    )}
                                                    <span className={req.test(passwordValue) ? 'text-green-600' : 'text-gray-500'}>
                                                        {req.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaLock className="text-gray-400" />
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white ${
                                                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Confirm your password"
                                            {...register('confirmPassword', {
                                                required: 'Please confirm your password',
                                                validate: (value) =>
                                                    value === watch('password') || 'Passwords do not match'
                                            })}
                                        />
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                                    {success}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                                ) : (
                                    <>
                                        <FaUserPlus className="mr-2" /> Create Account
                                    </>
                                )}
                            </button>

                            <p className="text-center text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700 transition-colors">
                                    Sign In
                                </Link>
                            </p>
                        </form>
                    </>
                ) : (
                    <EmailVerification
                        email={pendingUserData?.email || ''}
                        onVerificationSuccess={handleVerificationSuccess}
                        onBack={() => setShowVerification(false)}
                    />
                )}
            </motion.div>
        </div>
    );
};

export default Register;