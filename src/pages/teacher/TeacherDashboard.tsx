import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, BookOpen, Gamepad2, BarChart3, LogOut, Star } from 'lucide-react';
import VideoCenter from '@/components/teacher/VideoCenter';
import QuizCenter from '@/components/teacher/QuizCenter';
import GameCenter from '@/components/teacher/GameCenter';
import PerformanceBoard from '@/components/teacher/PerformanceBoard';

const TeacherDashboard = () => {
  const { signOut, user } = useAuth();

  return (
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
          <Button variant="ghost" onClick={signOut} className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="videos" dir="rtl">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mb-8 h-auto">
            <TabsTrigger value="videos" className="flex items-center gap-2 py-3">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">الفيديو</span>
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2 py-3">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">الاختبارات</span>
            </TabsTrigger>
            <TabsTrigger value="games" className="flex items-center gap-2 py-3">
              <Gamepad2 className="w-4 h-4" />
              <span className="hidden sm:inline">الألعاب</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2 py-3">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">الأداء</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos"><VideoCenter /></TabsContent>
          <TabsContent value="quizzes"><QuizCenter /></TabsContent>
          <TabsContent value="games"><GameCenter /></TabsContent>
          <TabsContent value="performance"><PerformanceBoard /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TeacherDashboard;
