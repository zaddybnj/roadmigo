
-- Change default privacy_setting from 'public' to 'private' for new users
ALTER TABLE public.profiles ALTER COLUMN privacy_setting SET DEFAULT 'private';
