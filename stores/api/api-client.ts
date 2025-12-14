import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

const HOST = 'http://localhost:4000'; // One URL for all browsers

export const BASE_URL = `${HOST}/api/v1`;

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For cookies
});

// Request interceptor (optional - for adding auth tokens, etc.)
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const message = 
      (error.response?.data as { message?: string })?.message || 
      error.message || 
      `HTTP ${error.response?.status || 'Unknown'}`;
    console.log(`API Error [${error.config?.url}]:`, message);
    return Promise.reject(new Error(message));
  }
);

export async function apiRequest<T>(
  endpoint: string,
  options: AxiosRequestConfig = {}
): Promise<T> {
  try {
    const response = await axiosInstance.request<T>({
      url: endpoint,
      ...options,
    });

    return response.data;
  } catch (error) {
    const err = error as Error;
    console.log(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

// Export axios instance for direct use if needed
export { axiosInstance };

export const getBackendImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${HOST}${normalizedPath}`;
};
