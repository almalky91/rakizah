import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Eye, Trophy, Users, FileText, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface PublicResult {
  id: string;
  student_name: string;
  score: number;
  total_questions: number;
  quiz_title: string;
  created_at: string;
}

const PerformanceBoard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalViews: 0, publicStudents: 0, avgScore: 0, totalQuizAttempts: 0 });
  const [publicResults, setPublicResults] = useState<PublicResult[]>([]);

  const printRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    if (!user) return;
    const [videosRes, publicResRes, quizzesRes] = await Promise.all([
      supabase.from('videos').select('views').eq('teacher_id', user.id),
      supabase.from('public_quiz_results').select('*').eq('teacher_id', user.id).order('created_at', { ascending: false }),
      supabase.from('quizzes').select('id, title').eq('teacher_id', user.id),
    ]);

    const totalViews = videosRes.data?.reduce((sum, v) => sum + (v.views || 0), 0) || 0;
    const publicData = (publicResRes.data as any[]) || [];
    const quizMap = new Map((quizzesRes.data || []).map(q => [q.id, q.title]));

    const uniquePublicStudents = new Set(publicData.map(r => r.student_name));
    const avgScore = publicData.length
      ? Math.round(publicData.reduce((sum, r) => sum + (r.score / r.total_questions) * 100, 0) / publicData.length)
      : 0;

    setStats({
      totalViews,
      publicStudents: uniquePublicStudents.size,
      avgScore,
      totalQuizAttempts: publicData.length,
    });

    setPublicResults(
      publicData.map(r => ({
        id: r.id,
        student_name: r.student_name,
        score: r.score,
        total_questions: r.total_questions,
        quiz_title: quizMap.get(r.quiz_id) || 'اختبار محذوف',
        created_at: r.created_at,
      }))
    );
  };

  useEffect(() => { fetchData(); }, [user]);

  const deleteResult = async (id: string) => {
    const { error } = await supabase.from('public_quiz_results').delete().eq('id', id);
    if (error) { toast.error('فشل في الحذف'); return; }
    toast.success('تم حذف النتيجة');
    fetchData();
  };

  const deleteStudentResults = async (studentName: string) => {
    if (!user) return;
    const { error } = await supabase.from('public_quiz_results').delete().eq('teacher_id', user.id).eq('student_name', studentName);
    if (error) { toast.error('فشل في الحذف'); return; }
    await supabase.from('public_video_views').delete().eq('teacher_id', user.id).eq('student_name', studentName);
    toast.success(`تم حذف جميع بيانات الطالب "${studentName}"`);
    fetchData();
  };

  const uniqueStudents = [...new Set(publicResults.map(r => r.student_name))];

  const exportPDF = async () => {
    const element = printRef.current;
    if (!element) { toast.error('لا يوجد محتوى للتصدير'); return; }

    toast.loading('جاري إنشاء التقرير...');

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgWidth = 190; // A4 width minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 277; // A4 height minus margins

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      let heightLeft = imgHeight;
      let position = 10;
      let page = 1;

      doc.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        doc.addPage();
        doc.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        page++;
      }

      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'performance-board.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      toast.dismiss();
      toast.success('تم تصدير التقرير بنجاح');
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.dismiss();
      toast.error('تعذر تصدير التقرير');
    }
  };

  return (
    <div className="space-y-6" ref={printRef}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          لوحة الأداء
        </h2>
        <Button onClick={exportPDF} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          تصدير PDF
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0">
              <Eye className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalViews}</p>
              <p className="text-muted-foreground text-xs">مشاهدات</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-gold-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.publicStudents}</p>
              <p className="text-muted-foreground text-xs">طالب مشارك</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-12 h-12 rounded-xl bg-success flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-success-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.avgScore}%</p>
              <p className="text-muted-foreground text-xs">متوسط الدرجات</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalQuizAttempts}</p>
              <p className="text-muted-foreground text-xs">محاولة اختبار</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students list with delete */}
      {uniqueStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              الطلاب المشاركون ({uniqueStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {uniqueStudents.map(name => {
                const studentResults = publicResults.filter(r => r.student_name === name);
                const avgPct = Math.round(studentResults.reduce((s, r) => s + (r.score / r.total_questions) * 100, 0) / studentResults.length);
                return (
                  <div key={name} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50">
                    <div>
                      <p className="font-semibold text-sm">{name}</p>
                      <p className="text-xs text-muted-foreground">{studentResults.length} اختبار · {avgPct}%</p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف بيانات الطالب</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف جميع نتائج ومشاهدات الطالب "{name}"؟ لا يمكن التراجع عن هذا الإجراء.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteStudentResults(name)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            نتائج الاختبارات العامة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {publicResults.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">لا توجد نتائج بعد. شارك رابط صفحتك العامة مع الطلاب!</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الطالب</TableHead>
                    <TableHead className="text-right">الاختبار</TableHead>
                    <TableHead className="text-center">الدرجة</TableHead>
                    <TableHead className="text-center">النسبة</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-center">حذف</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publicResults.map(r => {
                    const pct = Math.round((r.score / r.total_questions) * 100);
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.student_name}</TableCell>
                        <TableCell>{r.quiz_title}</TableCell>
                        <TableCell className="text-center">{r.score}/{r.total_questions}</TableCell>
                        <TableCell className="text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            pct >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            pct >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {pct}%
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString('ar-SA')}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" onClick={() => deleteResult(r.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceBoard;
