import React from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { formatters } from '../../utils/formatters';

const getMapUrl = (tutor, student) => {
  const points = [
    { lat: Number(tutor.latitude), lng: Number(tutor.longitude) },
    ...(student ? [{ lat: Number(student.lat), lng: Number(student.lng) }] : []),
  ];
  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);
  const padding = 0.01;
  const minLat = Math.min(...lats) - padding;
  const maxLat = Math.max(...lats) + padding;
  const minLng = Math.min(...lngs) - padding;
  const maxLng = Math.max(...lngs) + padding;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${tutor.latitude}%2C${tutor.longitude}`;
};

const TutorLocationMap = ({ tutor, studentLocation }) => {
  const hasTutorLocation = Number.isFinite(Number(tutor.latitude)) && Number.isFinite(Number(tutor.longitude));

  if (!hasTutorLocation) {
    return (
      <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-center px-4">
        <div>
          <FaMapMarkerAlt className="text-gray-400 w-8 h-8 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Tutor location is not available yet.</p>
        </div>
      </div>
    );
  }

  const distance = tutor.distance == null ? null : formatters.distance(tutor.distance);

  return (
    <div>
      <div className="aspect-video rounded-xl overflow-hidden border border-gray-200">
        <iframe
          title={`Map showing ${tutor.name}'s location`}
          src={getMapUrl(tutor, studentLocation)}
          className="w-full h-full border-0"
          loading="lazy"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-sm">
        <span className="text-gray-600">Tutor location: {tutor.location || 'Available on map'}</span>
        {distance && <span className="font-semibold text-primary-600">{distance} from you</span>}
      </div>
      {studentLocation && (
        <p className="text-xs text-gray-500 mt-1">Distance refreshes as either location changes.</p>
      )}
    </div>
  );
};

export default TutorLocationMap;