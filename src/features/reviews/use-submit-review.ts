import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

interface SubmitReviewInput {
  placeId: string;
  userId: string;
  rating: number;
  comment: string | null;
}

async function submitReview({ placeId, userId, rating, comment }: SubmitReviewInput) {
  const { data, error } = await supabase
    .from('reviews')
    .upsert(
      { user_id: userId, place_id: placeId, rating, comment },
      { onConflict: 'user_id,place_id' },
    )
    .select('id');
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('Avaliação não foi salva. Tente novamente.');
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitReview,
    onSuccess: (_data, { placeId, userId }) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', placeId] });
      queryClient.invalidateQueries({ queryKey: ['reviews', 'mine', userId] });
    },
  });
}
