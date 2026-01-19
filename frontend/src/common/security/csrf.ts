import { apiFetch } from '@/common/api/client';

// Frontend-only mock for CSRF token so no backend call is required during local dev
export const fetchCsrfToken = async () => {
  // keep signature async in case callers await it; return a mock token
  return { token: 'mock-csrf-token' };
};
