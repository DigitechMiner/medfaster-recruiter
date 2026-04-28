import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

const HOST = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'; // ✅ http not https
export const BASE_URL = `${HOST}/api/v1`;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // cookies sent on every request
});

axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      `HTTP ${error.response?.status || 'Unknown'}`;
    console.error(`API Error [${error.config?.url}]:`, message); // ✅ console.error
    return Promise.reject(new Error(message));
  }
);

export async function apiRequest<T = any>(
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
    console.error(`API Error [${endpoint}]:`, err.message); // ✅ console.error
    throw err;
  }
}

export { axiosInstance };

export const getBackendImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${HOST}${normalizedPath}`;
};