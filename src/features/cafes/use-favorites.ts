import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

const QUERY_KEY = ['favorites'];

async function fetchFavoriteIds(): Promise<Set<string>> {
  const { data, error } = await supabase.from('favorites').select('place_id');
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.place_id));
}

async function addFavorite(placeId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: user.id, place_id: placeId });
  if (error) throw error;
}

async function removeFavorite(placeId: string): Promise<void> {
  const { error } = await supabase.from('favorites').delete().eq('place_id', placeId);
  if (error) throw error;
}

export function useFavorites() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchFavoriteIds,
    staleTime: 60 * 1000,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ placeId, isFavorited }: { placeId: string; isFavorited: boolean }) => {
      if (isFavorited) {
        await removeFavorite(placeId);
      } else {
        await addFavorite(placeId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['favorite-cafes'] });
    },
  });
}
