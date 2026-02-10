
-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view their own full profile" ON public.profiles;

-- Create updated policy that supports all three privacy tiers
CREATE POLICY "View profiles based on privacy setting"
  ON public.profiles FOR SELECT
  USING (
    privacy_setting = 'public'
    OR user_id = auth.uid()
    OR (privacy_setting = 'friends' AND EXISTS (
      SELECT 1 FROM follows
      WHERE follows.follower_id = auth.uid()
      AND follows.following_id = profiles.user_id
    ))
  );
