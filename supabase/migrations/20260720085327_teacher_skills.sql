
CREATE TABLE teacher_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(teacher_id, skill_id)
);

CREATE INDEX idx_teacher_skills_teacher_id ON teacher_skills(teacher_id);
CREATE INDEX idx_teacher_skills_skill_id ON teacher_skills(skill_id);
