import {
  userListSchema,
  userSchema,
  type CreateUserDto,
  type UpdateUserDto,
  type UserDto,
} from '@skrd/contracts';
import { z } from 'zod';
import { request } from './http';

export const usersAPI = {
  list: (): Promise<UserDto[]> => request('/users', userListSchema),
  create: (input: CreateUserDto): Promise<UserDto> => {
    return request('/users', userSchema, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  update: (id: string, input: UpdateUserDto): Promise<UserDto> => {
    return request(`/users/${id}`, userSchema, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
  remove: (id: string) => {
    return request(`/users/${id}`, z.unknown(), { method: 'DELETE' });
  },
};
