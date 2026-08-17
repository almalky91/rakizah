'use client';

import { GraduationCap } from 'lucide-react';
import { Grade, Subject, Field, Skill } from './types';
import { GradeNode } from './GradeNode';

interface SkillsTreeProps {
  grades: Grade[];
  subjects: Subject[];
  fields: Field[];
  skills: Skill[];
  expandedGrades: Set<string>;
  expandedSubjects: Set<string>;
  expandedFields: Set<string>;
  onToggleGrade: (gradeId: string) => void;
  onToggleSubject: (subjectId: string) => void;
  onToggleField: (fieldId: string) => void;
  onDeleteSkill: (skillId: string) => void;
}

export const SkillsTree = ({
  grades,
  subjects,
  fields,
  skills,
  expandedGrades,
  expandedSubjects,
  expandedFields,
  onToggleGrade,
  onToggleSubject,
  onToggleField,
  onDeleteSkill
}: SkillsTreeProps) => {
  if (grades.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p>لا توجد صفوف دراسية بعد</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {grades.sort((a, b) => a.display_order - b.display_order).map(grade => (
        <GradeNode
          key={grade.id}
          grade={grade}
          subjects={subjects}
          fields={fields}
          skills={skills}
          isExpanded={expandedGrades.has(grade.id)}
          expandedSubjects={expandedSubjects}
          expandedFields={expandedFields}
          onToggle={() => onToggleGrade(grade.id)}
          onToggleSubject={onToggleSubject}
          onToggleField={onToggleField}
          onDeleteSkill={onDeleteSkill}
        />
      ))}
    </div>
  );
};
