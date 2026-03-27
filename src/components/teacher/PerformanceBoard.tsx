import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Eye, Trophy, Users, FileText, Star } from 'lucide-react';

interface PublicResult {
  id: string;
  student_name: string;
  score: number;
  total_questions: number;
  quiz_title: string;
  created_at: string;
}

const PerformanceBoard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalViews: 0, publicStudents: 0, avgScore: 0, totalQuizAttempts: 0 });
  const [publicResults, setPublicResults] = useState<PublicResult[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      const [videosRes, publicResRes, quizzesRes] = await Promise.all([
        supabase.from('videos').select('views').eq('teacher_id', user.id),
        supabase.from('public_quiz_results').select('*').eq('teacher_id', user.id).order('created_at', { ascending: false }),
        supabase.from('quizzes').select('id, title').eq('teacher_id', user.id),
      ]);

      const totalViews = videosRes.data?.reduce((sum, v) => sum + (v.views || 0), 0) || 0;
      const publicData = (publicResRes.data as any[]) || [];
      const quizMap = new Map((quizzesRes.data || []).map(q => [q.id, q.title]));

      const uniquePublicStudents = new Set(publicData.map(r => r.student_name));
      const avgScore = publicData.length
        ? Math.round(publicData.reduce((sum, r) => sum + (r.score / r.total_questions) * 100, 0) / publicData.length)
        : 0;

      setStats({
        totalViews,
        publicStudents: uniquePublicStudents.size,
        avgScore,
        totalQuizAttempts: publicData.length,
      });

      setPublicResults(
        publicData.map(r => ({
          id: r.id,
          student_name: r.student_name,
          score: r.score,
          total_questions: r.total_questions,
          quiz_title: quizMap.get(r.quiz_id) || 'اختبار محذوف',
          created_at: r.created_at,
        }))
      );
    };

    fetchStats();
  }, [user]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-primary" />
        لوحة الأداء
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0">
              <Eye className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalViews}</p>
              <p className="text-muted-foreground text-xs">مشاهدات</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-gold-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.publicStudents}</p>
              <p className="text-muted-foreground text-xs">طالب مشارك</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-12 h-12 rounded-xl bg-success flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-success-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgScore}%</p>
              <p className="text-muted-foreground text-xs">متوسط الدرجات</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalQuizAttempts}</p>
              <p className="text-muted-foreground text-xs">محاولة اختبار</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            نتائج الاختبارات العامة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {publicResults.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">لا توجد نتائج بعد. شارك رابط صفحتك العامة مع الطلاب!</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الطالب</TableHead>
                    <TableHead className="text-right">الاختبار</TableHead>
                    <TableHead className="text-center">الدرجة</TableHead>
                    <TableHead className="text-center">النسبة</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publicResults.map(r => {
                    const pct = Math.round((r.score / r.total_questions) * 100);
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.student_name}</TableCell>
                        <TableCell>{r.quiz_title}</TableCell>
                        <TableCell className="text-center">{r.score}/{r.total_questions}</TableCell>
                        <TableCell className="text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            pct >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            pct >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {pct}%
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString('ar-SA')}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceBoard;
