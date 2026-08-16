import {
  venueListSchema,
  venueSchema,
  type VenueDto,
} from '@skrd/contracts';
import { z } from 'zod';
import { request } from './http';

export const venuesAPI = {
  list: (): Promise<VenueDto[]> => request('/venues', venueListSchema),
  create: (slug: string, name: string): Promise<VenueDto> => {
    return request('/venues', venueSchema, {
      method: 'POST',
      body: JSON.stringify({ slug, name }),
    });
  },
  remove: (id: string) => {
    return request(`/venues/${id}`, z.unknown(), { method: 'DELETE' });
  },
};
