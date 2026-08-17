'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, BookOpen, Brain, BarChart3, LogOut, Star, Link2, Check, Settings } from 'lucide-react';
import VideoCenter from '@/components/teacher/VideoCenter';
import QuizCenter from '@/components/teacher/QuizCenter';
import SkillsCenter from '@/components/teacher/SkillsCenter';
import PerformanceBoard from '@/components/teacher/PerformanceBoard';
import PageSettings from '@/components/teacher/PageSettings';
import SubscriptionGate from '@/components/teacher/SubscriptionGate';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api-client';

const TeacherDashboard = () => {
  const { signOut, user } = useAuth();
  const [teacher, setTeacher] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [publicSlug, setPublicSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setTeacher(null);
      return;
    }

    fetchTeacher(user.id);
  }, [user]);

  const publicLink = publicSlug ? `${window.location.origin}/p/${publicSlug}` : '';

  const copyLink = () => {
    if (!publicLink) {
      toast.error('احفظ إعدادات الصفحة أولاً لتفعيل الرابط');
      return;
    }

    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    toast.success('تم نسخ الرابط');
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchTeacher = async (teacherId: string) => {
    try {
      const teacher = await apiFetch(`/teachers/${teacherId}`);

      setPublicSlug(teacher.publicSlug || null);
      setTeacher(teacher);

    } catch(error) {
      console.error(error);
      toast.error("خطأ اثناء جلب بيانات المعلم");
    }
  }

  return (
    <SubscriptionGate teacher={teacher}>
    <div className="min-h-screen bg-background">
      <header className="gradient-primary border-b border-border/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Star className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">لوحة تحكم المعلم</h1>
              <p className="text-sm text-primary-foreground/60">{user?.user_metadata?.full_name || 'معلم'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={copyLink} disabled={!publicLink} className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 gap-1 disabled:opacity-50 disabled:hover:bg-transparent">
              {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'تم النسخ' : 'رابط الصفحة'}</span>
            </Button>
            <Button variant="ghost" onClick={signOut} className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
              <LogOut className="w-4 h-4 ml-2" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="videos" dir="rtl">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl mb-8 h-auto">
            <TabsTrigger value="videos" className="flex items-center gap-2 py-3">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">الفيديو</span>
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2 py-3">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">الاختبارات</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2 py-3">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">مركز المهارات</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2 py-3">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">الأداء</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 py-3">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">الإعدادات</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos"><VideoCenter /></TabsContent>
          <TabsContent value="quizzes"><QuizCenter /></TabsContent>
          <TabsContent value="skills"><SkillsCenter /></TabsContent>
          <TabsContent value="performance"><PerformanceBoard /></TabsContent>
          <TabsContent value="settings"><PageSettings onPublicSlugChange={setPublicSlug} /></TabsContent>
        </Tabs>
      </main>
    </div>
    </SubscriptionGate>
  );
};

export default TeacherDashboard;
