'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Video, BookOpen, Gamepad2, Trophy, Star, Medal, Brain } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StudentVideos from '@/components/student/StudentVideos';
import StudentQuizzes from '@/components/student/StudentQuizzes';
import StudentGames from '@/components/student/StudentGames';
import Leaderboard from '@/components/student/Leaderboard';
import StudentSkills from '@/components/student/StudentSkills';

const StudentPortal = () => {
  const { signOut, user } = useAuth();
  console.log(user);
  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary border-b border-border/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Star className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">بوابة الطالب</h1>
              <p className="text-sm text-primary-foreground/60">{user?.user_metadata?.full_name || 'طالب'}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={signOut} className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
            <LogOut className="w-4 h-4 ml-2" />
            خروج
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Leaderboard Banner */}
        <Leaderboard />

        <Tabs defaultValue="videos" dir="rtl" className="mt-8">
          <TabsList className="grid grid-cols-3 w-full max-w-lg mb-8 h-auto">
            <TabsTrigger value="videos" className="flex items-center gap-2 py-3">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">فيديوهات</span>
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2 py-3">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">اختبارات</span>
            </TabsTrigger>
            {/* <TabsTrigger value="games" className="flex items-center gap-2 py-3">
              <Gamepad2 className="w-4 h-4" />
              <span className="hidden sm:inline">ألعاب</span>
            </TabsTrigger> */}
            <TabsTrigger value="skills" className="flex items-center gap-2 py-3">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">مركز التعلم</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos"><StudentVideos /></TabsContent>
          <TabsContent value="quizzes"><StudentQuizzes /></TabsContent>
          {/* <TabsContent value="games"><StudentGames /></TabsContent> */}
          <TabsContent value="skills"><StudentSkills /></TabsContent>          
        </Tabs>
      </main>
    </div>
  );
};

export default StudentPortal;
