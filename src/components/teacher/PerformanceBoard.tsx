'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Eye, Trophy, Users, FileText, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { quizResultsApi, videoViewsApi } from '@/lib/api-client';

interface PublicResult {
  id: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  quizTitle: string;
  createdAt: string;
}

const PerformanceBoard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalViews: 0, publicStudents: 0, avgScore: 0, totalQuizAttempts: 0 });
  const [publicResults, setPublicResults] = useState<PublicResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch data from API endpoints in parallel
      const [videoViewsData, publicResultsData] = await Promise.all([
        videoViewsApi.getPublicByTeacher(user.id),
        quizResultsApi.getPublicByTeacher(user.id),
      ]);

      const totalViews = videoViewsData?.length || 0;
      const publicData = publicResultsData || [];

      // Calculate statistics
      const uniquePublicStudents = new Set(publicData.map((r: any) => r.studentName));
      const avgScore = publicData.length
        ? Math.round(
            publicData.reduce((sum: number, r: any) => sum + (r.score / r.totalQuestions) * 100, 0) /
              publicData.length
          )
        : 0;

      setStats({
        totalViews,
        publicStudents: uniquePublicStudents.size,
        avgScore,
        totalQuizAttempts: publicData.length,
      });

      // Map results with quiz titles already included from API
      setPublicResults(
        publicData.map((r: any) => ({
          id: r.id,
          studentName: r.studentName,
          score: r.score,
          totalQuestions: r.totalQuestions,
          quizTitle: r.quizTitle || 'اختبار محذوف',
          createdAt: r.createdAt,
        }))
      );
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const deleteResult = async (id: string) => {
    try {
      await quizResultsApi.deletePublic(id);
      toast.success('تم حذف النتيجة');
      fetchData();
    } catch (error) {
      console.error('Error deleting result:', error);
      toast.error('فشل في الحذف');
    }
  };

  const deleteStudentResults = async (studentName: string) => {
    if (!user) return;

    try {
      await quizResultsApi.deleteStudentData(user.id, studentName);
      toast.success(`تم حذف جميع بيانات الطالب "${studentName}"`);
      fetchData();
    } catch (error) {
      console.error('Error deleting student data:', error);
      toast.error('فشل في الحذف');
    }
  };

  const uniqueStudents = [...new Set(publicResults.map((r) => r.studentName))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          لوحة الأداء
        </h2>
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
              {uniqueStudents.map((name) => {
                const studentResults = publicResults.filter((r) => r.studentName === name);
                const avgPct = Math.round(
                  studentResults.reduce((s, r) => s + (r.score / r.totalQuestions) * 100, 0) /
                    studentResults.length
                );
                return (
                  <div
                    key={name}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50"
                  >
                    <div>
                      <p className="font-semibold text-sm">{name}</p>
                      <p className="text-xs text-muted-foreground">
                        {studentResults.length} اختبار · {avgPct}%
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف بيانات الطالب</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف جميع نتائج ومشاهدات الطالب "{name}"؟ لا يمكن
                            التراجع عن هذا الإجراء.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteStudentResults(name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
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
            <p className="text-center py-8 text-muted-foreground">
              لا توجد نتائج بعد. شارك رابط صفحتك العامة مع الطلاب!
            </p>
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
                  {publicResults.map((r) => {
                    const pct = Math.round((r.score / r.totalQuestions) * 100);
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.studentName}</TableCell>
                        <TableCell>{r.quizTitle}</TableCell>
                        <TableCell className="text-center">
                          {r.score}/{r.totalQuestions}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              pct >= 80
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : pct >= 50
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            {pct}%
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(r.createdAt).toLocaleDateString('ar-SA')}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteResult(r.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                          >
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
