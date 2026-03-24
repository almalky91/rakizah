import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const StudentQuizzes = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('quizzes')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });
      setQuizzes(data || []);
    };
    fetch();
  }, []);

  const submitQuiz = async () => {
    if (!activeQuiz) return;
    const questions = activeQuiz.questions || [];
    let correct = 0;
    questions.forEach((q: any, i: number) => {
      if (answers[i] === q.correct) correct++;
    });
    const scorePercent = Math.round((correct / questions.length) * 100);
    setScore(scorePercent);
    setSubmitted(true);

    // Save result
    await supabase.from('quiz_results').insert({
      quiz_id: activeQuiz.id,
      student_id: user?.id,
      teacher_id: activeQuiz.teacher_id,
      score: scorePercent,
      answers,
    });

    // Add points
    await supabase.from('game_scores').insert({
      student_id: user?.id,
      teacher_id: activeQuiz.teacher_id,
      points: correct * 10,
      source: 'quiz',
    });

    toast.success(`حصلت على ${scorePercent}%`);
  };

  if (activeQuiz) {
    const questions = activeQuiz.questions || [];
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{activeQuiz.title}</h2>
          <Button variant="ghost" onClick={() => { setActiveQuiz(null); setAnswers({}); setSubmitted(false); }}>رجوع</Button>
        </div>

        {submitted && (
          <Card className={score >= 70 ? 'border-success' : 'border-destructive'}>
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold mb-2">{score}%</p>
              <p className="text-muted-foreground">{score >= 70 ? 'أحسنت! 🎉' : 'حاول مرة أخرى 💪'}</p>
            </CardContent>
          </Card>
        )}

        {questions.map((q: any, qIdx: number) => (
          <Card key={qIdx} className={submitted ? (answers[qIdx] === q.correct ? 'border-success' : 'border-destructive') : ''}>
            <CardHeader><CardTitle className="text-base">السؤال {qIdx + 1}: {q.question}</CardTitle></CardHeader>
            <CardContent>
              <RadioGroup value={String(answers[qIdx] ?? '')} onValueChange={v => !submitted && setAnswers({ ...answers, [qIdx]: parseInt(v) })} disabled={submitted}>
                {q.options.map((opt: string, oIdx: number) => (
                  <div key={oIdx} className={`flex items-center gap-3 p-2 rounded-lg ${
                    submitted && oIdx === q.correct ? 'bg-success/10' : 
                    submitted && answers[qIdx] === oIdx && oIdx !== q.correct ? 'bg-destructive/10' : ''
                  }`}>
                    <RadioGroupItem value={String(oIdx)} id={`q${qIdx}-o${oIdx}`} />
                    <Label htmlFor={`q${qIdx}-o${oIdx}`} className="flex-1 cursor-pointer">{opt}</Label>
                    {submitted && oIdx === q.correct && <Check className="w-4 h-4 text-success" />}
                    {submitted && answers[qIdx] === oIdx && oIdx !== q.correct && <X className="w-4 h-4 text-destructive" />}
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}

        {!submitted && (
          <Button variant="hero" className="w-full" onClick={submitQuiz} disabled={Object.keys(answers).length < questions.length}>
            تسليم الإجابات
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>لا توجد اختبارات متاحة حالياً</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map(q => (
            <Card key={q.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setActiveQuiz(q)}>
              <CardContent className="p-6">
                <BookOpen className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold text-lg mb-1">{q.title}</h3>
                <p className="text-sm text-muted-foreground">{q.questions?.length || 0} سؤال</p>
                <p className="text-xs text-muted-foreground mt-1">{(q.profiles as any)?.full_name || 'معلم'}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentQuizzes;
