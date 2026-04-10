import { z } from 'zod';

export const isoOrDate = z.string().refine((val) => {
  if (val === '') return true; // allow empty

  // Accept YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return true;

  // Accept ISO
  return !isNaN(Date.parse(val));
}, {
  message: 'Must be a valid date (YYYY-MM-DD or ISO)',
});

