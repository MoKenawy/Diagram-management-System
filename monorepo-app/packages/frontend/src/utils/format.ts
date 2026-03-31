// src/utils/format.ts

/**
 * Format a date for display in Arabic or English
 */
export function formatDate(
  date: Date | string | number,
  lang: string = 'ar'
): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const locale = lang === 'ar' ? 'ar-EG' : 'en-US';

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Format a short date (no time)
 */
export function formatShortDate(
  date: Date | string | number,
  lang: string = 'ar'
): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const locale = lang === 'ar' ? 'ar-EG' : 'en-US';

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/**
 * Format a number with locale-appropriate formatting
 */
export function formatNumber(n: number, lang: string = 'ar'): string {
  const locale = lang === 'ar' ? 'ar-EG' : 'en-US';
  return new Intl.NumberFormat(locale).format(n);
}

/**
 * Format bytes into human-readable file size
 */
export function formatFileSize(bytes: number, lang: string = 'ar'): string {
  if (bytes === 0) {
    return lang === 'ar' ? '٠ بايت' : '0 B';
  }

  const locale = lang === 'ar' ? 'ar-EG' : 'en-US';
  const units =
    lang === 'ar'
      ? ['بايت', 'كيلوبايت', 'ميغابايت', 'غيغابايت', 'تيرابايت']
      : ['B', 'KB', 'MB', 'GB', 'TB'];

  const k = 1024;
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  const index = Math.min(i, units.length - 1);
  const value = bytes / Math.pow(k, index);

  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);

  return `${formatted} ${units[index]}`;
}

/**
 * Relative time string (e.g., "5 minutes ago")
 */
export function timeAgo(date: Date | string | number, lang: string = 'ar'): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (lang === 'ar') {
    if (diffSeconds < 60) return 'الآن';
    if (diffMinutes < 60) {
      if (diffMinutes === 1) return 'منذ دقيقة';
      if (diffMinutes === 2) return 'منذ دقيقتين';
      if (diffMinutes <= 10)
        return `منذ ${new Intl.NumberFormat('ar-EG').format(diffMinutes)} دقائق`;
      return `منذ ${new Intl.NumberFormat('ar-EG').format(diffMinutes)} دقيقة`;
    }
    if (diffHours < 24) {
      if (diffHours === 1) return 'منذ ساعة';
      if (diffHours === 2) return 'منذ ساعتين';
      if (diffHours <= 10)
        return `منذ ${new Intl.NumberFormat('ar-EG').format(diffHours)} ساعات`;
      return `منذ ${new Intl.NumberFormat('ar-EG').format(diffHours)} ساعة`;
    }
    if (diffDays < 7) {
      if (diffDays === 1) return 'منذ يوم';
      if (diffDays === 2) return 'منذ يومين';
      return `منذ ${new Intl.NumberFormat('ar-EG').format(diffDays)} أيام`;
    }
    if (diffWeeks < 4) {
      if (diffWeeks === 1) return 'منذ أسبوع';
      if (diffWeeks === 2) return 'منذ أسبوعين';
      return `منذ ${new Intl.NumberFormat('ar-EG').format(diffWeeks)} أسابيع`;
    }
    if (diffMonths < 12) {
      if (diffMonths === 1) return 'منذ شهر';
      if (diffMonths === 2) return 'منذ شهرين';
      return `منذ ${new Intl.NumberFormat('ar-EG').format(diffMonths)} أشهر`;
    }
    if (diffYears === 1) return 'منذ سنة';
    if (diffYears === 2) return 'منذ سنتين';
    return `منذ ${new Intl.NumberFormat('ar-EG').format(diffYears)} سنوات`;
  }

  // English
  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffWeeks < 4)
    return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  if (diffMonths < 12)
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
}