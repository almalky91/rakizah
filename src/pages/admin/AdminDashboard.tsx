import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, Trash2, LogOut, Shield, BookOpen, Video, Gamepad2, ExternalLink, Copy, Check, BarChart3, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Teacher {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  public_slug: string | null;
  school_name: string | null;
  trial_ends_at: string | null;
  subscription_active: boolean;
}

interface TeacherStats {
  quizzes: number;
  videos: number;
  games: number;
  publicResults: number;
}

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [stats, setStats] = useState<Record<string, TeacherStats>>({});
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const fetchTeachers = async () => {
    const { data: roleData } = await supabase.from('user_roles').select('user_id').eq('role', 'teacher');
    const teacherIds = roleData?.map(r => r.user_id) || [];
    if (teacherIds.length === 0) { setTeachers([]); return; }

    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at, public_slug, school_name, trial_ends_at, subscription_active')
      .in('id', teacherIds);
    setTeachers((data as any) || []);

    // Fetch stats for each teacher
    const [quizzesRes, videosRes, gamesRes, resultsRes] = await Promise.all([
      supabase.from('quizzes').select('teacher_id').in('teacher_id', teacherIds),
      supabase.from('videos').select('teacher_id').in('teacher_id', teacherIds),
      supabase.from('games').select('teacher_id').in('teacher_id', teacherIds),
      supabase.from('public_quiz_results').select('teacher_id').in('teacher_id', teacherIds),
    ]);

    const statsMap: Record<string, TeacherStats> = {};
    teacherIds.forEach(id => {
      statsMap[id] = {
        quizzes: (quizzesRes.data || []).filter((q: any) => q.teacher_id === id).length,
        videos: (videosRes.data || []).filter((v: any) => v.teacher_id === id).length,
        games: (gamesRes.data || []).filter((g: any) => g.teacher_id === id).length,
        publicResults: (resultsRes.data || []).filter((r: any) => r.teacher_id === id).length,
      };
    });
    setStats(statsMap);
  };

  useEffect(() => { fetchTeachers(); }, []);

  const addTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-teacher', {
        body: { email: newEmail, password: newPassword, fullName: newName },
      });
      if (error) throw error;
      toast.success('تم إضافة المعلم بنجاح');
      setNewEmail(''); setNewName(''); setNewPassword('');
      setOpen(false);
      fetchTeachers();
    } catch (err: any) {
      toast.error(err.message || 'فشل في إضافة المعلم');
    } finally {
      setLoading(false);
    }
  };

  const removeTeacher = async (teacherId: string) => {
    try {
      await supabase.from('user_roles').delete().eq('user_id', teacherId).eq('role', 'teacher');
      toast.success('تم إزالة صلاحيات المعلم');
      setSelectedTeacher(null);
      fetchTeachers();
    } catch {
      toast.error('فشل في الإزالة');
    }
  };

  const copyLink = (slug: string, id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/p/${slug}`);
    setCopiedId(id);
    toast.success('تم نسخ الرابط');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSubscription = async (teacherId: string, active: boolean) => {
    try {
      const { error } = await supabase.functions.invoke('toggle-teacher-subscription', {
        body: { teacherId, active },
      });
      if (error) throw error;
      toast.success(active ? 'تم تفعيل الاشتراك' : 'تم إيقاف الاشتراك');
      fetchTeachers();
    } catch {
      toast.error('فشل في تغيير حالة الاشتراك');
    }
  };

  const getSubscriptionStatus = (t: Teacher) => {
    if (t.subscription_active) return { label: 'مفعّل', color: 'text-emerald-500' };
    const trialEnd = t.trial_ends_at ? new Date(t.trial_ends_at) : null;
    if (trialEnd && new Date() < trialEnd) return { label: 'تجريبي', color: 'text-amber-500' };
    return { label: 'متوقف', color: 'text-destructive' };
  };

  const totalStats = {
    teachers: teachers.length,
    quizzes: Object.values(stats).reduce((s, t) => s + t.quizzes, 0),
    videos: Object.values(stats).reduce((s, t) => s + t.videos, 0),
    results: Object.values(stats).reduce((s, t) => s + t.publicResults, 0),
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary border-b border-border/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">لوحة تحكم المدير</h1>
              <p className="text-sm text-primary-foreground/60">إدارة المعلمين والمنصة</p>
            </div>
          </div>
          <Button variant="ghost" onClick={signOut} className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
            <LogOut className="w-4 h-4 ml-2" />
            <span className="hidden sm:inline">تسجيل الخروج</span>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStats.teachers}</p>
                <p className="text-muted-foreground text-xs">معلم</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStats.quizzes}</p>
                <p className="text-muted-foreground text-xs">اختبار</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <Video className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStats.videos}</p>
                <p className="text-muted-foreground text-xs">فيديو</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStats.results}</p>
                <p className="text-muted-foreground text-xs">نتيجة اختبار</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teachers list */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5" />
              إدارة المعلمين
            </CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" size="sm"><Plus className="w-4 h-4 ml-1" />إضافة معلم</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>إضافة معلم جديد</DialogTitle></DialogHeader>
                <form onSubmit={addTeacher} className="space-y-4">
                  <div className="space-y-2">
                    <Label>الاسم الكامل</Label>
                    <Input value={newName} onChange={e => setNewName(e.target.value)} required placeholder="اسم المعلم" />
                  </div>
                  <div className="space-y-2">
                    <Label>البريد الإلكتروني</Label>
                    <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required placeholder="email@example.com" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label>كلمة المرور</Label>
                    <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="كلمة المرور" dir="ltr" />
                  </div>
                  <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                    {loading ? 'جاري الإضافة...' : 'إضافة المعلم'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {teachers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>لا يوجد معلمون بعد</p>
                <p className="text-sm">اضغط على "إضافة معلم" لإضافة أول معلم</p>
              </div>
            ) : (
              <>
                {/* Mobile: Cards view */}
                <div className="sm:hidden space-y-3">
                  {teachers.map(t => {
                    const s = stats[t.id] || { quizzes: 0, videos: 0, games: 0, publicResults: 0 };
                    return (
                      <div key={t.id} className="p-4 rounded-xl bg-muted/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                              {t.full_name?.charAt(0) || '؟'}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{t.full_name}</p>
                              <p className="text-xs text-muted-foreground" dir="ltr">{t.email}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeTeacher(t.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        {t.school_name && (
                          <p className="text-xs text-muted-foreground">{t.school_name}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{s.quizzes}</span>
                          <span className="flex items-center gap-1"><Video className="w-3 h-3" />{s.videos}</span>
                          <span className="flex items-center gap-1"><Gamepad2 className="w-3 h-3" />{s.games}</span>
                          <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />{s.publicResults} نتيجة</span>
                        </div>
                        {t.public_slug && (
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="text-xs flex-1" onClick={() => copyLink(t.public_slug!, t.id)}>
                              {copiedId === t.id ? <Check className="w-3 h-3 ml-1" /> : <Copy className="w-3 h-3 ml-1" />}
                              {copiedId === t.id ? 'تم النسخ' : 'نسخ الرابط'}
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs" asChild>
                              <a href={`/p/${t.public_slug}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Desktop: Table view */}
                <div className="hidden sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">المعلم</TableHead>
                        <TableHead className="text-right">المدرسة</TableHead>
                        <TableHead className="text-center">اختبارات</TableHead>
                        <TableHead className="text-center">فيديو</TableHead>
                        <TableHead className="text-center">ألعاب</TableHead>
                        <TableHead className="text-center">نتائج</TableHead>
                        <TableHead className="text-center">الرابط</TableHead>
                        <TableHead className="text-center">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teachers.map(t => {
                        const s = stats[t.id] || { quizzes: 0, videos: 0, games: 0, publicResults: 0 };
                        return (
                          <TableRow key={t.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                                  {t.full_name?.charAt(0) || '؟'}
                                </div>
                                <div>
                                  <p className="font-semibold text-sm">{t.full_name}</p>
                                  <p className="text-xs text-muted-foreground" dir="ltr">{t.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{t.school_name || '—'}</TableCell>
                            <TableCell className="text-center font-medium">{s.quizzes}</TableCell>
                            <TableCell className="text-center font-medium">{s.videos}</TableCell>
                            <TableCell className="text-center font-medium">{s.games}</TableCell>
                            <TableCell className="text-center font-medium">{s.publicResults}</TableCell>
                            <TableCell className="text-center">
                              {t.public_slug ? (
                                <div className="flex items-center justify-center gap-1">
                                  <Button variant="ghost" size="icon" onClick={() => copyLink(t.public_slug!, t.id)} title="نسخ الرابط">
                                    {copiedId === t.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                  </Button>
                                  <Button variant="ghost" size="icon" asChild title="فتح الصفحة">
                                    <a href={`/p/${t.public_slug}`} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  </Button>
                                </div>
                              ) : '—'}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button variant="ghost" size="icon" onClick={() => removeTeacher(t.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
