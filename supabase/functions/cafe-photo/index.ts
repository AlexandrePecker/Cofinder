// GET /cafe-photo?photo_ref={ref}&max_width={px}
// Proxies a Google Places (New) photo request server-side so the API key
// never reaches the client. Requires a valid Supabase JWT.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const MAX_WIDTH_DEFAULT = 800;
const MAX_WIDTH_LIMIT = 1600;

// Google Places (New) photo resource name: places/{place_id}/photos/{photo_name}
// Only allow alphanumeric chars, hyphens, underscores, and forward slashes.
const PHOTO_REF_RE = /^[a-zA-Z0-9\-_/]+$/;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Verify JWT — prevent unauthenticated quota abuse.
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing authorization' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } },
  );
  const { error: authError } = await supabase.auth.getUser();
  if (authError) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(req.url);
  const photoRef = url.searchParams.get('photo_ref');
  if (!photoRef || !PHOTO_REF_RE.test(photoRef)) {
    return new Response(JSON.stringify({ error: 'Invalid photo_ref' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const rawWidth = parseInt(url.searchParams.get('max_width') ?? String(MAX_WIDTH_DEFAULT), 10);
  const maxWidth =
    Number.isFinite(rawWidth) && rawWidth > 0
      ? Math.min(rawWidth, MAX_WIDTH_LIMIT)
      : MAX_WIDTH_DEFAULT;

  const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const photoUrl = `https://places.googleapis.com/v1/${photoRef}/media?maxWidthPx=${maxWidth}&key=${apiKey}`;

  try {
    const res = await fetch(photoUrl);
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Places photo error ${res.status}` }), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const contentType = res.headers.get('Content-Type') ?? 'image/jpeg';
    return new Response(res.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
