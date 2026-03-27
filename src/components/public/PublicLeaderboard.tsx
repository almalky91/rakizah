import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Star, Award } from 'lucide-react';

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

  useEffect(() => {
    const fetchData = async () => {
      const [quizRes, videoRes] = await Promise.all([
        supabase
          .from('public_quiz_results')
          .select('student_name, score, total_questions')
          .eq('teacher_id', teacherId),
        supabase
          .from('public_video_views' as any)
          .select('student_name')
          .eq('teacher_id', teacherId),
      ]);

      const quizData = (quizRes.data as any[]) || [];
      const videoData = (videoRes.data as any[]) || [];

      // Aggregate by student name
      const videoWatchers = new Set(videoData.map((v: any) => v.student_name));
      const studentMap = new Map<string, { totalScore: number; quizCount: number }>();

      quizData.forEach((r: any) => {
        const existing = studentMap.get(r.student_name) || { totalScore: 0, quizCount: 0 };
        existing.totalScore += r.score;
        existing.quizCount += 1;
        studentMap.set(r.student_name, existing);
      });

      // Also add video-only watchers
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
      setLoading(false);
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
    <Card className="overflow-hidden border-border/50 shadow-lg mb-8">
      <div className="bg-gradient-to-r from-amber-500/90 to-yellow-500/90 p-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          لوحة التعزيز - الطلاب المتميزون
        </h3>
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          {entries.map((entry, i) => (
            <div
              key={entry.student_name}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
            >
              {/* Rank */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                  i < 3
                    ? `bg-gradient-to-br ${rankStyles[i]}`
                    : 'bg-muted-foreground/20 text-muted-foreground'
                }`}
              >
                {i < 3 ? <Award className="w-5 h-5" /> : i + 1}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{entry.student_name}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.quiz_count > 0
                    ? `${entry.quiz_count} اختبار • ${entry.total_score} درجة`
                    : 'مشاهد نشط'}
                </p>
              </div>

              {/* Video badge */}
              {entry.watched_videos && (
                <div className="shrink-0" title="شاهد مقاطع الفيديو">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                </div>
              )}

              {/* Score */}
              <span className="text-sm font-bold text-primary shrink-0">
                {entry.total_score} نقطة
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>النجمة تعني أن الطالب شاهد مقاطع الفيديو</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PublicLeaderboard;
