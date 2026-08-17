'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';
import { Grade, Subject, Field, Skill } from './types';
import { AddSkillDialog } from './AddSkillDialog';
import { AddGradeDialog } from './AddGradeDialog';
import { AddSubjectDialog } from './AddSubjectDialog';
import { AddFieldDialog } from './AddFieldDialog';
import { SkillsTree } from './SkillsTree';

interface SkillsTabProps {
  grades: Grade[];
  subjects: Subject[];
  fields: Field[];
  skills: Skill[];
  expandedGrades: Set<string>;
  expandedSubjects: Set<string>;
  expandedFields: Set<string>;
  skillDialogOpen: boolean;
  gradeDialogOpen: boolean;
  subjectDialogOpen: boolean;
  fieldDialogOpen: boolean;
  onToggleGrade: (gradeId: string) => void;
  onToggleSubject: (subjectId: string) => void;
  onToggleField: (fieldId: string) => void;
  onSkillDialogOpenChange: (open: boolean) => void;
  onGradeDialogOpenChange: (open: boolean) => void;
  onSubjectDialogOpenChange: (open: boolean) => void;
  onFieldDialogOpenChange: (open: boolean) => void;
  onAddSkill: (e: React.FormEvent) => void;
  onAddGrade: (e: React.FormEvent) => void;
  onAddSubject: (e: React.FormEvent) => void;
  onAddField: (e: React.FormEvent) => void;
  onDeleteSkill: (skillId: string) => void;
}

export const SkillsTab = ({
  grades,
  subjects,
  fields,
  skills,
  expandedGrades,
  expandedSubjects,
  expandedFields,
  skillDialogOpen,
  gradeDialogOpen,
  subjectDialogOpen,
  fieldDialogOpen,
  onToggleGrade,
  onToggleSubject,
  onToggleField,
  onSkillDialogOpenChange,
  onGradeDialogOpenChange,
  onSubjectDialogOpenChange,
  onFieldDialogOpenChange,
  onAddSkill,
  onAddGrade,
  onAddSubject,
  onAddField,
  onDeleteSkill,
}: SkillsTabProps) => {
  console.log("Skills", subjects)
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="w-5 h-5" />
            مركز المهارات
          </CardTitle>
          <div className="flex items-center gap-2">
            <AddGradeDialog
              open={gradeDialogOpen}
              onOpenChange={onGradeDialogOpenChange}
              onAddGrade={onAddGrade}
            />
            <AddSubjectDialog
              open={subjectDialogOpen}
              onOpenChange={onSubjectDialogOpenChange}
              onAddSubject={onAddSubject}
              grades={grades}
            />
            <AddFieldDialog
              open={fieldDialogOpen}
              onOpenChange={onFieldDialogOpenChange}
              onAddField={onAddField}
              subjects={subjects}
            />
            <AddSkillDialog
              open={skillDialogOpen}
              onOpenChange={onSkillDialogOpenChange}
              grades={grades}
              subjects={subjects}
              fields={fields}
              onAddSkill={onAddSkill}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4 p-3 rounded-lg bg-muted/50">
              <p className="font-medium mb-1">التنظيم الهرمي للمهارات:</p>
              <p className="text-xs">الصف الدراسي → المادة → المجال → المهارات</p>
            </div>

            {grades.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>لا توجد صفوف دراسية بعد</p>
              </div>
            ) : (
              <SkillsTree
                grades={grades}
                subjects={subjects}
                fields={fields}
                skills={skills}
                expandedGrades={expandedGrades}
                expandedSubjects={expandedSubjects}
                expandedFields={expandedFields}
                onToggleGrade={onToggleGrade}
                onToggleSubject={onToggleSubject}
                onToggleField={onToggleField}
                onDeleteSkill={onDeleteSkill}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
