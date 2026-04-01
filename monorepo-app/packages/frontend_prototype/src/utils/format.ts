/**
 * Format file size into a human-readable string (KB, MB, GB, TB).
 */
export function formatFileSize(bytesStr: string | number): string {
  const bytes = typeof bytesStr === 'string' ? parseInt(bytesStr, 10) : bytesStr;
  if (isNaN(bytes) || bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Format a date string in Arabic locale.
 */
export function formatDate(date: Date, locale: string = 'en'): string {
  const localeCode = locale === 'ar' ? 'ar-SA' : 'en-US';

  return date.toLocaleDateString(localeCode, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}


/**
 * Calculate "time ago" string.
 */
export function timeAgo(date: string | Date, lang: 'ar' | 'en' = 'ar'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (lang === 'ar') {
    if (diffMinutes < 1) return 'الآن';
    if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 30) return `منذ ${diffDays} يوم`;
    return formatDate(d, 'ar');
  }

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(d, 'en');
}

/**
 * Get ISO string for N days ago.
 */
export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

/**
 * Get ISO string for start of N months ago.
 */
export function monthsAgo(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * Format a date as YYYY-MM-DD for input[type=date].
 */
export function toDateInputValue(date: Date): string {
  return date.toISOString().split('T')[0];
}
