// src/components/common/GetLocationButton.jsx
import React, { useState } from 'react';
import { FaLocationArrow } from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';

const API_URL = import.meta.env.VITE_ENDPOINT_URL;

const GetLocationButton = ({ className = '', onSuccess = null }) => {
    const [isLoading, setIsLoading] = useState(false);

    const {accessToken} = useAuth()

    const handleGetLocation = () => {
        // 1. Check browser support
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        setIsLoading(true);

        navigator.geolocation.getCurrentPosition(
            // Success
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {

                    const response = await fetch(`${API_URL}/api/tutors/location-update`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                        },
                        body: JSON.stringify({
                            lat: latitude,
                            lng: longitude,
                        }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.message || 'Failed to save location');
                    }

                    toast.success('Location updated successfully! 📍');

                    if (onSuccess) onSuccess({ lat: latitude, lng: longitude });
                } catch (err) {
                    console.error('Location save error:', err);
                    toast.error(err.message || 'Failed to save your location');
                } finally {
                    setIsLoading(false);
                }
            },

            // Error
            (error) => {
                setIsLoading(false);

                let message = 'Unable to get your location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Location permission denied. Please enable it in your browser settings.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Location information is unavailable. Check your GPS/network.';
                        break;
                    case error.TIMEOUT:
                        message = 'Location request timed out. Please try again.';
                        break;
                    default:
                        message = error.message || message;
                }

                toast.error(message);
            },

            // Options
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    return (
        <button
            type="button"
            onClick={handleGetLocation}
            disabled={isLoading}
            className={`
                inline-flex items-center justify-center gap-2
                px-4 py-2.5 rounded-xl font-medium text-sm
                bg-white border border-gray-300 text-gray-700
                hover:bg-gray-50 hover:border-primary-400
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                ${className}
            `}
        >
            {isLoading ? (
                <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    Getting location...
                </>
            ) : (
                <>
                    <FaLocationArrow className="w-4 h-4 text-primary-500" />
                    Update your location
                </>
            )}
        </button>
    );
};

export default GetLocationButton;