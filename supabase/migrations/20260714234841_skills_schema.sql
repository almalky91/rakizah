-- Grades table
CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  level INTEGER NOT NULL,
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  display_order INTEGER,
  grade_id UUID REFERENCES grades(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fields table (domains within subjects)
CREATE TABLE IF NOT EXISTS fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
  grade_id UUID REFERENCES grades(id) ON DELETE CASCADE,
  skill_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('basic', 'intermediate', 'advanced')),
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for tracking which skills are assigned to students
CREATE TABLE IF NOT EXISTS student_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 100),
  last_practiced TIMESTAMPTZ,
  times_practiced INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, skill_id)
);


-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subjects_grade_id ON subjects(grade_id);
CREATE INDEX IF NOT EXISTS idx_fields_subject_id ON fields(subject_id);
CREATE INDEX IF NOT EXISTS idx_skills_field_id ON skills(field_id);
CREATE INDEX IF NOT EXISTS idx_skills_grade_id ON skills(grade_id);
CREATE INDEX IF NOT EXISTS idx_student_skills_student_id ON student_skills(student_id);
CREATE INDEX IF NOT EXISTS idx_student_skills_skill_id ON student_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_teacher_skills_teacher_id ON teacher_skills(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_skills_skill_id ON teacher_skills(skill_id);

-- Insert initial grades data
INSERT INTO grades (id, name, level, display_order) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'الصف الثالث الابتدائي', 3, 1),
  ('b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22', 'الصف السادس الابتدائي', 6, 2),
  ('c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33', 'الصف التاسع المتوسط', 9, 3)
ON CONFLICT (id) DO NOTHING;

-- Insert initial subjects data
INSERT INTO subjects (id, name, icon, color, display_order, grade_id) VALUES
  -- Grade 3 subjects
  ('d3bbe66c-6f3e-7ef1-ee9a-9ee2ea613d44', 'الرياضيات', 'BookOpen', '#10b981', 1, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('e4ccf55d-5a4f-8ef2-ffab-aff3fb724e55', 'العلوم الطبيعية', 'Beaker', '#3b82f6', 2, 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  -- Grade 6 subjects
  ('d4bbe77d-7a4f-8ef2-ff0c-0ff3fc835e66', 'الرياضيات', 'BookOpen', '#10b981', 1, 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22'),
  ('e5ccf88e-8b5a-9ef3-aa1d-1aa4ad946f77', 'العلوم الطبيعية', 'Beaker', '#3b82f6', 2, 'b1ffc88a-8d1c-5ef9-cc7e-7cc0ce491b22'),
  -- Grade 9 subjects
  ('d5bbe99e-9c6b-0ef4-bb2e-2bb5be057a88', 'الرياضيات', 'BookOpen', '#10b981', 1, 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33'),
  ('e6ccf00f-0d7c-1ef5-cc3f-3cc6cf168b99', 'العلوم الطبيعية', 'Beaker', '#3b82f6', 2, 'c2aad77b-7e2d-6ef0-dd8f-8dd1df502c33')
ON CONFLICT (id) DO NOTHING;

-- Insert initial fields data
INSERT INTO fields (id, subject_id, name, display_order) VALUES
  -- Grade 3 Math fields (4 fields)
  ('f5dda44e-4b5a-9ef3-aabe-baa4ae835f66', 'd3bbe66c-6f3e-7ef1-ee9a-9ee2ea613d44', 'الأعداد والعمليات', 1),
  ('a6eeb33f-3c6b-0ef4-bbcf-cbb5bf946a77', 'd3bbe66c-6f3e-7ef1-ee9a-9ee2ea613d44', 'الجبر والتحليل', 2),
  ('b7ffc22a-2d7c-1ef5-ccda-dcc6ca057b88', 'd3bbe66c-6f3e-7ef1-ee9a-9ee2ea613d44', 'الهندسة والقياس', 3),
  ('c8aad11b-1e8d-2ef6-ddeb-edd7db168c99', 'd3bbe66c-6f3e-7ef1-ee9a-9ee2ea613d44', 'الإحصاء والاحتمالات', 4),
  
  -- Grade 3 Sciences fields (note: Grade 3 has no Sciences in skills.md, but adding for consistency)
  ('d9bbe00c-0f9e-3ef7-eefc-fee8ec279d00', 'e4ccf55d-5a4f-8ef2-ffab-aff3fb724e55', 'علوم الحياة', 1),
  ('e0ccf99d-9a0f-4ef8-ffad-aff9fd380e11', 'e4ccf55d-5a4f-8ef2-ffab-aff3fb724e55', 'العلوم الفيزيائية', 2),
  ('f1dda88e-8b1a-5ef9-aabe-baa0ae491f22', 'e4ccf55d-5a4f-8ef2-ffab-aff3fb724e55', 'علوم الأرض والفضاء', 3),
  
  -- Grade 6 Math fields (4 fields)
  ('f6dda55f-5c6b-0ef4-bbcf-cbb6bf057a00', 'd4bbe77d-7a4f-8ef2-ff0c-0ff3fc835e66', 'الأعداد والعمليات', 1),
  ('a7eeb44a-4d7c-1ef5-ccda-dcc7ca168b11', 'd4bbe77d-7a4f-8ef2-ff0c-0ff3fc835e66', 'الجبر والتحليل', 2),
  ('b8ffc33b-3e8d-2ef6-ddeb-edd8db279c22', 'd4bbe77d-7a4f-8ef2-ff0c-0ff3fc835e66', 'الهندسة والقياس', 3),
  ('c9aad22c-2f9e-3ef7-eefc-fee9ec380d33', 'd4bbe77d-7a4f-8ef2-ff0c-0ff3fc835e66', 'الإحصاء والاحتمالات', 4),
  
  -- Grade 6 Sciences fields (3 fields)
  ('d0bbe11d-1a0f-4ef8-ffad-aaa0fd491e44', 'e5ccf88e-8b5a-9ef3-aa1d-1aa4ad946f77', 'علوم الحياة', 1),
  ('e1ccf00e-0b1a-5ef9-aabe-bbb1ae502f55', 'e5ccf88e-8b5a-9ef3-aa1d-1aa4ad946f77', 'العلوم الفيزيائية', 2),
  ('f2dda99f-9c2b-6ef0-bbcf-ccc2bf613a66', 'e5ccf88e-8b5a-9ef3-aa1d-1aa4ad946f77', 'علوم الأرض والفضاء', 3),
  
  -- Grade 9 Math fields (4 fields)
  ('f7dda66a-6d7c-1ef5-ccda-ddd8ca168b11', 'd5bbe99e-9c6b-0ef4-bb2e-2bb5be057a88', 'الأعداد والعمليات', 1),
  ('a8eeb55b-5e8d-2ef6-ddeb-eee9db279c22', 'd5bbe99e-9c6b-0ef4-bb2e-2bb5be057a88', 'الجبر والتحليل', 2),
  ('b9ffc44c-4f9e-3ef7-eefc-fff0ec380d33', 'd5bbe99e-9c6b-0ef4-bb2e-2bb5be057a88', 'الهندسة والقياس', 3),
  ('c0aad33d-3a0f-4ef8-ffad-aaa1fd491e44', 'd5bbe99e-9c6b-0ef4-bb2e-2bb5be057a88', 'الإحصاء والاحتمالات', 4),
  
  -- Grade 9 Sciences fields (3 fields)
  ('d1bbe22e-2b1a-5ef9-aabe-bbb2ae502f55', 'e6ccf00f-0d7c-1ef5-cc3f-3cc6cf168b99', 'علوم الحياة', 1),
  ('e2ccf11f-1c2b-6ef0-bbcf-ccc3bf613a66', 'e6ccf00f-0d7c-1ef5-cc3f-3cc6cf168b99', 'العلوم الفيزيائية', 2),
  ('f3dda00a-0d3c-7ef1-ccda-ddd4ca724b77', 'e6ccf00f-0d7c-1ef5-cc3f-3cc6cf168b99', 'علوم الأرض والفضاء', 3)
ON CONFLICT (id) DO NOTHING;
