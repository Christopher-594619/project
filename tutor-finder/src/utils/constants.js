export const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Computer Science',
  'Spanish',
  'French',
  'History',
  'Economics',
  'Psychology',
  'Music',
  'Art',
  'Engineering',
  'Programming',
  "Software engineering"
];

export const LEVELS = [
  'Elementary',
  'Middle School',
  'High School',
  'College',
  'Graduate',
  'Professional',
  'Adult',
];

export const AVAILABILITY_OPTIONS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const PRICE_RANGES = [
  { min: 0, max: 50, label: 'K0 - K50' },
  { min: 50, max: 75, label: 'K50 - K75' },
  { min: 75, max: 100, label: 'K75 - K100' },
  { min: 100, max: 150, label: 'K100 - K150' },
  { min: 150, max: 200, label: 'K150 - K200' },
];

export const DISTANCE_OPTIONS = [
  { value: 0, label: 'Within 0.1 KM' },
  { value: 1, label: 'Within 1 KM' },
  { value: 3, label: 'Within 3 KM' },
  { value: 5, label: 'Within 5 KM' },
  { value: 10, label: 'Within 10 KM' },
  { value: 20, label: 'Within 20 KM' },
  { value: 0, label: 'Any distance' },
];

export const RATING_OPTIONS = [
  { value: 0, label: 'Any rating' },
  { value: 4, label: '4.0+ stars' },
  { value: 4.5, label: '4.5+ stars' },
  { value: 4.8, label: '4.8+ stars' },
];

export const MODE_OPTIONS = [
  { value: 'both', label: 'Both' },
  { value: 'online', label: 'Online only' },
  { value: 'physical', label: 'In-person only' },
];

export const BREADCRUMBS = {
  home: { label: 'Home', path: '/' },
  search: { label: 'Search', path: '/search' },
  dashboard: { label: 'Dashboard', path: '/dashboard' },
};

export const NOTIFICATION_TYPES = {
  BOOKING: 'booking',
  MESSAGE: 'message',
  REVIEW: 'review',
  REMINDER: 'reminder',
  TUTOR_RESPONSE: 'tutor_response',
};