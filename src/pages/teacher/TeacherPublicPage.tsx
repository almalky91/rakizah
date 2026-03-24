import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, BookOpen, Gamepad2, User, CheckCircle, XCircle, RotateCw } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  question: string;
  options: string[];
  correct: number;
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

interface Game {
  id: string;
  title: string;
  game_type: 'wheel' | 'memory';
  config: any;
}

const TeacherPublicPage = () => {
  const { teacherId } = useParams<{ teacherId: string }>();
  const [teacherName, setTeacherName] = useState('');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [studentName, setStudentName] = useState('');
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Quiz state
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Wheel state
  const [activeWheel, setActiveWheel] = useState<Game | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelResult, setWheelResult] = useState<string | null>(null);

  // Memory state
  const [activeMemory, setActiveMemory] = useState<Game | null>(null);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [memoryCards, setMemoryCards] = useState<{ id: number; text: string; pairId: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!teacherId) return;
      const [profileRes, quizzesRes, gamesRes] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', teacherId).single(),
        supabase.from('quizzes').select('*').eq('teacher_id', teacherId).order('created_at', { ascending: false }),
        supabase.from('games').select('*').eq('teacher_id', teacherId).order('created_at', { ascending: false }),
      ]);
      setTeacherName(profileRes.data?.full_name || 'معلم');
      setQuizzes((quizzesRes.data as any) || []);
      setGames((gamesRes.data as any) || []);
      setLoading(false);
    };
    fetchData();
  }, [teacherId]);

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  const submitQuiz = () => {
    if (!activeQuiz) return;
    const total = activeQuiz.questions.length;
    const answered = Object.keys(answers).length;
    if (answered < total) {
      toast.error('يرجى الإجابة على جميع الأسئلة');
      return;
    }
    let correct = 0;
    activeQuiz.questions.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });
    setQuizScore(correct);
    setQuizSubmitted(true);
  };

  const startWheel = (game: Game) => {
    setActiveWheel(game);
    setWheelResult(null);
    setWheelRotation(0);
  };

  const spinWheel = () => {
    if (!activeWheel || spinning) return;
    setSpinning(true);
    setWheelResult(null);
    const items = activeWheel.config.items || [];
    const extraRotation = 1440 + Math.random() * 1440;
    const newRotation = wheelRotation + extraRotation;
    setWheelRotation(newRotation);
    setTimeout(() => {
      const normalizedDeg = newRotation % 360;
      const sliceAngle = 360 / items.length;
      const idx = Math.floor((360 - normalizedDeg % 360) / sliceAngle) % items.length;
      setWheelResult(items[idx]);
      setSpinning(false);
    }, 3000);
  };

  const startMemory = (game: Game) => {
    const pairs = game.config.pairs || [];
    const cards = pairs.flatMap((p: any, i: number) => [
      { id: i * 2, text: p.term, pairId: i },
      { id: i * 2 + 1, text: p.match, pairId: i },
    ]);
    // Shuffle
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    setMemoryCards(cards);
    setActiveMemory(game);
    setFlippedCards([]);
    setMatchedPairs([]);
  };

  const flipCard = (cardId: number) => {
    if (flippedCards.length >= 2) return;
    if (flippedCards.includes(cardId) || matchedPairs.includes(cardId)) return;
    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);
    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      const card1 = memoryCards.find(c => c.id === first);
      const card2 = memoryCards.find(c => c.id === second);
      if (card1 && card2 && card1.pairId === card2.pairId) {
        setMatchedPairs(prev => [...prev, first, second]);
        setFlippedCards([]);
      } else {
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Name entry gate
  if (!nameConfirmed) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
        <Card className="w-full max-w-md glass">
          <CardHeader className="text-center">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-3">
              <Star className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl mb-1">صفحة المعلم {teacherName}</CardTitle>
            <p className="text-muted-foreground text-sm">أدخل اسمك للبدء</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); if (studentName.trim()) setNameConfirmed(true); else toast.error('يرجى إدخال اسمك'); }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentName"><User className="w-4 h-4 inline ml-1" />اسم الطالب</Label>
                <Input id="studentName" value={studentName} onChange={e => setStudentName(e.target.value)} required placeholder="أدخل اسمك الكامل" />
              </div>
              <Button type="submit" variant="hero" className="w-full">دخول</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active quiz view
  if (activeQuiz) {
    return (
      <div className="min-h-screen bg-background">
        <header className="gradient-primary py-4 px-6">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <h1 className="text-lg font-bold text-primary-foreground">{activeQuiz.title}</h1>
            <div className="flex items-center gap-3">
              <span className="text-primary-foreground/70 text-sm">{studentName}</span>
              <Button variant="ghost" size="sm" className="text-primary-foreground/70" onClick={() => setActiveQuiz(null)}>رجوع</Button>
            </div>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          {activeQuiz.questions.map((q, qIdx) => (
            <Card key={qIdx} className={quizSubmitted ? (answers[qIdx] === q.correct ? 'border-green-500/50' : 'border-destructive/50') : ''}>
              <CardContent className="p-6 space-y-4">
                <p className="font-semibold text-lg">{qIdx + 1}. {q.question}</p>
                <RadioGroup
                  value={answers[qIdx] !== undefined ? String(answers[qIdx]) : ''}
                  onValueChange={v => !quizSubmitted && setAnswers({ ...answers, [qIdx]: parseInt(v) })}
                  disabled={quizSubmitted}
                >
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      quizSubmitted && oIdx === q.correct ? 'bg-green-50 border-green-500 dark:bg-green-950' :
                      quizSubmitted && answers[qIdx] === oIdx && oIdx !== q.correct ? 'bg-red-50 border-destructive dark:bg-red-950' : ''
                    }`}>
                      <RadioGroupItem value={String(oIdx)} id={`q${qIdx}-o${oIdx}`} />
                      <Label htmlFor={`q${qIdx}-o${oIdx}`} className="flex-1 cursor-pointer">{opt}</Label>
                      {quizSubmitted && oIdx === q.correct && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {quizSubmitted && answers[qIdx] === oIdx && oIdx !== q.correct && <XCircle className="w-5 h-5 text-destructive" />}
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}

          {!quizSubmitted ? (
            <Button variant="hero" className="w-full" onClick={submitQuiz}>تسليم الاختبار</Button>
          ) : (
            <Card className="gradient-primary text-primary-foreground">
              <CardContent className="p-6 text-center">
                <p className="text-3xl font-bold mb-2">{quizScore} / {activeQuiz.questions.length}</p>
                <p className="text-primary-foreground/80">نتيجتك يا {studentName}</p>
                <Button variant="ghost" className="mt-4 text-primary-foreground border border-primary-foreground/30" onClick={() => setActiveQuiz(null)}>
                  العودة للقائمة
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    );
  }

  // Active wheel view
  if (activeWheel) {
    const items = activeWheel.config.items || [];
    const sliceAngle = 360 / items.length;
    const colors = ['hsl(var(--primary))', 'hsl(var(--accent))', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

    return (
      <div className="min-h-screen bg-background">
        <header className="gradient-primary py-4 px-6">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <h1 className="text-lg font-bold text-primary-foreground">{activeWheel.title}</h1>
            <Button variant="ghost" size="sm" className="text-primary-foreground/70" onClick={() => setActiveWheel(null)}>رجوع</Button>
          </div>
        </header>
        <main className="max-w-xl mx-auto px-4 py-8 flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 text-3xl">▼</div>
            <svg
              width="300"
              height="300"
              viewBox="0 0 300 300"
              className="transition-transform duration-[3s] ease-out"
              style={{ transform: `rotate(${wheelRotation}deg)` }}
            >
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
          <Button variant="hero" size="lg" onClick={spinWheel} disabled={spinning} className="min-w-[200px]">
            {spinning ? <RotateCw className="w-5 h-5 animate-spin ml-2" /> : null}
            {spinning ? 'جاري الدوران...' : 'أدر العجلة'}
          </Button>
          {wheelResult && (
            <Card className="w-full">
              <CardContent className="p-6 text-center">
                <p className="text-2xl font-bold text-primary">{wheelResult}</p>
                <p className="text-muted-foreground text-sm mt-1">🎉 النتيجة</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    );
  }

  // Active memory view
  if (activeMemory) {
    const allMatched = matchedPairs.length === memoryCards.length && memoryCards.length > 0;
    return (
      <div className="min-h-screen bg-background">
        <header className="gradient-primary py-4 px-6">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <h1 className="text-lg font-bold text-primary-foreground">{activeMemory.title}</h1>
            <Button variant="ghost" size="sm" className="text-primary-foreground/70" onClick={() => setActiveMemory(null)}>رجوع</Button>
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
            {memoryCards.map(card => {
              const isFlipped = flippedCards.includes(card.id) || matchedPairs.includes(card.id);
              return (
                <button
                  key={card.id}
                  onClick={() => flipCard(card.id)}
                  className={`aspect-square rounded-xl border-2 transition-all duration-300 text-sm font-semibold p-2 flex items-center justify-center ${
                    matchedPairs.includes(card.id) ? 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    isFlipped ? 'bg-primary/10 border-primary text-foreground' :
                    'bg-muted border-border hover:border-primary/50 text-transparent'
                  }`}
                >
                  {isFlipped ? card.text : '؟'}
                </button>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // Main listing
  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary py-6 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-3">
            <Star className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-primary-foreground">{teacherName}</h1>
          <p className="text-primary-foreground/70 text-sm mt-1">مرحباً {studentName} 👋</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Tabs defaultValue="quizzes" dir="rtl">
          <TabsList className="grid grid-cols-2 w-full max-w-sm mx-auto mb-8 h-auto">
            <TabsTrigger value="quizzes" className="flex items-center gap-2 py-3">
              <BookOpen className="w-4 h-4" />
              الاختبارات
            </TabsTrigger>
            <TabsTrigger value="games" className="flex items-center gap-2 py-3">
              <Gamepad2 className="w-4 h-4" />
              الألعاب
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quizzes">
            {quizzes.length === 0 ? (
              <Card><CardContent className="text-center py-12 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>لا توجد اختبارات متاحة حالياً</p>
              </CardContent></Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {quizzes.map(q => (
                  <Card key={q.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => startQuiz(q)}>
                    <CardContent className="p-6">
                      <BookOpen className="w-8 h-8 text-primary mb-3" />
                      <h3 className="font-semibold text-lg">{q.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{q.questions?.length || 0} سؤال</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="games">
            {games.length === 0 ? (
              <Card><CardContent className="text-center py-12 text-muted-foreground">
                <Gamepad2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>لا توجد ألعاب متاحة حالياً</p>
              </CardContent></Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {games.map(g => (
                  <Card key={g.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => g.game_type === 'wheel' ? startWheel(g) : startMemory(g)}>
                    <CardContent className="p-6">
                      <Gamepad2 className="w-8 h-8 text-primary mb-3" />
                      <h3 className="font-semibold text-lg">{g.title}</h3>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent-foreground mt-2">
                        {g.game_type === 'wheel' ? 'عجلة دوارة' : 'لعبة ذاكرة'}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TeacherPublicPage;
