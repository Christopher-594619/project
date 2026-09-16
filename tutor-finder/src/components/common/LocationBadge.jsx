import React from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';

const LocationBadge = ({ location, distance, className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-1.5 text-sm ${className}`}>
      <FaMapMarkerAlt className="text-primary-500 w-3.5 h-3.5" />
      <span className="text-gray-600">{location}</span>
      {distance && (
        <>
          <span className="text-gray-300">•</span>
          <span className="text-gray-500 text-sm">{distance}</span>
        </>
      )}
    </div>
  );
};

export default LocationBadge;