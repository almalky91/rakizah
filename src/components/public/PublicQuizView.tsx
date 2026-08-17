'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import type { Quiz } from '@/db/schema/content';

interface Props {
  quiz: Quiz;
  studentName: string;
  teacherId: string;
  onBack: () => void;
  onSaveResult: (quizId: string, score: number, totalQuestions: number, answers: Record<number, number>) => Promise<void>;
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0, scale: 0.95 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0, scale: 0.95 }),
};

const PublicQuizView = ({ quiz, studentName, onBack, onSaveResult }: Props) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [direction, setDirection] = useState(0);

  // Parse questions if they're a JSON string
  let questions: any[] = [];
  if (Array.isArray(quiz.questions)) {
    questions = quiz.questions;
  } else if (typeof quiz.questions === 'string') {
    try {
      questions = JSON.parse(quiz.questions);
    } catch (e) {
      console.error('Error parsing quiz questions:', e);
      questions = [];
    }
  }

  // Safety check - if no questions, show error and go back
  if (questions.length === 0) {
    toast.error('لا يوجد أسئلة في هذا الاختبار');
    onBack();
    return null;
  }

  const total = questions.length;
  const q = questions[currentQ];
  const progress = ((currentQ + 1) / total) * 100;
  const percentage = Math.round((score / total) * 100);

  const goNext = () => { setDirection(1); setCurrentQ(c => c + 1); };
  const goPrev = () => { setDirection(-1); setCurrentQ(c => c - 1); };

  const submitQuiz = async () => {
    if (Object.keys(answers).length < total) {
      toast.error('يرجى الإجابة على جميع الأسئلة');
      return;
    }
    let correct = 0;
    questions.forEach((q, i) => {
      // answers[i] is the index of the selected option
      // q.correctAnswer is the text of the correct option
      // So we need to compare q.options[answers[i]] with q.correctAnswer
      const selectedAnswer = q.options?.[answers[i]];
      if (selectedAnswer === q.correctAnswer) {
        correct++;
      }
    });
    setScore(correct);
    setSubmitted(true);
    await onSaveResult(quiz.id, correct, total, answers);
  };

  if (submitted) {
    return (
      <Dialog open onOpenChange={() => onBack()}>
        <DialogContent className="max-w-md" dir="rtl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.6, bounce: 0.4 }}
            className="gradient-primary text-primary-foreground rounded-xl overflow-hidden -m-6"
          >
            <div className="p-8 text-center relative">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-foreground/5 rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary-foreground/5 rounded-full" />
              </div>
              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.2, duration: 0.8 }}
                >
                  <Trophy className="w-14 h-14 mx-auto mb-4 text-accent" />
                </motion.div>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-5xl font-bold mb-2"
                >
                  {score} / {total}
                </motion.p>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-primary-foreground/60 text-lg mb-2"
                >
                  {percentage}%
                </motion.p>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-primary-foreground/80 text-lg mb-6"
                >
                  {percentage >= 80 ? '🎉 أحسنت يا ' : percentage >= 50 ? '👍 جيد يا ' : '💪 حاول مرة أخرى يا '}{studentName}
                </motion.p>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                  <Button variant="ghost" className="text-primary-foreground border border-primary-foreground/30" onClick={onBack}>
                    العودة للقائمة
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={() => onBack()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden" dir="rtl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">{quiz.title}</DialogTitle>
            <span className="text-sm text-muted-foreground">{currentQ + 1} / {total}</span>
          </div>
          <Progress value={progress} className="h-2 transition-all duration-500" />
        </DialogHeader>

        <div className="relative overflow-hidden min-h-[250px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQ}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30, duration: 0.3 }}
              className="space-y-5 py-2"
            >
              <p className="font-semibold text-lg">{currentQ + 1}. {q.question}</p>
              <RadioGroup
                value={answers[currentQ] !== undefined ? String(answers[currentQ]) : ''}
                onValueChange={v => setAnswers({ ...answers, [currentQ]: parseInt(v) })}
              >
                {(q.options || []).map((opt, oIdx) => (
                  <motion.div
                    key={oIdx}
                    initial={{ opacity: 0, x: direction >= 0 ? 30 : -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: oIdx * 0.08, duration: 0.25 }}
                    className={`flex flex-row-reverse items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:bg-accent/50 hover:scale-[1.01] ${
                      answers[currentQ] === oIdx ? 'border-primary bg-primary/5 shadow-sm' : ''
                    }`}
                  >
                    <RadioGroupItem value={String(oIdx)} id={`q${currentQ}-o${oIdx}`} />
                    <Label htmlFor={`q${currentQ}-o${oIdx}`} className="flex-1 cursor-pointer">{opt}</Label>
                  </motion.div>
                ))}
              </RadioGroup>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            onClick={goNext}
            disabled={currentQ >= total - 1}
            className="flex items-center gap-1 transition-transform active:scale-95"
          >
            التالي
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {currentQ === total - 1 && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
              <Button variant="hero" size="sm" onClick={submitQuiz}>
                تسليم الاختبار
              </Button>
            </motion.div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={goPrev}
            disabled={currentQ <= 0}
            className="flex items-center gap-1 transition-transform active:scale-95"
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
