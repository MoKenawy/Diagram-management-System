export const parseDate = (dateStr: string, isEnd = false): Date => {
  // If already ISO (has time), use directly
  if (dateStr.includes('T')) {
    return new Date(dateStr);
  }

  // If date-only, normalize explicitly to UTC
  const base = new Date(dateStr + 'T00:00:00.000Z');

  if (isEnd) {
    // move to next day for exclusive upper bound
    base.setUTCDate(base.getUTCDate() + 1);
  }

  return base;
};
