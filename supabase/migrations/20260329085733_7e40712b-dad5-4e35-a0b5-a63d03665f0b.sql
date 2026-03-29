-- Allow teachers to delete their own public quiz results
CREATE POLICY "Teachers can delete their public quiz results"
ON public.public_quiz_results
FOR DELETE
TO authenticated
USING (auth.uid() = teacher_id);

-- Allow teachers to delete their own public video views
CREATE POLICY "Teachers can delete their public video views"
ON public.public_video_views
FOR DELETE
TO authenticated
USING (auth.uid() = teacher_id);