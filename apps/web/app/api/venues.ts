import {
  venueListSchema,
  venueSchema,
  type UpdateVenueDto,
  type VenueDto,
} from '@skrd/contracts';
import { z } from 'zod';
import { request } from './http';

export const venuesAPI = {
  list: (): Promise<VenueDto[]> => request('/venues', venueListSchema),
  create: (input: { name: string; slug?: string }): Promise<VenueDto> => {
    return request('/venues', venueSchema, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  update: (id: string, input: UpdateVenueDto): Promise<VenueDto> => {
    return request(`/venues/${id}`, venueSchema, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
  remove: (id: string) => {
    return request(`/venues/${id}`, z.unknown(), { method: 'DELETE' });
  },
};
