import { useParams } from 'react-router';

export function useVenueSlug(): string {
  return useParams().slug ?? '';
}
