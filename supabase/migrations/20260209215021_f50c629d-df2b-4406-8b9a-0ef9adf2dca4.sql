
-- Create a public view that excludes sensitive premium fields
CREATE VIEW public.public_profiles
WITH (security_invoker = on) AS
SELECT 
  id, user_id, username, display_name, avatar_url, bio,
  total_miles, total_trips, states_visited, nights_camped,
  photos_shared, level, xp, privacy_setting,
  created_at, updated_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated, anon;

-- Drop the old permissive SELECT policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Only allow users to read their own full profile (with premium fields)
CREATE POLICY "Users can view their own full profile"
  ON public.profiles FOR SELECT
  USING (user_id = auth.uid());
