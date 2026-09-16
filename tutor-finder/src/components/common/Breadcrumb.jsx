import React from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';

const Breadcrumb = ({ items, className = '' }) => {
  return (
    <nav className={`flex items-center gap-2 text-sm ${className}`}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <FaChevronRight className="text-gray-400 w-3 h-3 flex-shrink-0" />
          )}
          {item.to ? (
            <Link
              to={item.to}
              className={`
                font-medium transition-colors
                ${index === items.length - 1 
                  ? 'text-gray-900 cursor-default' 
                  : 'text-gray-500 hover:text-primary-600'
                }
              `}
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;