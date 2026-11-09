-- Server-side profile stats, protected computed columns, mutual-follow "friends",
-- and tighter visibility rules. See PR description for the reasoning behind each.

------------------------------------------------------------------------------
-- 1. Level / XP formula (kept in sync with src/lib/gamification.ts)
--    xp     = miles + 100*trips + 50*nights + 250*states + 10*photos
--    level  L is reached at 250 * L * (L - 1) xp  (L2 = 500, L3 = 1500, L4 = 3000 ...)
------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.level_for_xp(p_xp integer)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT GREATEST(1, floor((1 + sqrt(1 + GREATEST(p_xp, 0) / 62.5)) / 2)::integer);
$$;

------------------------------------------------------------------------------
-- 2. Recompute a user's profile totals from their completed trips
------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.recompute_profile_stats(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trips integer;
  v_miles integer;
  v_nights integer;
  v_photos integer;
  v_states text[];
  v_xp integer;
BEGIN
  SELECT
    count(*),
    COALESCE(sum(GREATEST(distance, 0)), 0),
    COALESCE(sum(GREATEST(nights, 0)), 0),
    COALESCE(sum(COALESCE(cardinality(photos), 0)), 0)
  INTO v_trips, v_miles, v_nights, v_photos
  FROM public.trips
  WHERE user_id = p_user_id AND status = 'completed';

  SELECT COALESCE(array_agg(DISTINCT s ORDER BY s), '{}')
  INTO v_states
  FROM public.trips t, unnest(t.states) AS s
  WHERE t.user_id = p_user_id AND t.status = 'completed';

  v_xp := v_miles + 100 * v_trips + 50 * v_nights + 250 * cardinality(v_states) + 10 * v_photos;

  UPDATE public.profiles SET
    total_trips = v_trips,
    total_miles = v_miles,
    nights_camped = v_nights,
    photos_shared = v_photos,
    states_visited = v_states,
    xp = v_xp,
    level = public.level_for_xp(v_xp)
  WHERE user_id = p_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.recompute_profile_stats(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.trips_recompute_stats_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.recompute_profile_stats(OLD.user_id);
    RETURN NULL;
  END IF;
  -- Skip updates that can't change totals (likes/comments counters, notes, etc.)
  IF TG_OP = 'UPDATE'
     AND NEW.status IS NOT DISTINCT FROM OLD.status
     AND NEW.distance IS NOT DISTINCT FROM OLD.distance
     AND NEW.nights IS NOT DISTINCT FROM OLD.nights
     AND NEW.states IS NOT DISTINCT FROM OLD.states
     AND NEW.photos IS NOT DISTINCT FROM OLD.photos THEN
    RETURN NULL;
  END IF;
  PERFORM public.recompute_profile_stats(NEW.user_id);
  RETURN NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.trips_recompute_stats_trigger() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trips_recompute_stats ON public.trips;
CREATE TRIGGER trips_recompute_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.trips_recompute_stats_trigger();

------------------------------------------------------------------------------
-- 3. Clients can't write computed / billing columns
--    (current_user is 'authenticated'/'anon' for app requests; SECURITY DEFINER
--    functions and the service role run as other roles and are unaffected.)
------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_user NOT IN ('authenticated', 'anon') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.total_miles := 0; NEW.total_trips := 0; NEW.nights_camped := 0;
    NEW.photos_shared := 0; NEW.states_visited := '{}'; NEW.xp := 0; NEW.level := 1;
    NEW.is_premium := false; NEW.premium_expires_at := NULL;
  ELSE
    NEW.user_id := OLD.user_id;
    NEW.total_miles := OLD.total_miles; NEW.total_trips := OLD.total_trips;
    NEW.nights_camped := OLD.nights_camped; NEW.photos_shared := OLD.photos_shared;
    NEW.states_visited := OLD.states_visited; NEW.xp := OLD.xp; NEW.level := OLD.level;
    NEW.is_premium := OLD.is_premium; NEW.premium_expires_at := OLD.premium_expires_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_columns ON public.profiles;
CREATE TRIGGER protect_profile_columns
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_columns();

CREATE OR REPLACE FUNCTION public.protect_trip_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_user NOT IN ('authenticated', 'anon') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.likes_count := 0;
    NEW.comments_count := 0;
  ELSE
    NEW.user_id := OLD.user_id;
    NEW.likes_count := OLD.likes_count;
    NEW.comments_count := OLD.comments_count;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_trip_columns ON public.trips;
CREATE TRIGGER protect_trip_columns
  BEFORE INSERT OR UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.protect_trip_columns();

CREATE OR REPLACE FUNCTION public.protect_comment_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_user NOT IN ('authenticated', 'anon') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.likes_count := 0;
  ELSE
    NEW.user_id := OLD.user_id;
    NEW.trip_id := OLD.trip_id;
    NEW.likes_count := OLD.likes_count;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_comment_columns ON public.comments;
CREATE TRIGGER protect_comment_columns
  BEFORE INSERT OR UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.protect_comment_columns();

-- Badges are now computed from trips in the app; nothing should self-award.
REVOKE EXECUTE ON FUNCTION public.award_badge(text, uuid) FROM PUBLIC, anon, authenticated;

------------------------------------------------------------------------------
-- 4. "Friends" = people who follow each other
------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.are_friends(a uuid, b uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a IS NOT NULL AND b IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.follows WHERE follower_id = a AND following_id = b)
    AND EXISTS (SELECT 1 FROM public.follows WHERE follower_id = b AND following_id = a);
$$;

GRANT EXECUTE ON FUNCTION public.are_friends(uuid, uuid) TO authenticated;

DROP POLICY IF EXISTS "Public trips are viewable by everyone" ON public.trips;
CREATE POLICY "View trips based on privacy"
  ON public.trips FOR SELECT
  USING (
    user_id = auth.uid()
    OR (status = 'completed' AND (
      privacy = 'public'
      OR (privacy = 'friends' AND public.are_friends(auth.uid(), user_id))
    ))
  );

DROP POLICY IF EXISTS "View profiles based on privacy setting" ON public.profiles;
CREATE POLICY "View profiles based on privacy setting"
  ON public.profiles FOR SELECT
  USING (
    user_id = auth.uid()
    OR privacy_setting = 'public'
    OR (privacy_setting = 'friends' AND public.are_friends(auth.uid(), user_id))
  );

-- Comments / likes follow the visibility of the trip they belong to.
-- (The sub-select runs with the caller's permissions, so trips RLS applies.)
DROP POLICY IF EXISTS "View comments based on trip privacy" ON public.comments;
CREATE POLICY "View comments on visible trips"
  ON public.comments FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = comments.trip_id));

DROP POLICY IF EXISTS "Authenticated users can comment" ON public.comments;
CREATE POLICY "Users can comment on visible trips"
  ON public.comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.trips t WHERE t.id = comments.trip_id)
  );

DROP POLICY IF EXISTS "Anyone can view trip likes" ON public.trip_likes;
CREATE POLICY "View likes on visible trips"
  ON public.trip_likes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_likes.trip_id));

DROP POLICY IF EXISTS "Authenticated users can like trips" ON public.trip_likes;
CREATE POLICY "Users can like visible trips"
  ON public.trip_likes FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_likes.trip_id)
  );

DROP POLICY IF EXISTS "Anyone can view comment likes" ON public.comment_likes;
CREATE POLICY "View likes on visible comments"
  ON public.comment_likes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.comments c WHERE c.id = comment_likes.comment_id));

DROP POLICY IF EXISTS "Authenticated users can like comments" ON public.comment_likes;
CREATE POLICY "Users can like visible comments"
  ON public.comment_likes FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.comments c WHERE c.id = comment_likes.comment_id)
  );

-- Duplicate of comment_content_length from 20260210160827
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_content_length;

------------------------------------------------------------------------------
-- 5. Name + avatar for people shown in the feed/comments, even if their full
--    profile is private. Only returns ids the caller asks for (no browsing).
------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_profile_cards(p_user_ids uuid[])
RETURNS TABLE (user_id uuid, username text, display_name text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.username, p.display_name, p.avatar_url
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
    AND p.user_id = ANY (p_user_ids[1:200]);
$$;

REVOKE EXECUTE ON FUNCTION public.get_profile_cards(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_profile_cards(uuid[]) TO authenticated;

------------------------------------------------------------------------------
-- 6. Storage: trip photos go in the uploader's own folder, images only, 10 MB
------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can upload trip photos" ON storage.objects;
CREATE POLICY "Users can upload trip photos to their own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'trip-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

UPDATE storage.buckets
SET file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/gif']
WHERE id IN ('trip-photos', 'avatars');

------------------------------------------------------------------------------
-- 7. Backfill: drop blob: photo URLs (they never worked for anyone else) and
--    recompute everyone's stats with the new formula.
------------------------------------------------------------------------------
UPDATE public.trips
SET photos = COALESCE(ARRAY(SELECT p FROM unnest(photos) AS p WHERE p NOT LIKE 'blob:%'), '{}')
WHERE EXISTS (SELECT 1 FROM unnest(photos) AS p WHERE p LIKE 'blob:%');

DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT user_id FROM public.profiles LOOP
    PERFORM public.recompute_profile_stats(r.user_id);
  END LOOP;
END $$;
