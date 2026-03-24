import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Gamepad2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const StudentGames = () => {
  const { user } = useAuth();
  const [games, setGames] = useState<any[]>([]);
  const [activeGame, setActiveGame] = useState<any>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('games')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });
      setGames(data || []);
    };
    fetch();
  }, []);

  if (activeGame) {
    return activeGame.game_type === 'wheel' 
      ? <SpinningWheel game={activeGame} user={user} onBack={() => setActiveGame(null)} />
      : <MemoryGame game={activeGame} user={user} onBack={() => setActiveGame(null)} />;
  }

  return (
    <div className="space-y-6">
      {games.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <Gamepad2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>لا توجد ألعاب متاحة حالياً</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map(g => (
            <Card key={g.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setActiveGame(g)}>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center">
                  <Gamepad2 className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{g.title}</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent-foreground">
                  {g.game_type === 'wheel' ? 'العجلة الدوارة' : 'لعبة الذاكرة'}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Spinning Wheel Component
const SpinningWheel = ({ game, user, onBack }: { game: any; user: any; onBack: () => void }) => {
  const items: string[] = game.config?.items || [];
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    const newRotation = rotation + 1800 + Math.random() * 360;
    setRotation(newRotation);
    
    setTimeout(async () => {
      const normalizedAngle = newRotation % 360;
      const segmentAngle = 360 / items.length;
      const idx = Math.floor((360 - normalizedAngle + segmentAngle / 2) % 360 / segmentAngle);
      setResult(items[idx % items.length]);
      setSpinning(false);
      
      // Save points
      await supabase.from('game_scores').insert({
        student_id: user?.id,
        teacher_id: game.teacher_id,
        points: 5,
        source: 'wheel',
      });
      toast.success('حصلت على 5 نقاط! 🎉');
    }, 4000);
  };

  const colors = ['hsl(215, 80%, 45%)', 'hsl(40, 90%, 55%)', 'hsl(150, 60%, 40%)', 'hsl(0, 72%, 51%)', 'hsl(280, 60%, 50%)', 'hsl(180, 60%, 40%)'];

  return (
    <div className="max-w-md mx-auto text-center space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{game.title}</h2>
        <Button variant="ghost" onClick={onBack}>رجوع</Button>
      </div>

      <div className="relative w-72 h-72 mx-auto">
        {/* Arrow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-foreground" />
        
        <svg viewBox="0 0 200 200" className="w-full h-full transition-transform" style={{ transform: `rotate(${rotation}deg)`, transitionDuration: spinning ? '4s' : '0s', transitionTimingFunction: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)' }}>
          {items.map((item, i) => {
            const angle = (360 / items.length) * i;
            const endAngle = (360 / items.length) * (i + 1);
            const startRad = (angle - 90) * (Math.PI / 180);
            const endRad = (endAngle - 90) * (Math.PI / 180);
            const x1 = 100 + 95 * Math.cos(startRad);
            const y1 = 100 + 95 * Math.sin(startRad);
            const x2 = 100 + 95 * Math.cos(endRad);
            const y2 = 100 + 95 * Math.sin(endRad);
            const largeArc = endAngle - angle > 180 ? 1 : 0;
            const midRad = ((angle + endAngle) / 2 - 90) * (Math.PI / 180);
            const tx = 100 + 60 * Math.cos(midRad);
            const ty = 100 + 60 * Math.sin(midRad);

            return (
              <g key={i}>
                <path d={`M100,100 L${x1},${y1} A95,95 0 ${largeArc},1 ${x2},${y2} Z`} fill={colors[i % colors.length]} stroke="white" strokeWidth="1" />
                <text x={tx} y={ty} fill="white" fontSize="8" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${(angle + endAngle) / 2}, ${tx}, ${ty})`}>
                  {item.length > 10 ? item.slice(0, 10) + '..' : item}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {result && (
        <div className="p-4 rounded-xl gradient-gold text-gold-foreground font-bold text-lg animate-float">
          🎉 {result}
        </div>
      )}

      <Button variant="hero" size="lg" onClick={spin} disabled={spinning} className="w-full">
        {spinning ? 'جاري الدوران...' : 'أدِر العجلة!'}
      </Button>
    </div>
  );
};

// Memory Game Component
const MemoryGame = ({ game, user, onBack }: { game: any; user: any; onBack: () => void }) => {
  const pairs: { term: string; match: string }[] = game.config?.pairs || [];
  const [cards, setCards] = useState<{ id: number; text: string; pairId: number; flipped: boolean; matched: boolean }[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const allCards = pairs.flatMap((p, i) => [
      { id: i * 2, text: p.term, pairId: i, flipped: false, matched: false },
      { id: i * 2 + 1, text: p.match, pairId: i, flipped: false, matched: false },
    ]).sort(() => Math.random() - 0.5);
    setCards(allCards);
  }, []);

  const handleClick = useCallback(async (idx: number) => {
    if (selected.length === 2 || cards[idx].flipped || cards[idx].matched) return;

    const newCards = [...cards];
    newCards[idx].flipped = true;
    setCards(newCards);

    const newSelected = [...selected, idx];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newSelected;
      if (newCards[a].pairId === newCards[b].pairId) {
        newCards[a].matched = true;
        newCards[b].matched = true;
        setCards(newCards);
        setSelected([]);

        if (newCards.every(c => c.matched)) {
          const points = Math.max(20 - moves, 5);
          await supabase.from('game_scores').insert({
            student_id: user?.id,
            teacher_id: game.teacher_id,
            points,
            source: 'memory',
          });
          toast.success(`أحسنت! حصلت على ${points} نقطة 🧠`);
        }
      } else {
        setTimeout(() => {
          newCards[a].flipped = false;
          newCards[b].flipped = false;
          setCards([...newCards]);
          setSelected([]);
        }, 1000);
      }
    }
  }, [selected, cards, moves, user, game]);

  const reset = () => {
    const allCards = pairs.flatMap((p, i) => [
      { id: i * 2, text: p.term, pairId: i, flipped: false, matched: false },
      { id: i * 2 + 1, text: p.match, pairId: i, flipped: false, matched: false },
    ]).sort(() => Math.random() - 0.5);
    setCards(allCards);
    setSelected([]);
    setMoves(0);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{game.title}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={reset}><RotateCcw className="w-4 h-4 ml-1" />إعادة</Button>
          <Button variant="ghost" onClick={onBack}>رجوع</Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">المحاولات: {moves}</p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {cards.map((card, idx) => (
          <div
            key={card.id}
            onClick={() => handleClick(idx)}
            className={`aspect-square rounded-xl flex items-center justify-center p-2 text-center text-sm font-semibold cursor-pointer transition-all duration-300 ${
              card.matched ? 'bg-success/20 text-success border border-success/30' :
              card.flipped ? 'gradient-primary text-primary-foreground' :
              'bg-muted hover:bg-muted/80 border border-border'
            }`}
          >
            {card.flipped || card.matched ? card.text : '❓'}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentGames;
