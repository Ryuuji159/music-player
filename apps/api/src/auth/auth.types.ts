import type { User, Venue } from '../prisma/generated/prisma/client';

export type AuthUser = User & { venue: Venue | null };
