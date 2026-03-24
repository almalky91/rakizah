import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle, XCircle, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import type { Quiz } from '@/pages/teacher/TeacherPublicPage';

interface Props {
  quiz: Quiz;
  studentName: string;
  teacherId: string;
  onBack: () => void;
  onSaveResult: (quizId: string, score: number, totalQuestions: number, answers: Record<number, number>) => Promise<void>;
}

const PublicQuizView = ({ quiz, studentName, onBack, onSaveResult }: Props) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const submitQuiz = async () => {
    const total = quiz.questions.length;
    if (Object.keys(answers).length < total) {
      toast.error('يرجى الإجابة على جميع الأسئلة');
      return;
    }
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });
    setScore(correct);
    setSubmitted(true);
    await onSaveResult(quiz.id, correct, total, answers);
  };

  const percentage = Math.round((score / quiz.questions.length) * 100);

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-primary-foreground">{quiz.title}</h1>
          <div className="flex items-center gap-3">
            <span className="text-primary-foreground/70 text-sm">{studentName}</span>
            <Button variant="ghost" size="sm" className="text-primary-foreground/70" onClick={onBack}>رجوع</Button>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {quiz.questions.map((q, qIdx) => (
          <Card key={qIdx} className={`transition-all ${submitted ? (answers[qIdx] === q.correct ? 'border-green-500/50 shadow-green-500/10 shadow-lg' : 'border-destructive/50') : 'hover:shadow-md'}`}>
            <CardContent className="p-6 space-y-4">
              <p className="font-semibold text-lg">{qIdx + 1}. {q.question}</p>
              <RadioGroup
                value={answers[qIdx] !== undefined ? String(answers[qIdx]) : ''}
                onValueChange={v => !submitted && setAnswers({ ...answers, [qIdx]: parseInt(v) })}
                disabled={submitted}
              >
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    submitted && oIdx === q.correct ? 'bg-green-50 border-green-500 dark:bg-green-950' :
                    submitted && answers[qIdx] === oIdx && oIdx !== q.correct ? 'bg-red-50 border-destructive dark:bg-red-950' : ''
                  }`}>
                    <RadioGroupItem value={String(oIdx)} id={`q${qIdx}-o${oIdx}`} />
                    <Label htmlFor={`q${qIdx}-o${oIdx}`} className="flex-1 cursor-pointer">{opt}</Label>
                    {submitted && oIdx === q.correct && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {submitted && answers[qIdx] === oIdx && oIdx !== q.correct && <XCircle className="w-5 h-5 text-destructive" />}
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}

        {!submitted ? (
          <Button variant="hero" className="w-full h-12 text-base" onClick={submitQuiz}>تسليم الاختبار</Button>
        ) : (
          <Card className="gradient-primary text-primary-foreground overflow-hidden">
            <CardContent className="p-8 text-center relative">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-foreground/5 rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary-foreground/5 rounded-full" />
              </div>
              <div className="relative z-10">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-accent" />
                <p className="text-4xl font-bold mb-1">{score} / {quiz.questions.length}</p>
                <p className="text-primary-foreground/60 text-sm mb-1">{percentage}%</p>
                <p className="text-primary-foreground/80 mb-4">
                  {percentage >= 80 ? '🎉 أحسنت يا ' : percentage >= 50 ? '👍 جيد يا ' : '💪 حاول مرة أخرى يا '}{studentName}
                </p>
                <Button variant="ghost" className="text-primary-foreground border border-primary-foreground/30" onClick={onBack}>
                  العودة للقائمة
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default PublicQuizView;
