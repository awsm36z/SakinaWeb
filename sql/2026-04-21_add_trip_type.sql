-- Adds trip_type to the trips table so we can distinguish overnight trips
-- from day events. Existing rows default to 'overnight' and are unaffected.
--
-- Run this in the Supabase SQL Editor.

alter table public.trips
  add column if not exists trip_type text
  check (trip_type in ('overnight', 'day_event'))
  default 'overnight'
  not null;

-- Backfill any pre-existing rows just in case (no-op if default already applied).
update public.trips set trip_type = 'overnight' where trip_type is null;

-- Helpful index for filtering the listing pages.
create index if not exists trips_trip_type_idx on public.trips (trip_type);
