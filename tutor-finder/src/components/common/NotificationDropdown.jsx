import React from 'react';
import { useNotification } from '../../hooks/useNotification';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotification();

  const getIcon = (type) => {
    switch (type) {
      case 'booking':
        return '📅';
      case 'message':
        return '💬';
      case 'review':
        return '⭐';
      case 'reminder':
        return '🔔';
      default:
        return '📌';
    }
  };

  const handleNotificationClick = (id) => {
    markAsRead(id);
    onClose?.();
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        {notifications.some(n => !n.read) && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🔕</div>
          <p className="text-gray-500 text-sm">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification.id)}
              className={`
                flex items-start gap-3 p-3 rounded-xl cursor-pointer
                transition-all duration-200 hover:bg-gray-50
                ${!notification.read ? 'bg-primary-50/50' : ''}
              `}
            >
              <div className="text-2xl flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`
                  text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-600'}
                `}>
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(notification.time), { addSuffix: true })}
                </p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;