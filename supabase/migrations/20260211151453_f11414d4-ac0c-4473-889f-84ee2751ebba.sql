-- Recreate public_profiles view with security_invoker = true
-- This ensures the view respects the profiles table's RLS policies
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = true)
AS
SELECT
  id,
  user_id,
  username,
  display_name,
  avatar_url,
  bio,
  total_miles,
  total_trips,
  states_visited,
  nights_camped,
  photos_shared,
  level,
  xp,
  privacy_setting,
  created_at,
  updated_at
FROM public.profiles;