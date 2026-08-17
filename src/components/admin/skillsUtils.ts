import { Skill } from './types';

export const getDifficultyColor = (level: string): string => {
  switch (level) {
    case 'basic':
      return 'bg-emerald-500/10 text-emerald-500';
    case 'intermediate':
      return 'bg-amber-500/10 text-amber-500';
    case 'advanced':
      return 'bg-rose-500/10 text-rose-500';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const getDifficultyLabel = (level: string): string => {
  switch (level) {
    case 'basic':
      return 'أساسي';
    case 'intermediate':
      return 'متوسط';
    case 'advanced':
      return 'متقدم';
    default:
      return '';
  }
};

export const getFieldSkills = (skills: Skill[], fieldId: string, gradeId: string): Skill[] => {
  return skills.filter(s => s.field_id === fieldId && s.grade_id === gradeId);
};
