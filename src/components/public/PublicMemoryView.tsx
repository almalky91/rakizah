import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Game } from '@/pages/teacher/TeacherPublicPage';

interface Props {
  game: Game;
  studentName: string;
  onBack: () => void;
}

const PublicMemoryView = ({ game, studentName, onBack }: Props) => {
  const [cards, setCards] = useState<{ id: number; text: string; pairId: number }[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);

  useEffect(() => {
    const pairs = game.config.pairs || [];
    const allCards = pairs.flatMap((p: any, i: number) => [
      { id: i * 2, text: p.term, pairId: i },
      { id: i * 2 + 1, text: p.match, pairId: i },
    ]);
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }
    setCards(allCards);
  }, [game]);

  const flip = (cardId: number) => {
    if (flipped.length >= 2 || flipped.includes(cardId) || matched.includes(cardId)) return;
    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      const [a, b] = newFlipped;
      const c1 = cards.find(c => c.id === a);
      const c2 = cards.find(c => c.id === b);
      if (c1 && c2 && c1.pairId === c2.pairId) {
        setMatched(prev => [...prev, a, b]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  const allMatched = matched.length === cards.length && cards.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-primary-foreground">{game.title}</h1>
          <Button variant="ghost" size="sm" className="text-primary-foreground/70" onClick={onBack}>رجوع</Button>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">
        {allMatched && (
          <Card className="mb-6 gradient-primary text-primary-foreground">
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold">🎉 أحسنت يا {studentName}!</p>
              <p className="text-primary-foreground/70">تم مطابقة جميع الأزواج</p>
            </CardContent>
          </Card>
        )}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {cards.map(card => {
            const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
            return (
              <button key={card.id} onClick={() => flip(card.id)} className={`aspect-square rounded-xl border-2 transition-all duration-300 text-sm font-semibold p-2 flex items-center justify-center ${
                matched.includes(card.id) ? 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:text-green-200' :
                isFlipped ? 'bg-primary/10 border-primary text-foreground' :
                'bg-muted border-border hover:border-primary/50 text-transparent'
              }`}>
                {isFlipped ? card.text : '؟'}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default PublicMemoryView;
