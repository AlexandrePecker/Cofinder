import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

import type { Review } from './types';

async function fetchReviews(placeId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(display_name)')
    .eq('place_id', placeId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data ?? [];
}

export function useReviews(placeId: string) {
  return useQuery({
    queryKey: ['reviews', placeId],
    queryFn: () => fetchReviews(placeId),
    enabled: !!placeId,
    staleTime: 2 * 60 * 1000,
  });
}
