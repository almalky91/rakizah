import { useState, useEffect } from 'react';
import { quizResultsApi, videoViewsApi } from '@/lib/api-client';
import { Trophy, Star, Award, X } from 'lucide-react';

interface LeaderboardEntry {
  student_name: string;
  total_score: number;
  quiz_count: number;
  watched_videos: boolean;
}

interface Props {
  teacherId: string;
}

const PublicLeaderboard = ({ teacherId }: Props) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizData, videoData] = await Promise.all([
          quizResultsApi.getPublicByTeacher(teacherId),
          videoViewsApi.getPublicByTeacher(teacherId),
        ]);

        const videoWatchers = new Set(videoData.map((v: any) => v.student_name));
        const studentMap = new Map<string, { totalScore: number; quizCount: number }>();

        quizData.forEach((r: any) => {
          const existing = studentMap.get(r.student_name) || { totalScore: 0, quizCount: 0 };
          existing.totalScore += r.score;
          existing.quizCount += 1;
          studentMap.set(r.student_name, existing);
        });

        videoWatchers.forEach(name => {
          if (!studentMap.has(name)) {
            studentMap.set(name, { totalScore: 0, quizCount: 0 });
          }
        });

        const list: LeaderboardEntry[] = Array.from(studentMap.entries())
          .map(([name, data]) => ({
            student_name: name,
            total_score: data.totalScore,
            quiz_count: data.quizCount,
            watched_videos: videoWatchers.has(name),
          }))
          .sort((a, b) => b.total_score - a.total_score)
          .slice(0, 10);

        setEntries(list);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [teacherId]);

  if (loading || entries.length === 0) return null;

  const rankStyles = [
    'from-yellow-400 to-amber-500 text-amber-950',
    'from-gray-300 to-gray-400 text-gray-800',
    'from-orange-300 to-orange-400 text-orange-900',
  ];

  return (
    <>
      {/* Floating trophy button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-amber-950 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center animate-bounce"
        style={{ animationDuration: '2s', animationIterationCount: 3 }}
        title="لوحة التعزيز"
      >
        <Trophy className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
          {entries.length}
        </span>
      </button>

      {/* Overlay panel */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative z-10 w-full max-w-md mx-4 mb-4 sm:mb-0 bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500/90 to-yellow-500/90 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                لوحة التعزيز
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
              {entries.map((entry, i) => (
                <div
                  key={entry.student_name}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      i < 3
                        ? `bg-gradient-to-br ${rankStyles[i]}`
                        : 'bg-muted-foreground/20 text-muted-foreground'
                    }`}
                  >
                    {i < 3 ? <Award className="w-5 h-5" /> : i + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{entry.student_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.quiz_count > 0
                        ? `${entry.quiz_count} اختبار • ${entry.total_score} درجة`
                        : 'مشاهد نشط'}
                    </p>
                  </div>

                  {entry.watched_videos && (
                    <div className="shrink-0" title="شاهد مقاطع الفيديو">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    </div>
                  )}

                  <span className="text-sm font-bold text-primary shrink-0">
                    {entry.total_score} نقطة
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 px-4 py-3 border-t border-border/50 text-xs text-muted-foreground">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>النجمة تعني أن الطالب شاهد مقاطع الفيديو</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PublicLeaderboard;
