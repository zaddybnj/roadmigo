
-- Restrict badge self-awarding: block direct inserts, use a validated function instead
-- Drop the existing permissive policy
DROP POLICY IF EXISTS "System can award badges" ON public.user_badges;

-- Create a restrictive policy that blocks all direct inserts
CREATE POLICY "No direct badge inserts"
  ON public.user_badges FOR INSERT
  WITH CHECK (false);

-- Create a SECURITY DEFINER function for awarding badges with basic validation
CREATE OR REPLACE FUNCTION public.award_badge(
  p_badge_id TEXT,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow awarding badges to the calling user
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Cannot award badges to other users';
  END IF;

  -- Validate badge_id format (alphanumeric, underscores, hyphens, max 50 chars)
  IF p_badge_id IS NULL OR length(p_badge_id) > 50 OR p_badge_id !~ '^[a-z0-9_-]+$' THEN
    RAISE EXCEPTION 'Invalid badge identifier';
  END IF;

  -- Insert badge (ignore duplicates)
  INSERT INTO public.user_badges (user_id, badge_id)
  VALUES (p_user_id, p_badge_id)
  ON CONFLICT DO NOTHING;
END;
$$;
