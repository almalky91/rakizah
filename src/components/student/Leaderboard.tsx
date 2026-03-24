import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Medal, Star } from 'lucide-react';

const Leaderboard = () => {
  const [topStudents, setTopStudents] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('game_scores')
        .select('student_id, points, profiles(full_name)')
        .order('points', { ascending: false })
        .limit(5);
      setTopStudents(data || []);
    };
    fetch();
  }, []);

  const icons = [Trophy, Medal, Star];
  const styles = [
    'gradient-gold text-gold-foreground animate-pulse-gold',
    'bg-muted-foreground/30 text-foreground',
    'bg-accent/30 text-accent-foreground',
  ];

  return (
    <Card className="overflow-hidden">
      <div className="gradient-gold p-4">
        <h3 className="text-lg font-bold text-gold-foreground flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          لوحة التعزيز - الطلاب الأكثر نشاطاً
        </h3>
      </div>
      <CardContent className="p-4">
        {topStudents.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground">كن أول من يتصدر القائمة!</p>
        ) : (
          <div className="flex flex-wrap gap-4 justify-center">
            {topStudents.map((s, i) => {
              const Icon = icons[Math.min(i, 2)];
              return (
                <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 min-w-[120px]">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${styles[Math.min(i, 2)]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-sm">{(s.profiles as any)?.full_name || 'طالب'}</span>
                  <span className="text-xs text-primary font-bold">{s.points} نقطة</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
