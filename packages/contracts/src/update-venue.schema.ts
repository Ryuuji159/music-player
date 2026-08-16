import { createVenueSchema, type CreateVenueDto } from './create-venue.schema';

export const updateVenueSchema = createVenueSchema;
export type UpdateVenueDto = CreateVenueDto;
