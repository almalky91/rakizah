import { ChevronRight, ChevronDown, BookOpen } from 'lucide-react';
import { Subject, Field, Skill } from './types';
import { getFieldSkills } from './skillsUtils';
import { FieldNode } from './FieldNode';

interface SubjectNodeProps {
  subject: Subject;
  gradeId: string;
  fields: Field[];
  skills: Skill[];
  isExpanded: boolean;
  expandedFields: Set<string>;
  onToggle: () => void;
  onToggleField: (fieldId: string) => void;
  onDeleteSkill: (skillId: string) => void;
}

export const SubjectNode = ({
  subject,
  gradeId,
  fields,
  skills,
  isExpanded,
  expandedFields,
  onToggle,
  onToggleField,
  onDeleteSkill
}: SubjectNodeProps) => {

  // Calculate total skills for this subject in this grade
  const totalSkills = fields
    .filter(f => f.subject_id === subject.id)
    .flatMap(f => getFieldSkills(skills, f.id, gradeId))
    .length;
  return (
    <div className="mr-8 border rounded-lg bg-muted/30">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${subject.color}20` }}
          >
            <BookOpen className="w-4 h-4" style={{ color: subject.color }} />
          </div>
          <div className="text-right">
            <p className="font-medium text-sm">{subject.name}</p>
            <p className="text-xs text-muted-foreground">
              {totalSkills} مهارة
            </p>
          </div>
        </div>
      </button>

      {/* Fields under Subject */}
      {isExpanded && (
        <div className="px-3 pb-2 space-y-2">
          {fields
            .filter(f => f.subject_id === subject.id)
            .sort((a, b) => a.display_order - b.display_order)
            .map(field => (
              <FieldNode
                key={field.id}
                field={field}
                gradeId={gradeId}
                skills={skills}
                isExpanded={expandedFields.has(field.id)}
                onToggle={() => onToggleField(field.id)}
                onDeleteSkill={onDeleteSkill}
              />
            ))}
        </div>
      )}
    </div>
  );
};
