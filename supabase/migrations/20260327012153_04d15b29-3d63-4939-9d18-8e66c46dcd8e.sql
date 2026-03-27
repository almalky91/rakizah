
CREATE POLICY "Teachers can update own quizzes" ON public.quizzes
FOR UPDATE TO authenticated
USING (auth.uid() = teacher_id)
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own games" ON public.games
FOR UPDATE TO authenticated
USING (auth.uid() = teacher_id)
WITH CHECK (auth.uid() = teacher_id);
