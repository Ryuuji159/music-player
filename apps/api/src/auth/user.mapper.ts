import type { UserDto } from '@skrd/contracts';
import type { AuthUser } from './auth.types';

export function toUserDto(user: AuthUser): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    venues: user.venues.map((v) => ({
      id: v.id,
      slug: v.slug,
      name: v.name,
    })),
  };
}
