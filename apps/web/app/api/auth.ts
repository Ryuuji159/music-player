import { userSchema, type UserDto } from '@skrd/contracts';
import { z } from 'zod';
import { ApiError, request } from './http';

export const authAPI = {
  me: async (): Promise<UserDto | null> => {
    try {
      return await request('/auth/me', userSchema);
    } catch (err) {
      if (err instanceof ApiError && err.details.statusCode === 401) {
        return null;
      }
      throw err;
    }
  },
  login: (username: string, password: string): Promise<UserDto> => {
    return request('/auth/login', userSchema, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  logout: () => {
    return request('/auth/logout', z.unknown(), { method: 'POST' });
  },
};
