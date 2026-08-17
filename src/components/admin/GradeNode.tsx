import { ChevronRight, ChevronDown, GraduationCap } from 'lucide-react';
import { Grade, Subject, Field, Skill } from './types';
import { SubjectNode } from './SubjectNode';

interface GradeNodeProps {
  grade: Grade;
  subjects: Subject[];
  fields: Field[];
  skills: Skill[];
  isExpanded: boolean;
  expandedSubjects: Set<string>;
  expandedFields: Set<string>;
  onToggle: () => void;
  onToggleSubject: (subjectId: string) => void;
  onToggleField: (fieldId: string) => void;
  onDeleteSkill: (skillId: string) => void;
}

export const GradeNode = ({
  grade,
  subjects,
  fields,
  skills,
  isExpanded,
  expandedSubjects,
  expandedFields,
  onToggle,
  onToggleSubject,
  onToggleField,
  onDeleteSkill
}: GradeNodeProps) => {
  // Calculate total skills for this grade
  const gradeSkills = skills.filter(s => s.grade_id === grade.id);
  console.log("Subjects", subjects);
  console.log("Feilds", fields);
  return (
    <div className="border rounded-lg">
      {/* Grade Level */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          )}
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="text-right">
            <p className="font-semibold">{grade.name}</p>
            <p className="text-xs text-muted-foreground">
              {gradeSkills.length} مهارة
            </p>
          </div>
        </div>
      </button>

      {/* Subjects under Grade */}
      {isExpanded && (
        <div className="px-4 pb-2 space-y-2">
          {subjects.sort((a, b) => a.display_order - b.display_order).map(subject =>
          subject.grade_id === grade.id ?
          (
            <SubjectNode
              key={subject.id}
              subject={subject}
              gradeId={grade.id}
              fields={fields}
              skills={skills}
              isExpanded={expandedSubjects.has(subject.id)}
              expandedFields={expandedFields}
              onToggle={() => onToggleSubject(subject.id)}
              onToggleField={onToggleField}
              onDeleteSkill={onDeleteSkill}
            />
          ) :
          <></>
        )}
        </div>
      )}
    </div>
  );
};
