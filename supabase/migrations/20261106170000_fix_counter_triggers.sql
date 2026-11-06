-- Fix like/comment counters on other users' trips and comments.
--
-- Migration 20260208054251 switched these trigger functions to SECURITY INVOKER.
-- RLS only lets a user UPDATE their own trips/comments, so when someone liked or
-- commented on another user's trip, the counter UPDATE matched zero rows and the
-- count silently never changed.
--
-- These functions only increment/decrement a counter on the row referenced by
-- the like/comment that was just inserted or deleted (which RLS already checked),
-- so running them as SECURITY DEFINER is safe. GREATEST(..., 0) keeps counts from
-- going negative if they were ever out of sync.

CREATE OR REPLACE FUNCTION public.update_trip_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.trips SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = NEW.trip_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.trips SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) WHERE id = OLD.trip_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.trips SET comments_count = COALESCE(comments_count, 0) + 1 WHERE id = NEW.trip_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.trips SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0) WHERE id = OLD.trip_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_comment_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.comments SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.comments SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$;

-- These are trigger-only functions; don't expose them as callable RPCs.
REVOKE EXECUTE ON FUNCTION public.update_trip_likes_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_comments_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_comment_likes_count() FROM PUBLIC, anon, authenticated;

-- Resync existing counts, since every like/comment on someone else's trip since
-- Feb 8 was missed.
-- Only rows whose counts are actually wrong are touched.
WITH actual AS (
  SELECT t.id,
    (SELECT count(*) FROM public.trip_likes l WHERE l.trip_id = t.id) AS likes,
    (SELECT count(*) FROM public.comments c WHERE c.trip_id = t.id) AS comments
  FROM public.trips t
)
UPDATE public.trips t
SET likes_count = a.likes, comments_count = a.comments
FROM actual a
WHERE a.id = t.id
  AND (t.likes_count IS DISTINCT FROM a.likes OR t.comments_count IS DISTINCT FROM a.comments);

WITH actual AS (
  SELECT c.id, (SELECT count(*) FROM public.comment_likes l WHERE l.comment_id = c.id) AS likes
  FROM public.comments c
)
UPDATE public.comments c
SET likes_count = a.likes
FROM actual a
WHERE a.id = c.id AND c.likes_count IS DISTINCT FROM a.likes;
