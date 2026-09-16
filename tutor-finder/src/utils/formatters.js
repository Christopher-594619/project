export const formatters = {
  currency: (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ZMW',
      minimumFractionDigits: 0,
    }).format(amount);
  },

  date: (date, options = {}) => {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return new Intl.DateTimeFormat('en-US', {
      ...defaultOptions,
      ...options,
    }).format(new Date(date));
  },

  time: (time) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(new Date(`2000-01-01T${time}`));
  },

  distance: (km) => {
    if (km == null || isNaN(km)) return '';
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
  },

  rating: (rating) => {
    return rating.toFixed(1);
  },

  number: (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  },

  relativeTime: (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatters.date(date);
  },

  duration: (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) return `${remainingMinutes} min`;
    if (remainingMinutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours}h ${remainingMinutes}min`;
  },

  pluralize: (count, singular, plural) => {
    return count === 1 ? singular : plural || `${singular}s`;
  },

  initials: (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  },

  fullName: (firstName, lastName) => {
    return `${firstName} ${lastName}`;
  },

  phoneNumber: (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  },
};