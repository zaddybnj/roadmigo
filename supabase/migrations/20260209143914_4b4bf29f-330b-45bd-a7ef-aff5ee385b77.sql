
-- Fix comments SELECT policy to respect friends-only trip privacy
DROP POLICY IF EXISTS "Anyone can view comments on public trips" ON public.comments;

CREATE POLICY "View comments based on trip privacy"
  ON public.comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM trips
    WHERE trips.id = comments.trip_id
    AND (
      trips.privacy = 'public'
      OR trips.user_id = auth.uid()
      OR (trips.privacy = 'friends' AND EXISTS (
        SELECT 1 FROM follows
        WHERE follows.follower_id = auth.uid()
        AND follows.following_id = trips.user_id
      ))
    )
  ));
