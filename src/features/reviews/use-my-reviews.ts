import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/auth-context';
import { supabase } from '@/lib/supabase';

export interface MyReview {
  id: string;
  place_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  cafes: {
    name: string;
    address: string | null;
    lat: number;
    lng: number;
    rating: number | null;
    user_ratings_total: number | null;
    price_level: number | null;
    photo_ref: string | null;
  } | null;
}

export function useMyReviews() {
  const { session } = useAuth();

  return useQuery({
    queryKey: ['reviews', 'mine', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(
          'id, place_id, rating, comment, created_at, cafes(name, address, lat, lng, rating, user_ratings_total, price_level, photo_ref)',
        )
        .eq('user_id', session!.user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as MyReview[];
    },
    enabled: !!session?.user.id,
    staleTime: 2 * 60 * 1000,
  });
}
