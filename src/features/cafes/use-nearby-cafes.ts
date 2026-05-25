import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

import type { Cafe } from './types';

async function fetchNearbyCafes(lat: number, lng: number): Promise<Cafe[]> {
  const { data, error } = await supabase.functions.invoke('nearby-cafes', {
    body: { lat, lng },
  });
  if (error) throw error;
  return (data as { cafes: Cafe[] }).cafes ?? [];
}

export function useNearbyCafes(lat: number | null, lng: number | null) {
  return useQuery({
    queryKey: ['cafes', 'nearby', lat, lng],
    queryFn: () => fetchNearbyCafes(lat!, lng!),
    enabled: lat !== null && lng !== null,
    staleTime: 5 * 60 * 1000,
  });
}
