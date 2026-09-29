import React, { createContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user, accessToken } = useAuth();
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

  useEffect(() => {
    if (!user || !accessToken) return undefined;

    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const loadedNotifications = await notificationService.getNotifications();
        if (isMounted) setNotifications(loadedNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();
    const refreshTimer = window.setInterval(loadNotifications, 10000);

    return () => {
      isMounted = false;
      window.clearInterval(refreshTimer);
    };
  }, [user, accessToken]);

  const addNotification = (notification) => {
    setNotifications((current) => [
      { ...notification, id: Date.now(), read: false },
      ...current,
    ]);
  };

  const markAsRead = (id) => {
    setNotifications((current) => current.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));

    if (user && accessToken) {
      notificationService.markAsRead(id).catch((error) => {
        console.error('Error marking notification as read:', error);
      });
    }
  };

  const markAllAsRead = () => {
    setNotifications((current) => current.map(notif => ({ ...notif, read: true })));
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