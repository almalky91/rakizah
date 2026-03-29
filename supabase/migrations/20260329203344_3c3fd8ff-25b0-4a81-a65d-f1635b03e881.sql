
-- Indexes on teacher_id (most common filter)
CREATE INDEX IF NOT EXISTS idx_quizzes_teacher_id ON public.quizzes (teacher_id);
CREATE INDEX IF NOT EXISTS idx_videos_teacher_id ON public.videos (teacher_id);
CREATE INDEX IF NOT EXISTS idx_games_teacher_id ON public.games (teacher_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_teacher_id ON public.quiz_results (teacher_id);
CREATE INDEX IF NOT EXISTS idx_public_quiz_results_teacher_id ON public.public_quiz_results (teacher_id);
CREATE INDEX IF NOT EXISTS idx_video_views_teacher_id ON public.video_views (teacher_id);
CREATE INDEX IF NOT EXISTS idx_public_video_views_teacher_id ON public.public_video_views (teacher_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_teacher_id ON public.game_scores (teacher_id);

-- Indexes on student_id
CREATE INDEX IF NOT EXISTS idx_quiz_results_student_id ON public.quiz_results (student_id);
CREATE INDEX IF NOT EXISTS idx_video_views_student_id ON public.video_views (student_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_student_id ON public.game_scores (student_id);

-- Index on user_roles for role lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles (user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles (role);

-- Index on profiles public_slug for public page lookups
CREATE INDEX IF NOT EXISTS idx_profiles_public_slug ON public.profiles (public_slug);

-- Index on quiz_id for result lookups
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON public.quiz_results (quiz_id);
CREATE INDEX IF NOT EXISTS idx_public_quiz_results_quiz_id ON public.public_quiz_results (quiz_id);

-- Index on video_id for view lookups
CREATE INDEX IF NOT EXISTS idx_video_views_video_id ON public.video_views (video_id);
CREATE INDEX IF NOT EXISTS idx_public_video_views_video_id ON public.public_video_views (video_id);
