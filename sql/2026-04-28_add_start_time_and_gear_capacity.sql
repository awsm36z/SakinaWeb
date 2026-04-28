-- Adds three optional columns to public.trips that day events use:
--   start_time  : free-text time-of-day descriptor (e.g. "Post-Maghrib",
--                 "2pm", "After sunset"). Kept as text so we can support
--                 prayer-time references and other non-clock descriptions.
--   gear_capacity : optional integer for events that loan equipment
--                   (Catch & Cook borrows fishing gear).
--   gear_label    : per-event label for the gear opt-out checkbox shown
--                   on the RSVP form (e.g. "I have my own fishing gear").
--
-- All three are nullable so existing trips/events are unaffected.

alter table public.trips
  add column if not exists start_time text,
  add column if not exists gear_capacity integer,
  add column if not exists gear_label text;

alter table public.trips
  add constraint trips_gear_capacity_nonnegative
  check (gear_capacity is null or gear_capacity >= 0);
