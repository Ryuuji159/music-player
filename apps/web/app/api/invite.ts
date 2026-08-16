import {
  joinResponseSchema,
  venueInviteSchema,
  type JoinResponseDto,
  type VenueInviteDto,
} from '@skrd/contracts';
import { request } from './http';

export const inviteAPI = {
  current: (slug: string): Promise<VenueInviteDto> => {
    return request(`/venues/${slug}/invite`, venueInviteSchema);
  },
  rotate: (slug: string): Promise<VenueInviteDto> => {
    return request(`/venues/${slug}/invite/rotate`, venueInviteSchema, {
      method: 'POST',
    });
  },
  join: (token: string): Promise<JoinResponseDto> => {
    return request(`/join/${token}`, joinResponseSchema, { method: 'POST' });
  },
};
