'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { skillsApi } from '@/lib/skillsApi';
import {
  Teacher,
  TeacherStats,
  Grade,
  Subject,
  Field,
  Skill
} from '@/components/admin/types';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { TeachersTab } from '@/components/admin/TeachersTab';
import { SkillsTab } from '@/components/admin/SkillsTab';
import { apiFetch } from '@/lib/api-client';

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('teachers');
  
  // Teachers state
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [stats, setStats] = useState<Record<string, TeacherStats>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Skills Management state
  // const [grades, setGrades] = useState<Grade[]>([
  //   { id: '1', name: 'الصف الثالث الابتدائي', level: 3, display_order: 1 },
  //   { id: '2', name: 'الصف السادس الابتدائي', level: 6, display_order: 2 },
  //   { id: '3', name: 'الصف التاسع المتوسط', level: 9, display_order: 3 },
  // ]);
  const [grades, setGrades] = useState<Grade[]>([]);


  // const [subjects, setSubjects] = useState<Subject[]>([
  //   { id: '1', name: 'الرياضيات', icon: 'BookOpen', color: '#10b981', display_order: 1, grade_id: '1' },
  //   { id: '2', name: 'العلوم الطبيعية', icon: 'Beaker', color: '#3b82f6', display_order: 2, grade_id: '1' },
  // ]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  // const [fields, setFields] = useState<Field[]>([
  //   { id: '1', subject_id: '1', name: 'الأعداد والعمليات', display_order: 1 },
  //   { id: '2', subject_id: '1', name: 'الجبر والتحليل', display_order: 2 },
  //   { id: '3', subject_id: '1', name: 'الهندسة والقياس', display_order: 3 },
  //   { id: '4', subject_id: '1', name: 'الإحصاء والاحتمالات', display_order: 4 },
  //   { id: '5', subject_id: '2', name: 'علوم الحياة', display_order: 1 },
  //   { id: '6', subject_id: '2', name: 'العلوم الفيزيائية', display_order: 2 },
  //   { id: '7', subject_id: '2', name: 'علوم الأرض والفضاء', display_order: 3 },
  // ]);
  const [fields, setFields] = useState<Field[]>([]);

  const [skills, setSkills] = useState<Skill[]>([]);

  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set());
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);

  const fetchTeachers = async () => {
    const data = await apiFetch("/teachers");

    setTeachers((data as any) || []);
    console.log(data)
    // Fetch stats for each teacher and skills hierarchy
    const hierarchyData = await skillsApi.getHierarchy()

    console.log(hierarchyData)
    // Transform hierarchy data to flat arrays for component compatibility
    // The API returns a grade -> subjects -> fields -> skills payload.
    // We must consume each grade branch once and keep that order stable.
    const gradesData: Grade[] = [];
    const subjectsData: Subject[] = [];
    const fieldsData: Field[] = [];
    const skillsData: Skill[] = [];

    hierarchyData?.forEach(({ grade: gradeNode }) => {
      // Add grade (convert camelCase to snake_case for component compatibility)
      gradesData.push({
        id: gradeNode.id,
        name: gradeNode.name,
        level: 0,
        display_order: gradeNode.displayOrder
      });

      const gradeSubjects = gradeNode.subjects?.subjects ?? [];
      const gradeFields = gradeNode.subjects?.fields?.fields ?? [];
      const gradeSkills = gradeNode.subjects?.fields?.skills ?? [];

      gradeSubjects.forEach(subject => {
        subjectsData.push({
          id: subject.id,
          name: subject.name,
          icon: '',
          color: '',
          display_order: subject.displayOrder,
          grade_id: subject.gradeId
        });
      });

      gradeFields.forEach(field => {
        fieldsData.push({
          id: field.id,
          subject_id: field.subjectId,
          name: field.name,
          display_order: field.displayOrder
        });
      });

      gradeSkills.forEach(skill => {
        skillsData.push({
          id: skill.id,
          field_id: skill.fieldId,
          grade_id: skill.gradeId,
          skill_number: skill.skillNumber,
          title: skill.title,
          difficulty_level: skill.difficultyLevel as 'basic' | 'intermediate' | 'advanced',
          is_active: true,
          display_order: skill.displayOrder
        });
      });
    });

    const statsMap: Record<string, TeacherStats> = {};
    // teachers?.forEach(id => {
    //   statsMap[id] = {
    //     quizzes: (quizzesRes.data || []).filter((q: any) => q.teacher_id === id).length,
    //     videos: (videosRes.data || []).filter((v: any) => v.teacher_id === id).length,
    //     games: (gamesRes.data || []).filter((g: any) => g.teacher_id === id).length,
    //     publicResults: (resultsRes.data || []).filter((r: any) => r.teacher_id === id).length,
    //   };
    // });
    // setStats(statsMap);
    setGrades(gradesData);
    setSubjects(subjectsData);
    setFields(fieldsData);
    setSkills(skillsData);
  };

  useEffect(() => { fetchTeachers(); }, []);

  const addTeacher = async (email: string, name: string, password: string) => {
    try {
      await apiFetch('/teachers', {
        method: 'POST',
        body: { email, password, fullName: name },
      });

      toast.success('تم إضافة المعلم بنجاح');
      fetchTeachers();
    } catch (error: any) {
      console.error('Error creating teacher:', error);
      toast.error(error?.message || 'فشل في إضافة المعلم');
    }
  };

  const removeTeacher = async (teacherId: string) => {
    try {
      await apiFetch('/teachers', {
        method: 'DELETE',
        body: { teacherId },
      });
      toast.success('تم إزالة صلاحيات المعلم');
      fetchTeachers();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'فشل في الإزالة');
    }
  };

  const copyLink = (slug: string, id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/p/${slug}`);
    setCopiedId(id);
    toast.success('تم نسخ الرابط');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSubscription = async (teacherId: string, active: boolean) => {
    try {
      await apiFetch(`/teachers/${teacherId}/toggle-subscription`, {
        method: 'PATCH',
        body: { teacherId, subscriptionActive: active },
      });
      toast.success(active ? 'تم تفعيل الاشتراك' : 'تم إيقاف الاشتراك');
      fetchTeachers();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'فشل في تغيير حالة الاشتراك');
    }
  };

  const getSubscriptionStatus = (t: Teacher) => {
    if (t.subscriptionActive && t.subscriptionEndsAt) {
      const endsAt = new Date(t.subscriptionEndsAt);
      const days = Math.max(0, Math.ceil((endsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      if (days > 30) return { label: `مفعّل (${days} يوم)`, color: 'text-emerald-500' };
      if (days > 0) return { label: `ينتهي خلال ${days} يوم`, color: 'text-amber-500' };
      return { label: 'منتهي', color: 'text-destructive' };
    }
    if (t.subscriptionActive) return { label: 'مفعّل', color: 'text-emerald-500' };
    const trialEnd = t.trialEndsAt ? new Date(t.trialEndsAt) : null;
    if (trialEnd && new Date() < trialEnd) return { label: 'تجريبي', color: 'text-amber-500' };
    return { label: 'متوقف', color: 'text-destructive' };
  };

  // Skills Management functions
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

  const addSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const payload = {
      title: formData.get('title') as string,
      grade_id: formData.get('grade_id') as string,
      field_id: formData.get('field_id') as string,
      subject_id: formData.get('subject_id') as string,
      skill_number: Number(formData.get('skill_number') ?? 1),
      difficulty_level: formData.get('difficulty_level') as 'basic' | 'intermediate' | 'advanced',
      display_order: Number(formData.get('display_order') ?? 1),
      description: (formData.get('description') as string) || undefined,
    };

    try {
      await apiFetch('/skills', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      toast.success('تم إضافة المهارة بنجاح');
      await fetchTeachers();
      setSkillDialogOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'فشل إضافة المهارة');
    }
  };

  const deleteSkill = async (skillId: string) => {
    try {
      await apiFetch(`/skills/${skillId}`, {
        method: "DELETE",
      });

      setSkills(prevSkills => prevSkills.filter(skill => skill.id !== skillId));
      toast.success('تم حذف المهارة بنجاح');
    } catch(error) {
      console.error(error.message);
      toast.error('فشل حذف المهارة');
    }
  };

  const addGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const payload = {
      name: formData.get('name') as string,
      level: Number(formData.get('level') ?? 1),
      display_order: Number(formData.get('display_order') ?? 1),
    };

    try {
      await apiFetch('/grades', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      toast.success('تم إضافة الصف بنجاح');
      await fetchTeachers();
      setGradeDialogOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'فشل إضافة الصف');
    }
  };

  const addSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const payload = {
      name: formData.get('name') as string,
      icon: formData.get('icon') as string,
      color: formData.get('color') as string,
      display_order: Number(formData.get('display_order') ?? 1),
      grade_id: formData.get('grade_id') as string,
    };

    try {
      await apiFetch('/subjects', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      toast.success('تم إضافة المادة بنجاح');
      await fetchTeachers();
      setSubjectDialogOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'فشل إضافة المادة');
    }
  };

  const addField = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const payload = {
      subject_id: formData.get('subject_id') as string,
      name: formData.get('name') as string,
      description: (formData.get('description') as string) || undefined,
      display_order: Number(formData.get('display_order') ?? 1),
    };

    try {
      await apiFetch('/fields', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      toast.success('تم إضافة المجال بنجاح');
      await fetchTeachers();
      setFieldDialogOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'فشل إضافة المجال');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader onSignOut={signOut} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="teachers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>المعلمون</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              <span>مركز المهارات</span>
            </TabsTrigger>
          </TabsList>

          {/* Teachers Tab */}
          <TabsContent value="teachers">
            <TeachersTab
              teachers={teachers}
              stats={stats}
              copiedId={copiedId}
              onAddTeacher={addTeacher}
              onRemoveTeacher={removeTeacher}
              onCopyLink={copyLink}
              onToggleSubscription={toggleSubscription}
              getSubscriptionStatus={getSubscriptionStatus}
            />
          </TabsContent>

          {/* Skills Management Tab */}
          <TabsContent value="skills">
            <SkillsTab
              grades={grades}
              subjects={subjects}
              fields={fields}
              skills={skills}
              expandedGrades={expandedGrades}
              expandedSubjects={expandedSubjects}
              expandedFields={expandedFields}
              skillDialogOpen={skillDialogOpen}
              gradeDialogOpen={gradeDialogOpen}
              subjectDialogOpen={subjectDialogOpen}
              fieldDialogOpen={fieldDialogOpen}
              onToggleGrade={toggleGrade}
              onToggleSubject={toggleSubject}
              onToggleField={toggleField}
              onSkillDialogOpenChange={setSkillDialogOpen}
              onGradeDialogOpenChange={setGradeDialogOpen}
              onSubjectDialogOpenChange={setSubjectDialogOpen}
              onFieldDialogOpenChange={setFieldDialogOpen}
              onAddSkill={addSkill}
              onAddGrade={addGrade}
              onAddSubject={addSubject}
              onAddField={addField}
              onDeleteSkill={deleteSkill}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
