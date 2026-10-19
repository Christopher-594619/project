// Shows the student's own location on the Find Tutors page, how many tutors
// are nearby, and lets them choose what "nearby" means. All tutors stay
// listed; this panel only explains and controls the "Near you" labels.
import React, { useEffect, useState } from 'react';
import { FaMapMarkerAlt, FaLocationArrow, FaSpinner } from 'react-icons/fa';

const RADIUS_OPTIONS = [2, 5, 10, 20, 50];

// Best-effort area name ("Kalingalinga, Lusaka") from OpenStreetMap.
// Falls back to coordinates if offline or the lookup fails.
const useAreaName = (location) => {
  const [area, setArea] = useState(null);

  useEffect(() => {
    if (!location) return undefined;
    const key = `area:${location.lat.toFixed(3)},${location.lng.toFixed(3)}`;
    try {
      const cached = sessionStorage.getItem(key);
      if (cached) {
        setArea(cached);
        return undefined;
      }
    } catch { /* storage unavailable */ }

    const controller = new AbortController();
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&zoom=14&lat=${location.lat}&lon=${location.lng}`,
      { signal: controller.signal, headers: { 'Accept-Language': 'en' } }
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const a = data?.address || {};
        const parts = [
          a.suburb || a.neighbourhood || a.village || a.town,
          a.city || a.county || a.state,
        ].filter(Boolean);
        const name = parts.length ? [...new Set(parts)].join(', ') : null;
        if (name) {
          setArea(name);
          try { sessionStorage.setItem(key, name); } catch { /* ignore */ }
        }
      })
      .catch(() => { /* keep coordinates */ });

    return () => controller.abort();
  }, [location]);

  return area;
};

const StudentLocationPanel = ({
  status, // 'detecting' | 'found' | 'unavailable'
  location,
  nearbyCount,
  radius,
  onRadiusChange,
  nearbyOnly,
  onNearbyOnlyChange,
  onRetry,
}) => {
  const area = useAreaName(location);

  if (status === 'detecting') {
    return (
      <div className="mb-6 flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-soft text-sm text-gray-600">
        <FaSpinner className="w-4 h-4 animate-spin text-primary-500" />
        Finding your location to show tutors near you…
      </div>
    );
  }

  if (status !== 'found' || !location) {
    return (
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-sm">
        <FaMapMarkerAlt className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <p className="flex-1 text-amber-900">
          <strong>Your location isn’t available</strong>, so we can’t show which tutors are near you.
          All tutors are still listed. Allow location access in your browser, then try again.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 font-medium hover:bg-amber-100 transition-colors"
        >
          <FaLocationArrow className="w-3.5 h-3.5" />
          Use my location
        </button>
      </div>
    );
  }

  // Small OpenStreetMap view centred on the student, about 2 km across
  const d = 0.01;
  const mapSrc =
    'https://www.openstreetmap.org/export/embed.html' +
    `?bbox=${location.lng - d},${location.lat - d},${location.lng + d},${location.lat + d}` +
    `&layer=mapnik&marker=${location.lat},${location.lng}`;

  return (
    <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
      <div className="grid md:grid-cols-[220px_1fr]">
        <iframe
          title="Your location"
          src={mapSrc}
          className="w-full h-40 md:h-full min-h-[160px] border-0 bg-gray-100"
          loading="lazy"
        />
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
              <FaMapMarkerAlt className="w-4 h-4 text-primary-600" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Your location</p>
              <p className="font-semibold text-gray-900 truncate">
                {area || 'Current location'}
              </p>
              <p className="text-xs text-gray-500">
                {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-700">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">
              {nearbyCount} tutor{nearbyCount !== 1 ? 's' : ''} near you
            </span>{' '}
            within {radius} km. Every tutor is still listed below; nearby tutors are marked and shown first.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <label className="flex items-center gap-2 text-gray-600" htmlFor="nearby-radius">
              Nearby means within
              <select
                id="nearby-radius"
                value={radius}
                onChange={(e) => onRadiusChange(Number(e.target.value))}
                className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {RADIUS_OPTIONS.map((km) => (
                  <option key={km} value={km}>{km} km</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-gray-600 cursor-pointer" htmlFor="nearby-only">
              <input
                id="nearby-only"
                type="checkbox"
                checked={nearbyOnly}
                onChange={(e) => onNearbyOnlyChange(e.target.checked)}
                className="w-4 h-4 accent-primary-600"
              />
              Show nearby tutors only
            </label>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-medium"
            >
              <FaLocationArrow className="w-3 h-3" />
              Update my location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLocationPanel;
