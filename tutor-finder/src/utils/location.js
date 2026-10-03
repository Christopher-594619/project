// src/utils/location.js
// Helper — cache user's location

let cachedCoords = null;
let locationPromise = null;

export const getUserLocation = (force = false) => {
    // Return cached coordinates if available
    if (!force && cachedCoords) {
        return Promise.resolve(cachedCoords);
    }

    // If a location request is already running, reuse it
    if (!force && locationPromise) {
        return locationPromise;
    }

    locationPromise = new Promise((resolve) => {
        if (!navigator.geolocation) {
            locationPromise = null;
            resolve(null);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                cachedCoords = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                };

                locationPromise = null;
                resolve(cachedCoords);
            },
            (err) => {
                console.warn('Geolocation failed:', err.message);

                locationPromise = null;
                resolve(null);
            },
            {
                enableHighAccuracy: true,
                timeout: 8000,
                maximumAge: 60000,
            }
        );
    });

    return locationPromise;
};

export const getCachedCoords = () => cachedCoords;