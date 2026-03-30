import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle, XCircle, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
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
  const [currentQ, setCurrentQ] = useState(0);

  const total = quiz.questions.length;
  const q = quiz.questions[currentQ];
  const progress = ((currentQ + 1) / total) * 100;
  const percentage = Math.round((score / total) * 100);

  const submitQuiz = async () => {
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

  if (submitted) {
    return (
      <Dialog open onOpenChange={() => onBack()}>
        <DialogContent className="max-w-md" dir="rtl">
          <div className="gradient-primary text-primary-foreground rounded-xl overflow-hidden -m-6">
            <div className="p-8 text-center relative">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-foreground/5 rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary-foreground/5 rounded-full" />
              </div>
              <div className="relative z-10">
                <Trophy className="w-14 h-14 mx-auto mb-4 text-accent" />
                <p className="text-5xl font-bold mb-2">{score} / {total}</p>
                <p className="text-primary-foreground/60 text-lg mb-2">{percentage}%</p>
                <p className="text-primary-foreground/80 text-lg mb-6">
                  {percentage >= 80 ? '🎉 أحسنت يا ' : percentage >= 50 ? '👍 جيد يا ' : '💪 حاول مرة أخرى يا '}{studentName}
                </p>
                <Button variant="ghost" className="text-primary-foreground border border-primary-foreground/30" onClick={onBack}>
                  العودة للقائمة
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={() => onBack()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">{quiz.title}</DialogTitle>
            <span className="text-sm text-muted-foreground">{currentQ + 1} / {total}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </DialogHeader>

        <div className="space-y-5 py-2">
          <p className="font-semibold text-lg">{currentQ + 1}. {q.question}</p>
          <RadioGroup
            value={answers[currentQ] !== undefined ? String(answers[currentQ]) : ''}
            onValueChange={v => setAnswers({ ...answers, [currentQ]: parseInt(v) })}
          >
            {q.options.map((opt, oIdx) => (
              <div key={oIdx} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-accent/50 ${
                answers[currentQ] === oIdx ? 'border-primary bg-primary/5' : ''
              }`}>
                <RadioGroupItem value={String(oIdx)} id={`q${currentQ}-o${oIdx}`} />
                <Label htmlFor={`q${currentQ}-o${oIdx}`} className="flex-1 cursor-pointer">{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentQ(c => c + 1)}
            disabled={currentQ >= total - 1}
            className="flex items-center gap-1"
          >
            التالي
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {currentQ === total - 1 && Object.keys(answers).length === total && (
            <Button variant="hero" size="sm" onClick={submitQuiz}>
              تسليم الاختبار
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentQ(c => c - 1)}
            disabled={currentQ <= 0}
            className="flex items-center gap-1"
          >
            <ChevronRight className="w-4 h-4" />
            السابق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PublicQuizView;
