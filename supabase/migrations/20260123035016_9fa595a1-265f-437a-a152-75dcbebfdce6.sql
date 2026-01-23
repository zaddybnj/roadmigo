-- Add milestones column to trips table for storing notable locations
ALTER TABLE public.trips ADD COLUMN milestones jsonb DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.trips.milestones IS 'Array of milestone objects with id, name, category, and optional notes';