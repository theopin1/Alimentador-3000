import { api, tokenStorage } from './api';
import type {
  AuthResponse,
  LoginPayload,
  MessageResponse,
  RegisterPayload,
  User,
} from './types';

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/v1/auth/register', payload);
    return data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/v1/auth/login', payload);
    return data;
  },

  async logout(): Promise<MessageResponse> {
    try {
      const { data } = await api.post<MessageResponse>('/v1/auth/logout');
      return data;
    } finally {
      tokenStorage.clear();
    }
  },

  async me(): Promise<User> {
    const { data } = await api.get<{ user: User }>('/v1/auth/user');
    return data.user;
  },
};

export default authService;
