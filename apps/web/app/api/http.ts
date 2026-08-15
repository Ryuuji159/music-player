import { apiErrorSchema, type ApiErrorDto } from "@skrd/contracts";
import type z from "zod";
import { env } from "~/config/env";

export class ApiError extends Error {
  constructor(public readonly details: ApiErrorDto) {
    super(details.message);
    this.name = "ApiError";
  }
}

export async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    const parsed = apiErrorSchema.safeParse(await res.json().catch(() => null));
    throw new ApiError(parsed.success ? parsed.data : { statusCode: res.status, message: res.statusText });
  }
  const text = await res.text();
  if (!text) return undefined as T;

  return schema.parse(JSON.parse(text));
}