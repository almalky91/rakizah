'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Plus, ChevronDown, ChevronLeft, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { skillsApi } from '@/lib/skillsApi';
import { teacherApi, type TeacherSkillResponse } from '@/lib/api/teacherApi';
import type { GradeWithFields } from '@/lib/skillsApi';
import type { Grade, Field, Subject, Skill } from '@/db';

// Extended interfaces for components that need additional UI properties
interface UIGrade {
  id: string;
  name: string;
  displayOrder: number;
}

interface UISubject {
  id: string;
  gradeId: string;
  name: string;
  displayOrder: number;
}

interface UIField {
  id: string;
  subjectId: string;
  name: string;
  displayOrder: number;
}

interface UISkill {
  id: string;
  fieldId: string;
  gradeId: string;
  skillNumber: number;
  title: string;
  difficultyLevel: 'basic' | 'intermediate' | 'advanced';
  displayOrder: number;
}

interface TeacherSkill {
  id: string;
  skillNumber: number;
  title: string;
  description?: string;
  difficultyLevel: 'basic' | 'intermediate' | 'advanced';
  displayOrder: number;
  createdAt: Date | string;
  field: {
    id: string;
    name: string;
    displayOrder: number;
  };
  grade: {
    id: string;
    name: string;
    displayOrder: number;
  };
  teacherSkillId: string;
  teacherSkillCreatedAt: Date | string;
}

const SkillsCenter = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [teacherSkills, setTeacherSkills] = useState<TeacherSkill[]>([]);
  
  // Hierarchy data using camelCase (from Drizzle types)
  const [grades, setGrades] = useState<UIGrade[]>([]);
  const [subjects, setSubjects] = useState<UISubject[]>([]);
  const [fields, setFields] = useState<UIField[]>([]);
  const [skills, setSkills] = useState<UISkill[]>([]);
  
  // Expansion state
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set());
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  
  // Selected skills for assignment
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());

  const fetchTeacherSkills = async () => {
    if (!user) return;
    
    try {
      const data = await teacherApi.getSkills(user.id);
      setTeacherSkills(data);
    } catch (error) {
      console.error('Error fetching teacher skills:', error);
      toast.error('فشل في تحميل المهارات');
    }
  };

  const fetchHierarchy = async () => {
    try {
      const hierarchyData = await skillsApi.getHierarchy();
      // Transform hierarchy data to flat arrays with camelCase
      const gradesData: UIGrade[] = [];
      const subjectsData: UISubject[] = [];
      const fieldsData: UIField[] = [];
      const skillsData: UISkill[] = [];
      // Iterate through the hierarchy and populate the flat arrays.
      // API contract shape: grades > subjects > fields > skills.
      hierarchyData.forEach(gradeNode => {
        const grade = gradeNode.grade;

        // Add grade (already camelCase from API)
        gradesData.push({
          id: grade.id,
          name: grade.name,
          displayOrder: grade.displayOrder
        });

        const gradeSubjects = grade.subjects?.subjects ?? [];
        const gradeFields = grade.subjects?.fields?.fields ?? [];
        const gradeSkills = grade.subjects?.fields?.skills ?? [];

        // Subjects are the first nested child of the grade tree.
        gradeSubjects.forEach(subject => {
          subjectsData.push({
            id: subject.id,
            gradeId: subject.gradeId,
            name: subject.name,
            displayOrder: subject.displayOrder,
            fieldId: subject.fieldId
          });
        });

        // Fields belong underneath the grade's subject branch.
        gradeFields.forEach(field => {
          fieldsData.push({
            id: field.id,
            gradeId: field.gradeId,
            subjectId: field.subjectId,
            name: field.name,
            displayOrder: field.displayOrder
          });
        });

        // Skills belong underneath the field branch.
        gradeSkills.forEach(skill => {
          skillsData.push({
            id: skill.id,
            fieldId: skill.fieldId,
            gradeId: skill.gradeId,
            skillNumber: skill.skillNumber,
            title: skill.title,
            difficultyLevel: skill.difficultyLevel as 'basic' | 'intermediate' | 'advanced',
            displayOrder: skill.displayOrder
          });
        });
      });

      setGrades(gradesData);
      setSubjects(subjectsData);
      setFields(fieldsData);
      setSkills(skillsData);
      console.log(teacherSkills)
    } catch (error) {
      console.error('Error fetching hierarchy:', error);
      toast.error('فشل في تحميل البيانات');
    }
  };

  useEffect(() => {
    if (user) {
      fetchTeacherSkills();
      fetchHierarchy();
    }
  }, [user]);

  const toggleGrade = (gradeId: string) => {
    setExpandedGrades(prev => {
      const next = new Set(prev);
      if (next.has(gradeId)) next.delete(gradeId);
      else next.add(gradeId);
      return next;
    });
  };

  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects(prev => {
      const next = new Set(prev);
      if (next.has(subjectId)) next.delete(subjectId);
      else next.add(subjectId);
      return next;
    });
  };

  const toggleField = (fieldId: string) => {
    setExpandedFields(prev => {
      const next = new Set(prev);
      if (next.has(fieldId)) next.delete(fieldId);
      else next.add(fieldId);
      return next;
    });
  };

  const toggleSkillSelection = (skillId: string) => {
    setSelectedSkills(prev => {
      const next = new Set(prev);
      if (next.has(skillId)) next.delete(skillId);
      else next.add(skillId);
      return next;
    });
  };

  const assignSelectedSkills = async () => {
    if (selectedSkills.size === 0) {
      toast.error('الرجاء اختيار مهارة واحدة على الأقل');
      return;
    }

    if (!user) return;

    try {
      await teacherApi.addSkills(user.id, Array.from(selectedSkills));
      toast.success(`تم إضافة ${selectedSkills.size} مهارة`);
      setSelectedSkills(new Set());
      setOpen(false);
      fetchTeacherSkills();
    } catch (error) {
      console.error('Error adding skills:', error);
      toast.error('فشل في إضافة المهارات');
    }
  };

  const removeSkill = async (skillId: string) => {
    if (!user) return;

    try {
      await teacherApi.removeSkills(user.id, [skillId]);
      toast.success('تم حذف المهارة');
      fetchTeacherSkills();
    } catch (error) {
      console.error('Error removing skill:', error);
      toast.error('فشل في حذف المهارة');
    }
  };

  const getDifficultyBadge = (level: string) => {
    const badges = {
      basic: { label: 'أساسي', color: 'bg-emerald-100 text-emerald-700' },
      intermediate: { label: 'متوسط', color: 'bg-amber-100 text-amber-700' },
      advanced: { label: 'متقدم', color: 'bg-rose-100 text-rose-700' }
    };
    const badge = badges[level as keyof typeof badges] || badges.basic;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getSubjectsForGrade = (gradeId: string) =>
    subjects.filter(subject => subject.gradeId === gradeId);

  const getFieldsForSubject = (subjectId: string) =>
    fields.filter(field => field.subjectId === subjectId);

  const getSkillsForField = (fieldId: string) =>
    skills.filter(skill => skill.fieldId === fieldId);

  const getSkillCount = (gradeId?: string, subjectId?: string, fieldId?: string) => {
    if (fieldId) {
      return skills.filter(skill => skill.fieldId === fieldId).length;
    }

    if (subjectId) {
      const subjectFields = fields.filter(field => field.subjectId === subjectId);
      const subjectFieldIds = new Set(subjectFields.map(field => field.id));

      return skills.filter(skill => subjectFieldIds.has(skill.fieldId)).length;
    }

    if (gradeId) {
      const gradeSubjects = subjects.filter(subject => subject.gradeId === gradeId);
      const gradeSubjectIds = new Set(gradeSubjects.map(subject => subject.id));
      const gradeFields = fields.filter(field => gradeSubjectIds.has(field.subjectId));
      const gradeFieldIds = new Set(gradeFields.map(field => field.id));

      return skills.filter(skill => gradeFieldIds.has(skill.fieldId)).length;
    }

    return 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary" />
          مركز المهارات
        </h2>
        <Button variant="hero" size="sm" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 ml-1" />
          إضافة مهارات
        </Button>
      </div>

      {teacherSkills.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>لا توجد مهارات مضافة بعد</p>
            <p className="text-sm mt-2">ابدأ بإضافة مهارات من المنهج الدراسي</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {teacherSkills.map(ts => (
            <Card key={ts.teacherSkillId}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm text-muted-foreground">
                        #{ts.skillNumber}
                      </span>
                      {getDifficultyBadge(ts.difficultyLevel)}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{ts.title}</h3>
                    {ts.description && (
                      <p className="text-sm text-muted-foreground">{ts.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSkill(ts.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Skills Selection Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>اختيار المهارات</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-2 p-1">
              {grades.map((grade, gradeIndex) => {
                const gradeSubjects = getSubjectsForGrade(grade.id);
                const skillCount = getSkillCount(grade.id);
                const isGradeEven = gradeIndex % 2 === 0;
                
                return (
                  <div key={grade.id} className="border rounded-lg">
                    <button
                      onClick={() => toggleGrade(grade.id)}
                      className={`w-full flex items-center justify-between p-4 transition-colors ${
                        isGradeEven 
                          ? 'bg-background hover:bg-accent/50' 
                          : 'bg-primary/15 hover:bg-primary/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {expandedGrades.has(grade.id) ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                        )}
                        <div className="text-right">
                          <h3 className="font-semibold">{grade.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {gradeSubjects.length} مواد • {skillCount} مهارة
                          </p>
                        </div>
                      </div>
                    </button>

                    {expandedGrades.has(grade.id) && (
                      <div className="px-4 pb-4 space-y-2">
                        {gradeSubjects.map((subject, subjectIndex) => {
                          const subjectFields = getFieldsForSubject(subject.id);
                          const subjectSkillCount = getSkillCount(undefined, subject.id);
                          const isSubjectEven = subjectIndex % 2 === 0;
                          
                          return (
                            <div key={subject.id} className="border rounded-lg mr-8">
                              <button
                                onClick={() => toggleSubject(subject.id)}
                                className={`w-full flex items-center justify-between p-3 transition-colors ${
                                  isSubjectEven 
                                    ? 'bg-background hover:bg-accent/50' 
                                    : 'bg-primary/15 hover:bg-primary/10'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {expandedSubjects.has(subject.id) ? (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                                  )}
                                  <div className="text-right">
                                    <h4 className="font-medium">{subject.name}</h4>
                                    <p className="text-xs text-muted-foreground">
                                      {subjectFields.length} مجالات • {subjectSkillCount} مهارة
                                    </p>
                                  </div>
                                </div>
                              </button>

                              {expandedSubjects.has(subject.id) && (
                                <div className="px-3 pb-3 space-y-2">
                                  {subjectFields.map((field, fieldIndex) => {
                                    const fieldSkills = getSkillsForField(field.id);
                                    const isFieldEven = fieldIndex % 2 === 0;
                                    
                                    return (
                                      <div key={field.id} className="border rounded-lg mr-8">
                                        <button
                                          onClick={() => toggleField(field.id)}
                                          className={`w-full flex items-center justify-between p-3 transition-colors ${
                                            isFieldEven 
                                              ? 'bg-background hover:bg-accent/50' 
                                              : 'bg-primary/15 hover:bg-primary/10'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            {expandedFields.has(field.id) ? (
                                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                            ) : (
                                              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                                            )}
                                            <div className="text-right">
                                              <h5 className="font-medium text-sm">{field.name}</h5>
                                              <p className="text-xs text-muted-foreground">
                                                {fieldSkills.length} مهارة
                                              </p>
                                            </div>
                                          </div>
                                        </button>

                                        {expandedFields.has(field.id) && (
                                          <div className="px-3 pb-3 space-y-2">
                                            {fieldSkills.map((skill, skillIndex) => {
                                              const isSelected = selectedSkills.has(skill.id);
                                              const isAlreadyAdded = teacherSkills.some(
                                                ts => ts.id === skill.id
                                              );
                                              const isSkillEven = skillIndex % 2 === 0;
                                              
                                              return (
                                                <button
                                                  key={skill.id}
                                                  onClick={() => !isAlreadyAdded && toggleSkillSelection(skill.id)}
                                                  disabled={isAlreadyAdded}
                                                  className={`w-full text-right p-3 rounded-lg border-2 transition-all mr-8 ${
                                                    isAlreadyAdded
                                                      ? 'bg-muted/50 border-muted cursor-not-allowed opacity-60'
                                                      : isSelected
                                                      ? 'bg-primary/10 border-primary'
                                                      : isSkillEven
                                                      ? 'bg-background border-border hover:border-primary/50'
                                                      : 'bg-primary/15 border-border hover:border-primary/50'
                                                  }`}
                                                >
                                                  <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                      <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-semibold text-muted-foreground">
                                                          #{skill.skillNumber}
                                                        </span>
                                                        {getDifficultyBadge(skill.difficultyLevel)}
                                                        {isAlreadyAdded && (
                                                          <span className="text-xs text-muted-foreground">
                                                            (مضافة مسبقاً)
                                                          </span>
                                                        )}
                                                      </div>
                                                      <p className="text-sm font-medium">{skill.title}</p>
                                                      {skill.description && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                          {skill.description}
                                                        </p>
                                                      )}
                                                    </div>
                                                    {isSelected && !isAlreadyAdded && (
                                                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                                        <svg
                                                          className="w-3 h-3 text-primary-foreground"
                                                          fill="none"
                                                          strokeLinecap="round"
                                                          strokeLinejoin="round"
                                                          strokeWidth="2"
                                                          viewBox="0 0 24 24"
                                                          stroke="currentColor"
                                                        >
                                                          <path d="M5 13l4 4L19 7" />
                                                        </svg>
                                                      </div>
                                                    )}
                                                  </div>
                                                </button>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t pt-4 mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedSkills.size} مهارة محددة
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedSkills(new Set());
                  setOpen(false);
                }}
              >
                إلغاء
              </Button>
              <Button
                variant="hero"
                onClick={assignSelectedSkills}
                disabled={selectedSkills.size === 0}
              >
                إضافة المهارات المحددة
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SkillsCenter;
