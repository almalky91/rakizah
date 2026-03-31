import { forwardRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { questionBankData, BankCategory, BankModel } from '@/data/questionBank';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Download, ChevronLeft, Eye, Library } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestionBankProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}

type View = 'categories' | 'subcategories' | 'models' | 'preview';

const QuestionBank = forwardRef<HTMLDivElement, QuestionBankProps>(({ open, onOpenChange, onImported }, _ref) => {
  const { user } = useAuth();
  const [view, setView] = useState<View>('categories');
  const [selectedCategory, setSelectedCategory] = useState<BankCategory | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<BankModel | null>(null);
  const [importing, setImporting] = useState(false);

  const reset = () => {
    setView('categories');
    setSelectedCategory(null);
    setSelectedSubcategoryId(null);
    setSelectedModel(null);
  };

  const handleClose = (v: boolean) => {
    onOpenChange(v);
    if (!v) reset();
  };

  const selectCategory = (cat: BankCategory) => {
    setSelectedCategory(cat);
    setView('subcategories');
  };

  const selectSubcategory = (subId: string) => {
    setSelectedSubcategoryId(subId);
    setView('models');
  };

  const previewModel = (model: BankModel) => {
    setSelectedModel(model);
    setView('preview');
  };

  const goBack = () => {
    if (view === 'preview') setView('models');
    else if (view === 'models') setView('subcategories');
    else if (view === 'subcategories') setView('categories');
  };

  const importModel = async (model: BankModel) => {
    if (!user) return;
    setImporting(true);
    try {
      const { error } = await supabase.from('quizzes').insert({
        title: model.title,
        questions: model.questions as any,
        teacher_id: user.id,
      } as any);
      if (error) throw error;
      toast.success('تم استيراد النموذج بنجاح! يمكنك تعديله من اختباراتك');
      onImported();
      handleClose(false);
    } catch {
      toast.error('فشل في استيراد النموذج');
    } finally {
      setImporting(false);
    }
  };

  const selectedSubcategory = selectedCategory?.subcategories.find(s => s.id === selectedSubcategoryId);

  const breadcrumb = () => {
    const parts: string[] = ['المكتبة'];
    if (selectedCategory) parts.push(selectedCategory.name);
    if (selectedSubcategory) parts.push(selectedSubcategory.name);
    if (selectedModel) parts.push(selectedModel.subject);
    return parts;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Library className="w-5 h-5 text-primary" />
            مكتبة النماذج
          </DialogTitle>
        </DialogHeader>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
          {breadcrumb().map((part, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronLeft className="w-3 h-3" />}
              <span className={i === breadcrumb().length - 1 ? 'text-foreground font-medium' : ''}>{part}</span>
            </span>
          ))}
        </div>

        {view !== 'categories' && (
          <Button variant="ghost" size="sm" onClick={goBack} className="w-fit gap-1">
            <ArrowRight className="w-4 h-4" />
            رجوع
          </Button>
        )}

        <AnimatePresence mode="wait">
          {/* Categories */}
          {view === 'categories' && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid gap-4"
            >
              {questionBankData.map(cat => (
                <Card
                  key={cat.id}
                  className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                  onClick={() => selectCategory(cat)}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="text-4xl">{cat.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{cat.name}</h3>
                      <p className="text-sm text-muted-foreground">{cat.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {cat.subcategories.length} تصنيف • {cat.subcategories.reduce((sum, s) => sum + s.models.length, 0)} نموذج
                      </p>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}

          {/* Subcategories */}
          {view === 'subcategories' && selectedCategory && (
            <motion.div
              key="subcategories"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid gap-3"
            >
              {selectedCategory.subcategories.map(sub => (
                <Card
                  key={sub.id}
                  className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                  onClick={() => selectSubcategory(sub.id)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{sub.name}</h3>
                      <p className="text-sm text-muted-foreground">{sub.models.length} نموذج</p>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}

          {/* Models */}
          {view === 'models' && selectedSubcategory && (
            <motion.div
              key="models"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid gap-3"
            >
              {selectedSubcategory.models.map(model => (
                <Card key={model.id} className="hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{model.title}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary">{model.subject}</Badge>
                          <span className="text-sm text-muted-foreground">{model.questions.length} سؤال</span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => previewModel(model)}>
                          <Eye className="w-4 h-4 ml-1" />
                          معاينة
                        </Button>
                        <Button
                          variant="hero"
                          size="sm"
                          onClick={() => importModel(model)}
                          disabled={importing}
                        >
                          <Download className="w-4 h-4 ml-1" />
                          استيراد
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}

          {/* Preview */}
          {view === 'preview' && selectedModel && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{selectedModel.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedModel.questions.length} سؤال</p>
                </div>
                <Button
                  variant="hero"
                  size="sm"
                  onClick={() => importModel(selectedModel)}
                  disabled={importing}
                >
                  <Download className="w-4 h-4 ml-1" />
                  استيراد النموذج
                </Button>
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {selectedModel.questions.map((q, i) => (
                  <Card key={i} className="bg-muted/30">
                    <CardContent className="p-4">
                      <p className="font-medium mb-2">
                        <span className="text-primary font-bold ml-1">{i + 1}.</span>
                        {q.question}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, j) => (
                          <div
                            key={j}
                            className={`text-sm px-3 py-2 rounded-lg border ${
                              j === q.correct
                                ? 'bg-green-50 border-green-300 text-green-800 dark:bg-green-950 dark:border-green-700 dark:text-green-300'
                                : 'bg-background border-border'
                            }`}
                          >
                            <span className="font-medium ml-1">{String.fromCharCode(0x623 + j)})</span>
                            {opt}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
});

QuestionBank.displayName = 'QuestionBank';

export default QuestionBank;
