import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,
  headers: { Accept: 'application/json' }
});

export const getApiErrorMessage = (error: unknown, fallback = 'The request could not be completed.'): string => {
  if (axios.isAxiosError(error)) {
    const responseData: unknown = error.response?.data;
    if (typeof responseData === 'string' && responseData.trim()) return responseData;
    if (
      typeof responseData === 'object' &&
      responseData !== null &&
      'message' in responseData &&
      typeof responseData.message === 'string'
    ) {
      return responseData.message;
    }
  }
  return error instanceof Error ? error.message : fallback;
};
