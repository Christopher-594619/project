import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const VerifiedBadge = ({ className = '' }) => {
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 border border-primary-200 rounded-full ${className}`}>
      <FaCheckCircle className="text-primary-500 w-3.5 h-3.5" />
      <span className="text-xs font-medium text-primary-700">Verified</span>
    </div>
  );
};

export default VerifiedBadge;