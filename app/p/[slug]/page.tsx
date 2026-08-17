'use client';

import { useState, useEffect } from 'react';
import { teacherApi, type TeacherSkillResponse } from '@/lib/api/teacherApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Brain, Gamepad2, Video } from 'lucide-react';
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
import PublicSkillList from '@/components/public/PublicSkillList';
import type { Quiz, Game, Video } from '@/db/schema/content';
import type { Profile } from '@/db/schema/auth';

// Legacy Skill interface for backward compatibility with PublicSkillList component
// This component still expects the old nested structure from Supabase
export interface Skill {
  skills: {
    id: string;
    field_id: string;
    grade_id: string;
    skill_number: string;
    title: string;
    description: string;
    difficulty_level: string;
    is_active: boolean;
    display_order: number;
    created_at: string;
    fields: {
      subjects: {
        id: string;
        name: string;
        color?: string;
      }
    }
  };
}

/**
 * Transform API response to match the expected Skill interface for PublicSkillList
 */
function transformApiSkillToSkill(apiSkill: TeacherSkillResponse): Skill {
  return {
    skills: {
      id: apiSkill.id,
      field_id: apiSkill.field.id,
      grade_id: apiSkill.grade.id,
      skill_number: String(apiSkill.skillNumber),
      title: apiSkill.title,
      description: '', // Not available in API response
      difficulty_level: apiSkill.difficultyLevel,
      is_active: true, // Assume active since it's returned
      display_order: apiSkill.displayOrder,
      created_at: typeof apiSkill.createdAt === 'string' 
        ? apiSkill.createdAt 
        : apiSkill.createdAt,
      fields: {
        subjects: {
          id: apiSkill.subject?.id || '',
          name: apiSkill.subject?.name || 'غير محدد',
        }
      }
    }
  };
}

// Teacher profile interface - subset of Profile from @/db/schema/auth
interface TeacherProfile {
  full_name: string | null;
  school_name: string | null;
  page_title: string | null;
  bio: string | null;
  page_template: string;
  phone_number: string | null;
}

export default function TeacherPublicPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [profile, setProfile] = useState<TeacherProfile>({ full_name: null, school_name: null, page_title: null, bio: null, page_template: 'classic', phone_number: null });
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
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
      try {
        // Fetch teacher profile by slug using API route
        const profileResponse = await fetch(`/api/profiles/by-slug/${slug}`);
        if (!profileResponse.ok) {
          setLoading(false);
          return;
        }
        
        const profileData = await profileResponse.json();
        if (!profileData.data) {
          setLoading(false);
          return;
        }
        
        const teacherProfile = profileData.data.profile;
        const tid = teacherProfile.id;
        setTeacherId(tid);
        
        // Fetch quizzes and videos in parallel using API routes
        const [quizzesResponse, videosResponse] = await Promise.all([
          fetch(`/api/quizzes?teacherId=${tid}`),
          fetch(`/api/videos?teacherId=${tid}`)
        ]);
        
        const quizzesData = await quizzesResponse.json();
        const videosData = await videosResponse.json();
        
        // Skills are already included in the profile response
        const apiSkills = profileData.data.skills || [];
        
        setProfile({
          full_name: teacherProfile.fullName || 'معلم',
          school_name: teacherProfile.schoolName || null,
          page_title: teacherProfile.pageTitle || null,
          bio: teacherProfile.bio || null,
          page_template: teacherProfile.pageTemplate || 'classic',
          phone_number: teacherProfile.phoneNumber || null,
        });
        
        setQuizzes(quizzesData.data || []);
        
        // Transform API skills to match the expected Skill interface
        const transformedSkills = apiSkills.map(transformApiSkillToSkill);
        setSkills(transformedSkills);
        
        setVideos(videosData.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching teacher public page data:', error);
        toast.error('حدث خطأ أثناء تحميل البيانات');
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const saveQuizResult = async (quizId: string, score: number, totalQuestions: number, answers: Record<number, number>) => {
    if (!teacherId) return;
    
    try {
      // Transform answers object to array format
      const answersArray = Object.entries(answers).map(([qIndex, aIndex]) => ({
        questionIndex: parseInt(qIndex),
        answerIndex: aIndex,
      }));
      
      const response = await fetch('/api/quiz-results/public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId,
          teacherId,
          studentName,
          score,
          totalQuestions,
          answers: answersArray,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save quiz result');
      }
      
      toast.success('تم حفظ نتيجتك بنجاح');
      setLeaderboardKey(k => k + 1);
    } catch (error) {
      console.error('Error saving quiz result:', error);
      toast.error('حدث خطأ أثناء حفظ النتيجة');
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
            {/* <TabsTrigger value="games" className="flex items-center gap-1 sm:gap-2 py-2.5 sm:py-3 rounded-xl data-[state=active]:shadow-md text-xs sm:text-sm">
              <Gamepad2 className="w-4 h-4" />
              <span>الألعاب</span>
              {games.length > 0 && <span className="text-[10px] sm:text-xs bg-primary/10 text-primary px-1 sm:px-1.5 py-0.5 rounded-full">{games.length}</span>}
            </TabsTrigger> */}
            <TabsTrigger value="skills" className="flex items-center gap-1 sm:gap-2 py-2.5 sm:py-3 rounded-xl data-[state=active]:shadow-md text-xs sm:text-sm">
              <Brain className="w-4 h-4" />
              <span>المهارات</span>
              {skills.length > 0 && <span className="text-[10px] sm:text-xs bg-primary/10 text-primary px-1 sm:px-1.5 py-0.5 rounded-full">{skills.length}</span>}
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
          <TabsContent value="skills">
            <PublicSkillList skills={skills}  />
          </TabsContent>
          {/* <TabsContent value="games">
            <PublicGameList games={games} onStartWheel={setActiveWheel} onStartMemory={setActiveMemory} />
          </TabsContent> */}
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
}
