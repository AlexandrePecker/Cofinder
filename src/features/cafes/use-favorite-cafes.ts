import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

import type { Cafe } from './types';

async function fetchFavoriteCafes(): Promise<Cafe[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select(
      `
      created_at,
      cafes (
        place_id, name, address, lat, lng, rating, user_ratings_total, price_level, photo_ref
      )
    `,
    )
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? [])
    .map((row) => {
      const raw = row.cafes;
      const cafe = Array.isArray(raw) ? (raw[0] ?? null) : raw;
      return cafe as Cafe | null;
    })
    .filter((cafe): cafe is Cafe => cafe !== null);
}

export function useFavoriteCafes() {
  return useQuery({
    queryKey: ['favorite-cafes'],
    queryFn: fetchFavoriteCafes,
    staleTime: 60 * 1000,
  });
}
