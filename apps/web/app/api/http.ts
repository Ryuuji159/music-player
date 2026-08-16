import { apiErrorSchema, type ApiErrorDto } from '@skrd/contracts';
import type z from 'zod';
import { env } from '~/config/env';

export class ApiError extends Error {
  constructor(public readonly details: ApiErrorDto) {
    super(details.message);
    this.name = 'ApiError';
  }
}

export async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  });

  if (!res.ok) {
    const parsed = apiErrorSchema.safeParse(await res.json().catch(() => null));
    throw new ApiError(
      parsed.success
        ? parsed.data
        : { statusCode: res.status, message: res.statusText },
    );
  }
  const text = await res.text();
  if (!text) return undefined as T;

  return schema.parse(JSON.parse(text));
}
