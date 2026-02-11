-- Add CHECK constraint for comment content length (matches client-side 500 char limit)
-- Memory notes the DB limit should be 1000 chars per data-integrity-constraints
ALTER TABLE public.comments
ADD CONSTRAINT comments_content_length
CHECK (char_length(content) > 0 AND char_length(content) <= 1000);