-- Run after initial schema.sql. Adds onboarding + notification fields.

alter table public.user_profiles
  add column if not exists onboarding_answers jsonb;

alter table public.user_profiles
  add column if not exists notification_settings jsonb default '{"pattern_alerts": true, "weekly_digest": false, "monthly_profile": true}'::jsonb;
