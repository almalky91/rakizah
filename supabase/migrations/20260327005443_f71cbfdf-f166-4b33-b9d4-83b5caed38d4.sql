
CREATE TABLE public.public_video_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
  teacher_id uuid NOT NULL,
  student_name text NOT NULL,
  viewed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.public_video_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert public video views" ON public.public_video_views FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Teachers can read their public video views" ON public.public_video_views FOR SELECT TO authenticated USING (auth.uid() = teacher_id);
CREATE POLICY "Anon can read public video views" ON public.public_video_views FOR SELECT TO anon USING (true);
