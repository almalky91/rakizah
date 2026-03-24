import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';
import type { Game } from '@/pages/teacher/TeacherPublicPage';

interface Props {
  game: Game;
  onBack: () => void;
}

const PublicWheelView = ({ game, onBack }: Props) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  const items = game.config.items || [];
  const sliceAngle = 360 / items.length;
  const colors = ['hsl(215, 80%, 45%)', 'hsl(40, 90%, 55%)', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    const extra = 1440 + Math.random() * 1440;
    const newRotation = rotation + extra;
    setRotation(newRotation);
    setTimeout(() => {
      const norm = newRotation % 360;
      const idx = Math.floor((360 - norm % 360) / sliceAngle) % items.length;
      setResult(items[idx]);
      setSpinning(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-primary-foreground">{game.title}</h1>
          <Button variant="ghost" size="sm" className="text-primary-foreground/70" onClick={onBack}>رجوع</Button>
        </div>
      </header>
      <main className="max-w-xl mx-auto px-4 py-8 flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 text-3xl">▼</div>
          <svg width="300" height="300" viewBox="0 0 300 300" className="transition-transform duration-[3s] ease-out" style={{ transform: `rotate(${rotation}deg)` }}>
            {items.map((item: string, i: number) => {
              const startAngle = i * sliceAngle;
              const endAngle = startAngle + sliceAngle;
              const startRad = (startAngle - 90) * Math.PI / 180;
              const endRad = (endAngle - 90) * Math.PI / 180;
              const x1 = 150 + 140 * Math.cos(startRad);
              const y1 = 150 + 140 * Math.sin(startRad);
              const x2 = 150 + 140 * Math.cos(endRad);
              const y2 = 150 + 140 * Math.sin(endRad);
              const largeArc = sliceAngle > 180 ? 1 : 0;
              const midRad = ((startAngle + endAngle) / 2 - 90) * Math.PI / 180;
              const tx = 150 + 80 * Math.cos(midRad);
              const ty = 150 + 80 * Math.sin(midRad);
              return (
                <g key={i}>
                  <path d={`M150,150 L${x1},${y1} A140,140 0 ${largeArc},1 ${x2},${y2} Z`} fill={colors[i % colors.length]} stroke="white" strokeWidth="2" />
                  <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="11" fontWeight="bold">{item}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <Button variant="hero" size="lg" onClick={spin} disabled={spinning} className="min-w-[200px]">
          {spinning ? <RotateCw className="w-5 h-5 animate-spin ml-2" /> : null}
          {spinning ? 'جاري الدوران...' : 'أدر العجلة'}
        </Button>
        {result && (
          <Card className="w-full"><CardContent className="p-6 text-center">
            <p className="text-2xl font-bold text-primary">{result}</p>
            <p className="text-muted-foreground text-sm mt-1">🎉 النتيجة</p>
          </CardContent></Card>
        )}
      </main>
    </div>
  );
};

export default PublicWheelView;
