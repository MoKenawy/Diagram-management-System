// src/config/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'localhost:80';

export const PDF_VIEWER_ZOOM_STEP = 0.25;
export const PDF_VIEWER_MIN_ZOOM = 0.5;
export const PDF_VIEWER_MAX_ZOOM = 3.0;