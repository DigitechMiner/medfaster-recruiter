const HOST = 'http://localhost:4000'; // One URL for all browsers

export const BASE_URL = `${HOST}/api/v1`;

export const API_CONFIG = {
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    credentials: 'include', // For cookies
    headers: {
      ...API_CONFIG.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
  const err = error as Error;
  console.error(`API Error [${endpoint}]:`, err.message);
  throw err;
  }
}

export const getBackendImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${HOST}${normalizedPath}`;
};
