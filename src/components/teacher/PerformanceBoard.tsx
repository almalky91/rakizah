import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Eye, Trophy, Users } from 'lucide-react';

const PerformanceBoard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalViews: 0, totalStudents: 0, avgScore: 0 });
  const [topStudents, setTopStudents] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const fetchStats = async () => {
      // Video views
      const { data: videos } = await supabase
        .from('videos')
        .select('views')
        .eq('teacher_id', user.id);
      const totalViews = videos?.reduce((sum, v) => sum + (v.views || 0), 0) || 0;

      // Quiz results
      const { data: results } = await supabase
        .from('quiz_results')
        .select('score, student_id, profiles(full_name)')
        .eq('teacher_id', user.id);

      const uniqueStudents = new Set(results?.map(r => r.student_id) || []);
      const avgScore = results?.length
        ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
        : 0;

      setStats({ totalViews, totalStudents: uniqueStudents.size, avgScore });

      // Game scores for top students
      const { data: scores } = await supabase
        .from('game_scores')
        .select('points, student_id, profiles(full_name)')
        .eq('teacher_id', user.id)
        .order('points', { ascending: false })
        .limit(10);
      
      setTopStudents(scores || []);
    };

    fetchStats();
  }, [user]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-primary" />
        لوحة الأداء
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
              <Eye className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.totalViews}</p>
              <p className="text-muted-foreground text-sm">إجمالي المشاهدات</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-14 h-14 rounded-xl gradient-gold flex items-center justify-center">
              <Users className="w-7 h-7 text-gold-foreground" />
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.totalStudents}</p>
              <p className="text-muted-foreground text-sm">طالب نشط</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-14 h-14 rounded-xl bg-success flex items-center justify-center">
              <Trophy className="w-7 h-7 text-success-foreground" />
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.avgScore}%</p>
              <p className="text-muted-foreground text-sm">متوسط الدرجات</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent" />
            أفضل الطلاب (النقاط)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topStudents.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">لا توجد بيانات بعد</p>
          ) : (
            <div className="space-y-3">
              {topStudents.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i === 0 ? 'gradient-gold text-gold-foreground' : 
                      i === 1 ? 'bg-muted-foreground/20 text-foreground' : 
                      'bg-muted text-muted-foreground'
                    }`}>
                      {i + 1}
                    </span>
                    <span className="font-medium">{(s.profiles as any)?.full_name || 'طالب'}</span>
                  </div>
                  <span className="font-bold text-primary">{s.points} نقطة</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceBoard;
