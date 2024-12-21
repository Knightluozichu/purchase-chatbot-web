import { APIConfig } from './types';

export const defaultConfig: APIConfig = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  retryConfig: {
    maxRetries: 3,
    delayMs: 1000,
  },
};