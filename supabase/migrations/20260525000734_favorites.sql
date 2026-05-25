-- Favorites: a user's saved cafes. Owned strictly by the creating user.

create table public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  place_id text not null references public.cafes (place_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, place_id)
);

create index favorites_user_id_idx on public.favorites (user_id);

alter table public.favorites enable row level security;

create policy "Users can read their own favorites"
  on public.favorites for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can add their own favorites"
  on public.favorites for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can remove their own favorites"
  on public.favorites for delete
  to authenticated
  using (auth.uid() = user_id);
