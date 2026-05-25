-- Cafe cache. Populated only by the Places Edge Function (service role).
-- Clients read cafes; clients never write them. Caching here is a cost control:
-- it keeps repeat lookups off the paid Google Places API.

create table public.cafes (
  place_id text primary key,
  name text not null,
  address text,
  lat double precision not null,
  lng double precision not null,
  rating numeric(2, 1),
  user_ratings_total integer,
  price_level smallint,
  photo_ref text,
  raw jsonb,
  fetched_at timestamptz not null default now()
);

create index cafes_lat_lng_idx on public.cafes (lat, lng);

alter table public.cafes enable row level security;

-- Cafes are shared reference data: any signed-in user may read.
-- No insert/update/delete policy: writes go through the Edge Function's service role,
-- which bypasses RLS. Clients therefore cannot mutate the cache.
create policy "Cafes are readable by authenticated users"
  on public.cafes for select
  to authenticated
  using (true);

-- Search-area cache: maps a coarse geo cell to the place_ids found there, with a
-- fetched_at timestamp the Edge Function uses for TTL. Touched only by the service role.
create table public.places_search_cache (
  cell_key text primary key,
  place_ids text[] not null default '{}',
  fetched_at timestamptz not null default now()
);

alter table public.places_search_cache enable row level security;

-- Locked to clients entirely; only the service role (Edge Function) reads/writes it.
create policy "No client access to search cache"
  on public.places_search_cache for select
  to authenticated
  using (false);
