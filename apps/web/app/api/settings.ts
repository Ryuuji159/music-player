import {
  venueSettingsSchema,
  type VenueSettingsDto,
} from '@skrd/contracts';
import { request } from './http';

export const settingsAPI = {
  get: (slug: string): Promise<VenueSettingsDto> => {
    return request(`/venues/${slug}/settings`, venueSettingsSchema);
  },
  update: (
    slug: string,
    skipOnError: boolean,
  ): Promise<VenueSettingsDto> => {
    return request(`/venues/${slug}/settings`, venueSettingsSchema, {
      method: 'PATCH',
      body: JSON.stringify({ skipOnError }),
    });
  },
};
