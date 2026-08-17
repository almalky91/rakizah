'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, BookOpen, X, Pencil, Library } from 'lucide-react';
import { toast } from 'sonner';
import QuestionBank from './QuestionBank';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { quizApi } from '@/lib/api-client';

// QuizQuestion type definition for form state
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

// Quiz type from API client
interface Quiz {
  id: string;
  teacherId: string;
  title: string;
  questions: QuizQuestion[] | any; // Can be array or parsed JSON
  createdAt: Date | string;
}

const QuizCenter = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [open, setOpen] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    { question: '', options: ['', '', '', ''], correctAnswer: '' },
  ]);

  const fetchQuizzes = async () => {
    try {
      const data = await quizApi.list(user?.id);
      setQuizzes(data);
    } catch (error) {
      toast.error('فشل في تحميل الاختبارات');
    }
  };

  useEffect(() => { if (user) fetchQuizzes(); }, [user]);

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: '' }]);
  };

  const removeQuestion = (idx: number) => {
    if (questions.length > 1) setQuestions(questions.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx: number, field: string, value: any) => {
    const updated = [...questions];
    if (field === 'question') updated[idx].question = value;
    else if (field === 'correctAnswer') updated[idx].correctAnswer = value;
    setQuestions(updated);
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = value;
    setQuestions(updated);
  };

  const resetForm = () => {
    setQuizTitle('');
    setQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: '' }]);
    setEditingId(null);
  };

  const openEdit = (q: Quiz) => {
    setEditingId(q.id);
    setQuizTitle(q.title);
    // Ensure questions is an array - parse if string, fallback to default if not array
    let questionsArray: QuizQuestion[];
    if (typeof q.questions === 'string') {
      try {
        questionsArray = JSON.parse(q.questions);
      } catch {
        questionsArray = [{ question: '', options: ['', '', '', ''], correctAnswer: '' }];
      }
    } else if (Array.isArray(q.questions) && q.questions.length > 0) {
      questionsArray = q.questions;
    } else {
      questionsArray = [{ question: '', options: ['', '', '', ''], correctAnswer: '' }];
    }
    setQuestions(questionsArray);
    setOpen(true);
  };

  const saveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = questions.every(q => q.question && q.options.every(o => o) && q.correctAnswer);
    if (!valid) { toast.error('يرجى ملء جميع الحقول واختيار الإجابة الصحيحة'); return; }

    try {
      if (editingId) {
        await quizApi.update(editingId, {
          title: quizTitle,
          questions: questions,
        });
        toast.success('تم تحديث الاختبار');
      } else {
        await quizApi.create({
          title: quizTitle,
          questions: questions,
        });
        toast.success('تم حفظ الاختبار');
      }
      resetForm();
      setOpen(false);
      fetchQuizzes();
    } catch (error) {
      toast.error(editingId ? 'فشل في تحديث الاختبار' : 'فشل في حفظ الاختبار');
    }
  };

  const deleteQuiz = async (id: string) => {
    try {
      await quizApi.delete(id);
      toast.success('تم حذف الاختبار');
      fetchQuizzes();
    } catch (error) {
      toast.error('فشل في حذف الاختبار');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          مركز الاختبارات
        </h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={() => setBankOpen(true)}>
            <Library className="w-4 h-4 ml-1" />مكتبة النماذج
          </Button>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button variant="hero" size="sm"><Plus className="w-4 h-4 ml-1" />إنشاء اختبار</Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingId ? 'تعديل الاختبار' : 'إنشاء اختبار جديد'}</DialogTitle></DialogHeader>
            <form onSubmit={saveQuiz} className="space-y-6">
              <div className="space-y-2">
                <Label>عنوان الاختبار</Label>
                <Input value={quizTitle} onChange={e => setQuizTitle(e.target.value)} required placeholder="مثال: اختبار الوحدة الأولى" />
              </div>

              {questions?.map((q, qIdx) => (
                <Card key={qIdx} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">السؤال {qIdx + 1}</CardTitle>
                      {questions.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(qIdx)}>
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea value={q.question} onChange={e => updateQuestion(qIdx, 'question', e.target.value)} placeholder="نص السؤال" required />
                    <RadioGroup value={q.correctAnswer} onValueChange={v => updateQuestion(qIdx, 'correctAnswer', v)}>
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-3">
                          <RadioGroupItem value={opt || `__empty_${oIdx}`} id={`q${qIdx}-o${oIdx}`} disabled={!opt} />
                          <Input value={opt} onChange={e => {
                            const newValue = e.target.value;
                            updateOption(qIdx, oIdx, newValue);
                            if (q.correctAnswer === opt && opt !== '') {
                              updateQuestion(qIdx, 'correctAnswer', newValue);
                            }
                          }} placeholder={`الخيار ${oIdx + 1}`} required className="flex-1" />
                        </div>
                      ))}
                    </RadioGroup>
                    <p className="text-xs text-muted-foreground">اختر الإجابة الصحيحة بالنقر على الدائرة</p>
                  </CardContent>
                </Card>
              ))}

              <Button type="button" variant="outline" onClick={addQuestion} className="w-full">
                <Plus className="w-4 h-4 ml-1" />إضافة سؤال آخر
              </Button>
              <Button type="submit" variant="hero" className="w-full">{editingId ? 'تحديث الاختبار' : 'حفظ الاختبار'}</Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <QuestionBank open={bankOpen} onOpenChange={setBankOpen} onImported={fetchQuizzes} />

      {quizzes?.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>لا توجد اختبارات بعد</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes?.map(q => {
            // Safely get questions count
            let questionsCount = 0;
            if (Array.isArray(q.questions)) {
              questionsCount = q.questions.length;
            } else if (typeof q.questions === 'string') {
              try {
                const parsed = JSON.parse(q.questions);
                questionsCount = Array.isArray(parsed) ? parsed.length : 0;
              } catch {
                questionsCount = 0;
              }
            }

            return (
              <Card key={q.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{q.title}</h3>
                      <p className="text-sm text-muted-foreground">{questionsCount} سؤال</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(q)} className="text-primary hover:text-primary">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteQuiz(q.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuizCenter;
