import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, fullName);
      toast.success('تم إنشاء الحساب بنجاح! يرجى تأكيد بريدك الإلكتروني');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'فشل إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
      <Card className="w-full max-w-md glass">
        <CardHeader className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 justify-center mb-4">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Star className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">منصتي التعليمية</span>
          </Link>
          <CardTitle className="text-2xl">إنشاء حساب جديد</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input id="name" value={fullName} onChange={e => setFullName(e.target.value)} required placeholder="أدخل اسمك الكامل" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="email@example.com" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="6 أحرف على الأقل" dir="ltr" />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? 'جاري الإنشاء...' : 'إنشاء حساب'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              لديك حساب بالفعل؟{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">تسجيل الدخول</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
