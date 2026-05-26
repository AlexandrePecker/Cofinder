-- Dev seed: 15 cafés em São Paulo para testar sem API key.
-- Rodar no SQL Editor do Supabase (usa service role, bypassa RLS).
-- cell_key = lat.toFixed(2):lng.toFixed(2):radius_m — deve cobrir o centro de SP.

insert into public.cafes (place_id, name, address, lat, lng, rating, user_ratings_total, price_level, photo_ref, fetched_at)
values
  ('seed_001', 'Café Floresta',         'R. Augusta, 1492 - Consolação, São Paulo',           -23.5503, -46.6527, 4.7, 312,  2, null, now()),
  ('seed_002', 'Santo Grão',            'R. Oscar Freire, 413 - Jardins, São Paulo',           -23.5614, -46.6697, 4.6, 891,  3, null, now()),
  ('seed_003', 'Coffee Lab',            'R. Fradique Coutinho, 1340 - Pinheiros, São Paulo',  -23.5673, -46.6923, 4.8, 1204, 3, null, now()),
  ('seed_004', 'Padoca do Maní',        'R. Joaquim Antunes, 210 - Pinheiros, São Paulo',     -23.5708, -46.6872, 4.5, 567,  2, null, now()),
  ('seed_005', 'Café Cultura',          'Shopping Iguatemi - Av. Brig. Faria Lima, 2232',     -23.5762, -46.6917, 4.3, 445,  2, null, now()),
  ('seed_006', 'Nono Café',             'R. Lisboa, 307 - Pinheiros, São Paulo',               -23.5655, -46.6901, 4.9, 203,  2, null, now()),
  ('seed_007', 'Café do Mercado',       'Mercado Municipal - R. da Cantareira, 306',           -23.5413, -46.6295, 4.1, 2341, 1, null, now()),
  ('seed_008', 'Guilhotina Coffee',     'R. Funchal, 418 - Vila Olímpia, São Paulo',           -23.5948, -46.6851, 4.6, 388,  2, null, now()),
  ('seed_009', 'Octavio Café',          'Al. Lorena, 1748 - Jardim Paulista, São Paulo',       -23.5676, -46.6593, 4.4, 712,  2, null, now()),
  ('seed_010', 'Café Girondino',        'R. Boa Vista, 365 - Centro, São Paulo',               -23.5455, -46.6340, 3.9, 1567, 1, null, now()),
  ('seed_011', 'Lola Bistrô',           'R. Coropé, 88 - Pinheiros, São Paulo',                -23.5621, -46.6957, 4.2, 289,  2, null, now()),
  ('seed_012', 'Graça Mineira',         'R. Bela Cintra, 2064 - Jardins, São Paulo',           -23.5591, -46.6629, 3.5, 98,   1, null, now()),
  ('seed_013', 'Tim Maia Café',         'Av. Paulista, 2073 - MASP, São Paulo',                -23.5613, -46.6560, 4.0, 832,  1, null, now()),
  ('seed_014', 'Unique Garden Café',    'R. Jesuíno Arruda, 900 - Itaim Bibi, São Paulo',     -23.5866, -46.6714, 4.8, 156,  3, null, now()),
  ('seed_015', 'Padaria Francesa',      'R. Haddock Lobo, 1400 - Jardins, São Paulo',          -23.5582, -46.6620, 3.2, 445,  1, null, now())
on conflict (place_id) do update
  set name = excluded.name,
      address = excluded.address,
      lat = excluded.lat,
      lng = excluded.lng,
      rating = excluded.rating,
      user_ratings_total = excluded.user_ratings_total,
      price_level = excluded.price_level,
      fetched_at = now();

-- Cache entries para raios comuns centrados no centro de SP (-23.55:-46.63).
-- Cobre buscas com raio 1000, 5000, 10000, 20000 e 50000 metros.
insert into public.places_search_cache (cell_key, place_ids, fetched_at)
values
  ('-23.55:-46.63:1000',  array['seed_007', 'seed_010', 'seed_013'], now()),
  ('-23.55:-46.63:5000',  array['seed_001', 'seed_007', 'seed_009', 'seed_010', 'seed_013'], now()),
  ('-23.55:-46.63:10000', array['seed_001', 'seed_002', 'seed_003', 'seed_004', 'seed_005', 'seed_006', 'seed_007', 'seed_008', 'seed_009', 'seed_010', 'seed_011', 'seed_013'], now()),
  ('-23.55:-46.63:20000', array['seed_001', 'seed_002', 'seed_003', 'seed_004', 'seed_005', 'seed_006', 'seed_007', 'seed_008', 'seed_009', 'seed_010', 'seed_011', 'seed_012', 'seed_013', 'seed_014', 'seed_015'], now()),
  ('-23.55:-46.63:50000', array['seed_001', 'seed_002', 'seed_003', 'seed_004', 'seed_005', 'seed_006', 'seed_007', 'seed_008', 'seed_009', 'seed_010', 'seed_011', 'seed_012', 'seed_013', 'seed_014', 'seed_015'], now())
on conflict (cell_key) do update
  set place_ids = excluded.place_ids,
      fetched_at = now();
