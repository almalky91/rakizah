import { Card, CardContent } from '@/components/ui/card';
import { Gamepad2, ArrowLeft } from 'lucide-react';
import type { Game } from '@/pages/teacher/TeacherPublicPage';

interface Props {
  games: Game[];
  onStartWheel: (game: Game) => void;
  onStartMemory: (game: Game) => void;
}

const PublicGameList = ({ games, onStartWheel, onStartMemory }: Props) => {
  if (games.length === 0) {
    return (
      <Card><CardContent className="text-center py-16 text-muted-foreground">
        <Gamepad2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="text-lg">لا توجد ألعاب متاحة حالياً</p>
      </CardContent></Card>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {games.map(g => (
        <Card key={g.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/30" onClick={() => g.game_type === 'wheel' ? onStartWheel(g) : onStartMemory(g)}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Gamepad2 className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{g.title}</h3>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-accent/15 text-accent-foreground">
                  {g.game_type === 'wheel' ? '🎡 عجلة دوارة' : '🧠 لعبة ذاكرة'}
                </span>
              </div>
              <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PublicGameList;
