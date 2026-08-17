'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Clock } from 'lucide-react';
import { toast } from 'sonner';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!fullName || fullName.length < 2) {
      toast.error('الاسم الكامل مطلوب (حرفين على الأقل)');
      return;
    }
    if (password.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error response
        if (data.error) {
          throw new Error(data.error);
        }
        if (data.details) {
          // Handle validation errors
          const errorMessage = data.details.map((err: any) => err.message).join(', ');
          throw new Error(errorMessage);
        }
        throw new Error('فشل إنشاء الحساب');
      }

      // Success
      toast.success('تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن');
      router.push('/login');
    } catch (err: any) {
      const message = err.message || 'فشل إنشاء الحساب';
      
      // Handle specific error messages
      if (message.includes('البريد الإلكتروني مستخدم') || 
          message.includes('already registered') || 
          message.includes('Duplicate entry')) {
        toast.error('هذا البريد الإلكتروني مسجل مسبقاً');
      } else if (message.includes('Invalid input')) {
        toast.error('البيانات المدخلة غير صحيحة');
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
      <Card className="w-full max-w-md glass">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 justify-center mb-4">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Star className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">منصتي التعليمية</span>
          </Link>
          <CardTitle className="text-2xl">تسجيل حساب معلم جديد</CardTitle>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>فترة تجريبية مجانية ليوم واحد</span>
          </div>
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
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="8 أحرف على الأقل" dir="ltr" />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? 'جاري الإنشاء...' : 'إنشاء حساب'}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="text-primary font-medium hover:underline">تسجيل الدخول</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
