// src/components/common/GetLocationButton.jsx
import React, { useEffect, useRef, useState } from 'react';
import { FaLocationArrow } from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';

const API_URL = import.meta.env.VITE_ENDPOINT_URL;

const GetLocationButton = ({ className = '', onSuccess = null }) => {
    const [isLoading, setIsLoading] = useState(false);
    const watchIdRef = useRef(null);

    const {accessToken} = useAuth()

    const saveLocation = async (position) => {
        const { latitude, longitude } = position.coords;

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

        return { lat: latitude, lng: longitude };
    };

    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation?.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    const handleGetLocation = () => {
        // 1. Check browser support
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        setIsLoading(true);

        const handleLocation = async (position) => {
            try {
                const coords = await saveLocation(position);

                toast.success('Location updated successfully! 📍');

                if (onSuccess) onSuccess(coords);

                if (watchIdRef.current === null) {
                    watchIdRef.current = navigator.geolocation.watchPosition(
                        async ({ coords: liveCoords }) => {
                            try {
                                await saveLocation({ coords: liveCoords });
                            } catch (watchError) {
                                console.error('Live location update error:', watchError);
                            }
                        },
                        (watchError) => console.error('Live location watch error:', watchError),
                        {
                            enableHighAccuracy: false,
                            maximumAge: 15000,
                            timeout: 30000,
                        }
                    );
                }
            } catch (err) {
                console.error('Location save error:', err);
                toast.error(err.message || 'Failed to save your location');
            } finally {
                setIsLoading(false);
            }
        };

        const handleLocationError = (error) => {
            if (error.code === error.TIMEOUT) {
                navigator.geolocation.getCurrentPosition(
                    handleLocation,
                    showLocationError,
                    {
                        enableHighAccuracy: false,
                        timeout: 30000,
                        maximumAge: 60000,
                    }
                );
                return;
            }

            showLocationError(error);
        };

        const showLocationError = (error) => {
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
                    message = 'Location is taking too long. Please enable location services and try again.';
                    break;
                default:
                    message = error.message || message;
            }

            toast.error(message);
        };

        navigator.geolocation.getCurrentPosition(
            // Success
            handleLocation,

            // Error
            handleLocationError,

            // Options
            {
                enableHighAccuracy: false,
                timeout: 30000,
                maximumAge: 60000,
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