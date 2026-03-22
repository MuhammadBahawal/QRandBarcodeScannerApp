export function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function truncateText(text, maxLength = 60) {
  const value = String(text || '');

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}...`;
}

export function normalizeUrl(rawValue) {
  const value = String(rawValue || '').trim();

  if (!value) {
    return null;
  }

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) {
    return value;
  }

  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(value)) {
    return `https://${value}`;
  }

  return null;
}

export function isLikelyUrl(rawValue) {
  return Boolean(normalizeUrl(rawValue));
}

function isSameCalendarDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatHistoryDate(isoDate) {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown time';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes <= 1) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24 && isSameCalendarDay(date, now)) {
    return `${diffHours}h ago`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameCalendarDay(date, yesterday)) {
    return `Yesterday ${date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  }

  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

