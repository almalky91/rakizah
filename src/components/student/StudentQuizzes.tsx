'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { quizApi, gameApi } from '@/lib/api-client';
import type { Quiz } from '@/db/schema/content';
import type { Profile } from '@/db/schema/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface QuizWithTeacher extends Quiz {
  teacher?: Profile;
}

const StudentQuizzes = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<QuizWithTeacher[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizWithTeacher | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await quizApi.list();
        setQuizzes(data);
      } catch (error) {
        console.error('Failed to fetch quizzes:', error);
      }
    };
    fetchQuizzes();
  }, []);

  const submitQuiz = async () => {
    if (!activeQuiz || !user) return;
    const questions = Array.isArray(activeQuiz.questions) ? activeQuiz.questions : [];
    let correct = 0;
    questions.forEach((q: any, i: number) => {
      if (answers[i] === q.correct) correct++;
    });
    const scorePercent = Math.round((correct / questions.length) * 100);
    setScore(scorePercent);
    setSubmitted(true);

    try {
      // Save result and add points through API
      await gameApi.submitScore({
        source: 'quiz',
        points: correct * 10,
        studentId: user.id,
        teacherId: activeQuiz.teacherId,
      });

      toast.success(`حصلت على ${scorePercent}%`);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      toast.error('فشل حفظ النتيجة');
    }
  };

  if (activeQuiz) {
    const questions = Array.isArray(activeQuiz.questions) ? activeQuiz.questions : [];
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
                <p className="text-xs text-muted-foreground mt-1">{q.teacher?.fullName || 'معلم'}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentQuizzes;
