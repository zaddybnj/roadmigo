
-- 1. Add server-side length constraints for user inputs
ALTER TABLE public.trips
  ADD CONSTRAINT trip_title_length CHECK (char_length(title) > 0 AND char_length(title) <= 200),
  ADD CONSTRAINT trip_description_length CHECK (char_length(description) <= 1000),
  ADD CONSTRAINT trip_notes_length CHECK (char_length(notes) <= 2000);

ALTER TABLE public.profiles
  ADD CONSTRAINT bio_length CHECK (char_length(bio) <= 500);

ALTER TABLE public.comments
  ADD CONSTRAINT comment_content_length CHECK (char_length(content) > 0 AND char_length(content) <= 1000);

-- 2. Harden handle_new_user with username sanitization
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  safe_username TEXT;
  safe_display_name TEXT;
BEGIN
  -- Sanitize username: only allow alphanumeric and underscores, limit length
  safe_username := LEFT(
    regexp_replace(
      LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)), ' ', '_')),
      '[^a-z0-9_]', '', 'g'
    ),
    20
  ) || '_' || SUBSTR(NEW.id::text, 1, 4);

  -- Sanitize display name: limit length
  safe_display_name := LEFT(
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    100
  );

  INSERT INTO public.profiles (user_id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    safe_username,
    safe_display_name,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;
