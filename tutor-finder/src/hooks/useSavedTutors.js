import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

// Saved tutors live in localStorage (per user, per device) until there is a
// backend for them. A window event keeps every mounted hook in sync.
const CHANGE_EVENT = 'saved-tutors-changed';

const storageKey = (userId) => `savedTutors:${userId || 'guest'}`;

const read = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// Keep just what the saved list needs to render.
const snapshot = (tutor) => ({
  id: tutor.id,
  name: tutor.name,
  photo: tutor.photo || null,
  subjects: tutor.subjects || [],
  rating: tutor.rating || 0,
  price: tutor.price ?? null,
  location: tutor.location || null,
  savedAt: new Date().toISOString(),
});

export const useSavedTutors = () => {
  const { user } = useAuth();
  const key = storageKey(user?.id);
  const [saved, setSaved] = useState(() => read(key));

  useEffect(() => {
    setSaved(read(key));

    const sync = () => setSaved(read(key));
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [key]);

  const write = useCallback((next) => {
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Storage unavailable (private mode) - keep the in-memory list only.
    }
    setSaved(next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, [key]);

  const isSaved = useCallback(
    (tutorId) => saved.some((t) => String(t.id) === String(tutorId)),
    [saved]
  );

  const toggleSaved = useCallback((tutor) => {
    const current = read(key);
    const exists = current.some((t) => String(t.id) === String(tutor.id));
    write(exists
      ? current.filter((t) => String(t.id) !== String(tutor.id))
      : [snapshot(tutor), ...current]);
    return !exists;
  }, [key, write]);

  const removeSaved = useCallback((tutorId) => {
    write(read(key).filter((t) => String(t.id) !== String(tutorId)));
  }, [key, write]);

  return { saved, isSaved, toggleSaved, removeSaved };
};
