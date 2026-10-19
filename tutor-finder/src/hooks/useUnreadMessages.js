// Number of messages sent to the logged-in user that they haven't opened yet.
// Polls every 10 seconds, and refreshes straight away when a chat is opened
// (messages.jsx fires the UNREAD_REFRESH_EVENT after loading a conversation).
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_ENDPOINT_URL;
const POLL_INTERVAL = 10000;
export const UNREAD_REFRESH_EVENT = 'unread-messages-refresh';

export const refreshUnreadMessages = () =>
  window.dispatchEvent(new Event(UNREAD_REFRESH_EVENT));

export function useUnreadMessages() {
  const { isLoggedIn, getValidAccessToken } = useAuth();
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    if (!isLoggedIn) {
      setUnread(0);
      return;
    }
    try {
      const token = await getValidAccessToken();
      if (!token) return;
      const res = await fetch(`${API_URL}/api/chats/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) setUnread(data.unread);
    } catch {
      // Network hiccup: keep the last known count
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  useEffect(() => {
    load();
    if (!isLoggedIn) return undefined;
    const id = setInterval(load, POLL_INTERVAL);
    window.addEventListener(UNREAD_REFRESH_EVENT, load);
    window.addEventListener('focus', load);
    return () => {
      clearInterval(id);
      window.removeEventListener(UNREAD_REFRESH_EVENT, load);
      window.removeEventListener('focus', load);
    };
  }, [isLoggedIn, load]);

  return unread;
}
