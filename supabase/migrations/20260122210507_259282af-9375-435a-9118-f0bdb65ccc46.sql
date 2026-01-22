-- Create storage bucket for trip photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-photos', 'trip-photos', true);

-- Storage policies for trip photos
CREATE POLICY "Anyone can view trip photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'trip-photos');

CREATE POLICY "Authenticated users can upload trip photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'trip-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'trip-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'trip-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);