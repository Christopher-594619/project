import React from 'react';
import { formatters } from '../../utils/formatters';

const PriceBadge = ({ price, className = '' }) => {
  return (
    <div className={`inline-flex flex-col items-end ${className}`}>
      <span className="text-lg font-bold text-gray-900">
        K{price}
      </span>
      <span className="text-xs text-gray-500">/ hour</span>
    </div>
  );
};

export default PriceBadge;