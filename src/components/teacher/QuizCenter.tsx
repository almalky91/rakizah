import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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

interface Question {
  question: string;
  options: string[];
  correct: number;
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  created_at: string;
}

const QuizCenter = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [open, setOpen] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { question: '', options: ['', '', '', ''], correct: 0 },
  ]);

  const fetchQuizzes = async () => {
    const { data } = await supabase
      .from('quizzes')
      .select('*')
      .eq('teacher_id', user?.id)
      .order('created_at', { ascending: false });
    setQuizzes((data as any) || []);
  };

  useEffect(() => { if (user) fetchQuizzes(); }, [user]);

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correct: 0 }]);
  };

  const removeQuestion = (idx: number) => {
    if (questions.length > 1) setQuestions(questions.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx: number, field: string, value: any) => {
    const updated = [...questions];
    if (field === 'question') updated[idx].question = value;
    else if (field === 'correct') updated[idx].correct = parseInt(value);
    setQuestions(updated);
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    const updated = [...questions];
    updated[qIdx].options[oIdx] = value;
    setQuestions(updated);
  };

  const resetForm = () => {
    setQuizTitle('');
    setQuestions([{ question: '', options: ['', '', '', ''], correct: 0 }]);
    setEditingId(null);
  };

  const openEdit = (q: Quiz) => {
    setEditingId(q.id);
    setQuizTitle(q.title);
    setQuestions(q.questions?.length ? q.questions : [{ question: '', options: ['', '', '', ''], correct: 0 }]);
    setOpen(true);
  };

  const saveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = questions.every(q => q.question && q.options.every(o => o));
    if (!valid) { toast.error('يرجى ملء جميع الحقول'); return; }

    if (editingId) {
      const { error } = await supabase.from('quizzes').update({
        title: quizTitle,
        questions: questions as any,
      }).eq('id', editingId);
      if (error) { toast.error('فشل في تحديث الاختبار'); return; }
      toast.success('تم تحديث الاختبار');
    } else {
      const { error } = await supabase.from('quizzes').insert({
        title: quizTitle,
        questions: questions as any,
        teacher_id: user?.id!,
      } as any);
      if (error) { toast.error('فشل في حفظ الاختبار'); return; }
      toast.success('تم حفظ الاختبار');
    }
    resetForm();
    setOpen(false);
    fetchQuizzes();
  };

  const deleteQuiz = async (id: string) => {
    await supabase.from('quizzes').delete().eq('id', id);
    toast.success('تم حذف الاختبار');
    fetchQuizzes();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          مركز الاختبارات
        </h2>
        <div className="flex items-center gap-2">
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

              {questions.map((q, qIdx) => (
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
                    <RadioGroup value={String(q.correct)} onValueChange={v => updateQuestion(qIdx, 'correct', v)}>
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-3">
                          <RadioGroupItem value={String(oIdx)} id={`q${qIdx}-o${oIdx}`} />
                          <Input value={opt} onChange={e => updateOption(qIdx, oIdx, e.target.value)} placeholder={`الخيار ${oIdx + 1}`} required className="flex-1" />
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

      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>لا توجد اختبارات بعد</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map(q => (
            <Card key={q.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{q.title}</h3>
                    <p className="text-sm text-muted-foreground">{q.questions?.length || 0} سؤال</p>
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
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizCenter;
