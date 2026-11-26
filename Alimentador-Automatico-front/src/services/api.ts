import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { commonStrings } from '../strings/pt-br';

const baseURL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://127.0.0.1:8001/api';

const timeout = Number(import.meta.env.VITE_API_TIMEOUT ?? 15000);

const AUTH_TOKEN_KEY = 'alimentador.auth_token';
const DEVICE_TOKEN_KEY = 'alimentador.device_token';

export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },
  set(token: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },
  clear(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },
};

export const deviceTokenStorage = {
  get(): string | null {
    return localStorage.getItem(DEVICE_TOKEN_KEY);
  },
  set(token: string): void {
    localStorage.setItem(DEVICE_TOKEN_KEY, token);
  },
  clear(): void {
    localStorage.removeItem(DEVICE_TOKEN_KEY);
  },
};

export const api: AxiosInstance = axios.create({
  baseURL,
  timeout,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.get();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ApiErrorPayload {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    if (error.response?.status === 401) {
      tokenStorage.clear();
    }

    const payload: ApiErrorPayload = {
      message:
        error.response?.data?.message ??
        error.message ??
        commonStrings.apiCommunicationError,
      errors: error.response?.data?.errors,
      status: error.response?.status ?? 0,
    };

    return Promise.reject(payload);
  },
);

export const deviceApi: AxiosInstance = axios.create({
  baseURL,
  timeout,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

deviceApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = deviceTokenStorage.get();
  if (token && config.headers) {
    config.headers['X-Device-Token'] = token;
  }
  return config;
});

deviceApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    const payload: ApiErrorPayload = {
      message:
        error.response?.data?.message ??
        error.message ??
        commonStrings.apiCommunicationError,
      errors: error.response?.data?.errors,
      status: error.response?.status ?? 0,
    };

    return Promise.reject(payload);
  },
);

export default api;
