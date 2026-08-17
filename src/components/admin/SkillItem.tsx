import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Skill } from './types';
import { getDifficultyColor, getDifficultyLabel } from './skillsUtils';

interface SkillItemProps {
  skill: Skill;
  onDelete: (skillId: string) => void;
}

export const SkillItem = ({ skill, onDelete }: SkillItemProps) => {

  return (
    <div className="mr-4 p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-primary">
              #{skill.skill_number}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(skill.difficulty_level)}`}>
              {getDifficultyLabel(skill.difficulty_level)}
            </span>
          </div>
          <p className="text-sm leading-relaxed">{skill.title}</p>
          {skill.description && (
            <p className="text-xs text-muted-foreground mt-1">
              {skill.description}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(skill.id)}
          className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
