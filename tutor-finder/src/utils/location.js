// src/utils/location.js
// Helper — cache user's location

let cachedCoords = null;
let locationPromise = null;
let locationAttempted = false;

export const getUserLocation = (force = false) => {
    // Return cached coordinates if available
    if (!force && cachedCoords) {
        return Promise.resolve(cachedCoords);
    }

    // A failed or denied request should not be repeated for every tutor request.
    if (!force && locationAttempted) {
        return Promise.resolve(null);
    }

    // If a location request is already running, reuse it
    if (!force && locationPromise) {
        return locationPromise;
    }

    locationAttempted = true;
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
            () => {
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