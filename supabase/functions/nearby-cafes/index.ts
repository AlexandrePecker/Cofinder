// POST /nearby-cafes  { lat, lng, radius? }
// Returns well-rated cafes near a point. Cache-first to keep repeat lookups off
// the paid Places API: a coarse geo cell maps to its place_ids for CACHE_TTL_MS.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { searchNearbyCafes } from '../_shared/places.ts';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const DEFAULT_RADIUS_M = 1500;
const MAX_RADIUS_M = 5000;

// ~1.1km grid (2 decimal places) keyed with the radius bucket.
function cellKey(lat: number, lng: number, radius: number): string {
  return `${lat.toFixed(2)}:${lng.toFixed(2)}:${radius}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const lat = Number(body.lat);
    const lng = Number(body.lng);
    let radius = Number(body.radius ?? DEFAULT_RADIUS_M);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return jsonResponse({ error: 'lat and lng must be numbers' }, 400);
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return jsonResponse({ error: 'lat/lng out of range' }, 400);
    }
    if (!Number.isFinite(radius) || radius <= 0) radius = DEFAULT_RADIUS_M;
    radius = Math.min(radius, MAX_RADIUS_M);

    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      return jsonResponse({ error: 'Server misconfigured: missing Places API key' }, 500);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const key = cellKey(lat, lng, radius);

    const { data: cached } = await supabase
      .from('places_search_cache')
      .select('place_ids, fetched_at')
      .eq('cell_key', key)
      .maybeSingle();

    const isFresh =
      cached && Date.now() - new Date(cached.fetched_at).getTime() < CACHE_TTL_MS;

    if (isFresh && cached.place_ids.length > 0) {
      const { data: cafes } = await supabase
        .from('cafes')
        .select('*')
        .in('place_id', cached.place_ids);
      return jsonResponse({ source: 'cache', cafes: cafes ?? [] });
    }

    const cafes = await searchNearbyCafes(apiKey, lat, lng, radius);
    const fetchedAt = new Date().toISOString();

    if (cafes.length > 0) {
      await supabase
        .from('cafes')
        .upsert(
          cafes.map((c) => ({ ...c, fetched_at: fetchedAt })),
          { onConflict: 'place_id' },
        );
    }

    await supabase.from('places_search_cache').upsert({
      cell_key: key,
      place_ids: cafes.map((c) => c.place_id),
      fetched_at: fetchedAt,
    });

    return jsonResponse({ source: 'places', cafes });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return jsonResponse({ error: message }, 500);
  }
});
