import { ChevronRight, ChevronDown } from 'lucide-react';
import { Field, Skill } from './types';
import { getFieldSkills } from './skillsUtils';
import { SkillItem } from './SkillItem';

interface FieldNodeProps {
  field: Field;
  gradeId: string;
  skills: Skill[];
  isExpanded: boolean;
  onToggle: () => void;
  onDeleteSkill: (skillId: string) => void;
}

export const FieldNode = ({
  field,
  gradeId,
  skills,
  isExpanded,
  onToggle,
  onDeleteSkill
}: FieldNodeProps) => {
  const fieldSkills = getFieldSkills(skills, field.id, gradeId);

  return (
    <div className="mr-6 border rounded-lg bg-background">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          <div className="text-right">
            <p className="font-medium text-sm">{field.name}</p>
            <p className="text-xs text-muted-foreground">
              {fieldSkills.length} مهارة
            </p>
          </div>
        </div>
      </button>

      {/* Skills under Field */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          {fieldSkills.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              لا توجد مهارات في هذا المجال
            </p>
          ) : (
            fieldSkills
              .sort((a, b) => a.display_order - b.display_order)
              .map(skill => (
                <SkillItem
                  key={skill.id}
                  skill={skill}
                  onDelete={onDeleteSkill}
                />
              ))
          )}
        </div>
      )}
    </div>
  );
};
