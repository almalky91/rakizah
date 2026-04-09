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
  phone_number: string | null;
}

const TeacherPublicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [profile, setProfile] = useState<TeacherProfile>({ full_name: null, school_name: null, page_title: null, bio: null, page_template: 'classic', phone_number: null });
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
      const profileRes = await supabase.from('profiles').select('id, full_name, school_name, page_title, bio, page_template, phone_number').eq('public_slug', slug as any).single();
      if (!profileRes.data) { setLoading(false); return; }
      const tid = (profileRes.data as any).id;
      setTeacherId(tid);
      const [quizzesRes, gamesRes, videosRes] = await Promise.all([
        supabase.from('quizzes').select('*').eq('teacher_id', tid).order('created_at', { ascending: false }),
        supabase.from('games').select('*').eq('teacher_id', tid).order('created_at', { ascending: false }),
        supabase.from('videos').select('*').eq('teacher_id', tid).order('created_at', { ascending: false }),
      ]);
      setProfile({
        full_name: (profileRes.data as any)?.full_name || 'معلم',
        school_name: (profileRes.data as any)?.school_name || null,
        page_title: (profileRes.data as any)?.page_title || null,
        bio: (profileRes.data as any)?.bio || null,
        page_template: (profileRes.data as any)?.page_template || 'classic',
        phone_number: (profileRes.data as any)?.phone_number || null,
      });
      setQuizzes((quizzesRes.data as any) || []);
      setGames((gamesRes.data as any) || []);
      setVideos((videosRes.data as any) || []);
      setLoading(false);
    };
    fetchData();
  }, [slug]);

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
    return <PublicNameGate teacherName={profile.full_name || 'معلم'} pageTitle={profile.page_title} studentName={studentName} setStudentName={setStudentName} onConfirm={() => { if (studentName.trim()) setNameConfirmed(true); else toast.error('يرجى إدخال اسمك'); }} />;
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

      {profile.phone_number && (
        <a
          href={`https://wa.me/${profile.phone_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحباً أستاذ ${profile.full_name || ''} 👋`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#1ebe57] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          aria-label="تواصل عبر واتساب"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </a>
      )}

      <footer className="text-center py-6 text-muted-foreground text-xs border-t border-border/50">
        <p>منصة تعليمية تفاعلية ✨</p>
      </footer>
    </div>
  );
};

export default TeacherPublicPage;
