import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaHeadphones, FaUserPlus, FaCheck, FaTimes } from 'react-icons/fa';

// EmailVerification Component
const EmailVerification = ({ email, onVerificationSuccess, onBack }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const handleVerify = async () => {
        if (!code || code.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_ENDPOINT_URL}/api/auth/verify-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Invalid verification code');
            }

            await onVerificationSuccess();

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendDisabled(true);
        setCountdown(60);

        try {
            await fetch(`${import.meta.env.VITE_ENDPOINT_URL}/api/auth/send-verification-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
        } catch (err) {
            console.error('Resend error:', err);
        }

        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setResendDisabled(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="flex justify-center">
                    <div className="bg-primary-500 p-3 rounded-full">
                        <FaEnvelope className="text-white text-2xl" />
                    </div>
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                    Verify Your Email
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    We've sent a 6-digit verification code to<br />
                    <span className="font-semibold text-gray-900 dark:text-white">{email}</span>
                </p>
            </div>

            <div>
                <label className="input-label">Verification Code</label>
                <input
                    type="text"
                    maxLength="6"
                    value={code}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setCode(val);
                        setError('');
                    }}
                    className={`input-field text-center text-2xl tracking-widest ${error ? 'error' : ''}`}
                    placeholder="Enter 6-digit code"
                />
                {error && <p className="input-error">{error}</p>}
            </div>

            <button
                onClick={handleVerify}
                disabled={loading || code.length !== 6}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    'Verify Email'
                )}
            </button>

            <div className="text-center">
                <button
                    onClick={handleResend}
                    disabled={resendDisabled}
                    className="text-sm text-primary-500 hover:text-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {resendDisabled ? `Resend in ${countdown}s` : 'Resend Code'}
                </button>
                <br />
                <button
                    onClick={onBack}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors mt-2"
                >
                    ← Back to Sign Up
                </button>
            </div>
        </div>
    );
};

export default EmailVerification;