import type { UserDto } from '@skrd/contracts';
import type { AuthUser } from './auth.types';

export function toUserDto(user: AuthUser): UserDto {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    venueId: user.venueId,
    venueSlug: user.venue?.slug ?? null,
  };
}
