// src/utils/formatters.ts
const ARABIC_LOCALE = 'ar-EG';

const arabicDateFormatter = new Intl.DateTimeFormat(ARABIC_LOCALE, {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const relativeTimeFormatter = new Intl.RelativeTimeFormat(ARABIC_LOCALE, {
  numeric: 'auto',
});

const BYTE_UNITS = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت', 'تيرابايت'] as const;

export const formatArabicDate = (date: Date = new Date()): string =>
  arabicDateFormatter.format(date);

export const formatStorageSize = (bytes: string | number): string => {
  const numBytes = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;

  if (numBytes === 0) return '0 بايت';

  const unitIndex = Math.floor(Math.log(numBytes) / Math.log(1024));
  const clampedIndex = Math.min(unitIndex, BYTE_UNITS.length - 1);
  const value = numBytes / Math.pow(1024, clampedIndex);

  return `${value.toFixed(1)} ${BYTE_UNITS[clampedIndex]}`;
};

export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMinutes < 1) return 'الآن';
  if (diffMinutes < 60) return relativeTimeFormatter.format(-diffMinutes, 'minute');
  if (diffHours < 24) return relativeTimeFormatter.format(-diffHours, 'hour');
  return relativeTimeFormatter.format(-diffDays, 'day');
};

export const formatNumber = (num: number): string =>
  new Intl.NumberFormat(ARABIC_LOCALE).format(num);