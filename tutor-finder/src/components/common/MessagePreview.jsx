import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const MessagePreview = ({ 
  message, 
  isActive = false, 
  onClick, 
  className = '' 
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        flex items-start gap-3 p-4 rounded-xl cursor-pointer
        transition-all duration-200 hover:bg-gray-50
        ${isActive ? 'bg-primary-50 border border-primary-200' : 'border border-transparent'}
        ${className}
      `}
    >
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center text-primary-600 font-semibold flex-shrink-0">
        {message.senderAvatar || message.senderName?.[0] || 'U'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-medium text-gray-900 text-sm">
            {message.senderName}
          </p>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500 truncate flex-1">
            {message.preview || message.content}
          </p>
          {message.unread && (
            <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagePreview;