import React, { createContext, useState } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'booking',
      message: 'New booking request from Sarah Johnson',
      time: '5 minutes ago',
      read: false,
      icon: '📅',
    },
    {
      id: 2,
      type: 'message',
      message: 'John sent you a message about Math tutoring',
      time: '1 hour ago',
      read: false,
      icon: '💬',
    },
    {
      id: 3,
      type: 'review',
      message: 'Emily left you a 5-star review',
      time: '2 hours ago',
      read: false,
      icon: '⭐',
    },
  ]);

  const addNotification = (notification) => {
    setNotifications([{ ...notification, id: Date.now(), read: false }, ...notifications]);
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.read).length;
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        getUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};