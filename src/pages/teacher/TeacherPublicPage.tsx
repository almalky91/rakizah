import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Gamepad2, Video } from 'lucide-react';
import { toast } from 'sonner';
import PublicBanner from '@/components/public/PublicBanner';
import PublicNameGate from '@/components/public/PublicNameGate';
import PublicQuizView from '@/components/public/PublicQuizView';
import PublicWheelView from '@/components/public/PublicWheelView';
import PublicMemoryView from '@/components/public/PublicMemoryView';
import PublicQuizList from '@/components/public/PublicQuizList';
import PublicGameList from '@/components/public/PublicGameList';
import PublicVideoList from '@/components/public/PublicVideoList';
import PublicLeaderboard from '@/components/public/PublicLeaderboard';

interface Question {
  question: string;
  options: string[];
  correct: number;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

export interface Game {
  id: string;
  title: string;
  game_type: 'wheel' | 'memory';
  config: any;
}

export interface VideoItem {
  id: string;
  title: string;
  youtube_url: string;
  views: number;
}

interface TeacherProfile {
  full_name: string | null;
  school_name: string | null;
  page_title: string | null;
  bio: string | null;
  page_template: string;
}

const TeacherPublicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [profile, setProfile] = useState<TeacherProfile>({ full_name: null, school_name: null, page_title: null, bio: null, page_template: 'classic' });
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [studentName, setStudentName] = useState('');
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [leaderboardKey, setLeaderboardKey] = useState(0);

  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeWheel, setActiveWheel] = useState<Game | null>(null);
  const [activeMemory, setActiveMemory] = useState<Game | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      // Resolve slug to teacher ID
      const profileRes = await supabase.from('profiles').select('id, full_name, school_name, page_title, bio, page_template').eq('public_slug', slug as any).single();
      if (!profileRes.data) { setLoading(false); return; }
      const tid = (profileRes.data as any).id;
      setTeacherId(tid);
      const [quizzesRes, gamesRes, videosRes] = await Promise.all([
        supabase.from('quizzes').select('*').eq('teacher_id', teacherId).order('created_at', { ascending: false }),
        supabase.from('games').select('*').eq('teacher_id', teacherId).order('created_at', { ascending: false }),
        supabase.from('videos').select('*').eq('teacher_id', teacherId).order('created_at', { ascending: false }),
      ]);
      setProfile({
        full_name: profileRes.data?.full_name || 'معلم',
        school_name: (profileRes.data as any)?.school_name || null,
        page_title: (profileRes.data as any)?.page_title || null,
        bio: (profileRes.data as any)?.bio || null,
        page_template: (profileRes.data as any)?.page_template || 'classic',
      });
      setQuizzes((quizzesRes.data as any) || []);
      setGames((gamesRes.data as any) || []);
      setVideos((videosRes.data as any) || []);
      setLoading(false);
    };
    fetchData();
  }, [teacherId]);

  const saveQuizResult = async (quizId: string, score: number, totalQuestions: number, answers: Record<number, number>) => {
    if (!teacherId) return;
    const { error } = await supabase.from('public_quiz_results' as any).insert({
      quiz_id: quizId,
      teacher_id: teacherId,
      student_name: studentName,
      score,
      total_questions: totalQuestions,
      answers,
    });
    if (error) {
      console.error('Error saving quiz result:', error);
    } else {
      toast.success('تم حفظ نتيجتك بنجاح');
      setLeaderboardKey(k => k + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground animate-pulse">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  if (!nameConfirmed) {
    return <PublicNameGate teacherName={profile.full_name || 'معلم'} studentName={studentName} setStudentName={setStudentName} onConfirm={() => { if (studentName.trim()) setNameConfirmed(true); else toast.error('يرجى إدخال اسمك'); }} />;
  }

  if (activeQuiz) {
    return <PublicQuizView quiz={activeQuiz} studentName={studentName} teacherId={teacherId!} onBack={() => setActiveQuiz(null)} onSaveResult={saveQuizResult} />;
  }

  if (activeWheel) {
    return <PublicWheelView game={activeWheel} onBack={() => setActiveWheel(null)} />;
  }

  if (activeMemory) {
    return <PublicMemoryView game={activeMemory} studentName={studentName} onBack={() => setActiveMemory(null)} />;
  }

  const totalContent = quizzes.length + games.length + videos.length;

  return (
    <div className="min-h-screen bg-background">
      <PublicBanner profile={profile} studentName={studentName} totalContent={totalContent} />

      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-8 -mt-8 relative z-10">
        <Tabs defaultValue="quizzes" dir="rtl">
          <TabsList className="grid grid-cols-3 w-full max-w-lg mx-auto mb-6 sm:mb-8 h-auto bg-card shadow-lg border border-border/50 rounded-2xl p-1">
            <TabsTrigger value="quizzes" className="flex items-center gap-1 sm:gap-2 py-2.5 sm:py-3 rounded-xl data-[state=active]:shadow-md text-xs sm:text-sm">
              <BookOpen className="w-4 h-4" />
              <span>الاختبارات</span>
              {quizzes.length > 0 && <span className="text-[10px] sm:text-xs bg-primary/10 text-primary px-1 sm:px-1.5 py-0.5 rounded-full">{quizzes.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="games" className="flex items-center gap-1 sm:gap-2 py-2.5 sm:py-3 rounded-xl data-[state=active]:shadow-md text-xs sm:text-sm">
              <Gamepad2 className="w-4 h-4" />
              <span>الألعاب</span>
              {games.length > 0 && <span className="text-[10px] sm:text-xs bg-primary/10 text-primary px-1 sm:px-1.5 py-0.5 rounded-full">{games.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-1 sm:gap-2 py-2.5 sm:py-3 rounded-xl data-[state=active]:shadow-md text-xs sm:text-sm">
              <Video className="w-4 h-4" />
              <span>الفيديوهات</span>
              {videos.length > 0 && <span className="text-[10px] sm:text-xs bg-primary/10 text-primary px-1 sm:px-1.5 py-0.5 rounded-full">{videos.length}</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quizzes">
            <PublicQuizList quizzes={quizzes} onStartQuiz={setActiveQuiz} />
          </TabsContent>
          <TabsContent value="games">
            <PublicGameList games={games} onStartWheel={setActiveWheel} onStartMemory={setActiveMemory} />
          </TabsContent>
          <TabsContent value="videos">
            <PublicVideoList videos={videos} studentName={studentName} teacherId={teacherId} onVideoWatched={() => setLeaderboardKey(k => k + 1)} />
          </TabsContent>
        </Tabs>
      </main>

      <PublicLeaderboard key={leaderboardKey} teacherId={teacherId!} />

      <footer className="text-center py-6 text-muted-foreground text-xs border-t border-border/50">
        <p>منصة تعليمية تفاعلية ✨</p>
      </footer>
    </div>
  );
};

export default TeacherPublicPage;
