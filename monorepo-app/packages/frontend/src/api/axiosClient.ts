import axios from 'axios';
import qs from 'qs';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:80';

// For requests that DON'T need the interceptor (Login, Refresh, Register)
export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  paramsSerializer: {
    serialize: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
  },
});

// For requests that NEED Authorization and Refresh logic
export const privateApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  paramsSerializer: {
    serialize: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
  },
});