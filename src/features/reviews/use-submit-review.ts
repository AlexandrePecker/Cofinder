import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

interface SubmitReviewInput {
  placeId: string;
  userId: string;
  rating: number;
  comment: string | null;
}

async function submitReview({ placeId, userId, rating, comment }: SubmitReviewInput) {
  const { error } = await supabase
    .from('reviews')
    .upsert(
      { user_id: userId, place_id: placeId, rating, comment },
      { onConflict: 'user_id,place_id' },
    );
  if (error) throw error;
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitReview,
    onSuccess: (_data, { placeId }) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', placeId] });
    },
  });
}
