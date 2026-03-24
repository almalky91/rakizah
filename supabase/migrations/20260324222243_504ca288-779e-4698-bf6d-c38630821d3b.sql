
-- Add profile fields for public page banner
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS school_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS page_title text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;

-- Create public quiz results table for guest students
CREATE TABLE public_quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  teacher_id uuid NOT NULL,
  student_name text NOT NULL,
  score integer NOT NULL,
  total_questions integer NOT NULL,
  answers jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public_quiz_results ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can insert quiz results from public page
CREATE POLICY "Anyone can insert public quiz results" ON public_quiz_results FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Teachers can read their results
CREATE POLICY "Teachers can read their public quiz results" ON public_quiz_results FOR SELECT TO authenticated USING (auth.uid() = teacher_id);

-- Anon read policies for the public teacher page
CREATE POLICY "Anon can view profiles" ON profiles FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can view quizzes" ON quizzes FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can view games" ON games FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can view videos" ON videos FOR SELECT TO anon USING (true);
