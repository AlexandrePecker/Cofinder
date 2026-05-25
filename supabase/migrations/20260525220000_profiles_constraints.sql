-- Enforce a maximum length on display_name so the DB rejects payloads the
-- client UI already caps at 80 chars. Belt-and-suspenders: client caps input,
-- DB rejects anything that bypasses the UI.
alter table public.profiles
  add constraint profiles_display_name_length
  check (char_length(display_name) <= 80);
