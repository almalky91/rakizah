import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, Trash2, LogOut, Star, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Teacher {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchTeachers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .in('id', (
        await supabase.from('user_roles').select('user_id').eq('role', 'teacher')
      ).data?.map(r => r.user_id) || []);
    setTeachers(data || []);
  };

  useEffect(() => { fetchTeachers(); }, []);

  const addTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create user via edge function
      const { data, error } = await supabase.functions.invoke('create-teacher', {
        body: { email: newEmail, password: newPassword, fullName: newName },
      });
      if (error) throw error;
      toast.success('تم إضافة المعلم بنجاح');
      setNewEmail('');
      setNewName('');
      setNewPassword('');
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
      fetchTeachers();
    } catch {
      toast.error('فشل في الإزالة');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary border-b border-border/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
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
            تسجيل الخروج
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
                <Users className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <p className="text-3xl font-bold">{teachers.length}</p>
                <p className="text-muted-foreground text-sm">معلم مسجل</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teachers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              إدارة المعلمين
            </CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="hero" size="sm">
                  <Plus className="w-4 h-4 ml-1" />
                  إضافة معلم
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إضافة معلم جديد</DialogTitle>
                </DialogHeader>
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
              <div className="space-y-3">
                {teachers.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                        {t.full_name?.charAt(0) || '؟'}
                      </div>
                      <div>
                        <p className="font-semibold">{t.full_name}</p>
                        <p className="text-sm text-muted-foreground" dir="ltr">{t.email}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeTeacher(t.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
