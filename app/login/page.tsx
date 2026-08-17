'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheck, GraduationCap } from 'lucide-react';
import logoImg from '@/assets/logo.jpg';
import Image from 'next/image';
import { toast } from 'sonner';

const tabs = [
  { value: 'admin', label: 'مدير نظام', icon: ShieldCheck },
  { value: 'teacher', label: 'كادر تعليمي', icon: GraduationCap },
];

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('teacher');
  const { signIn, signOut } = useAuth();
  const { data: session } = useSession();
  const router = useRouter();

  const roleMap: Record<string, string> = {
    admin: 'admin',
    teacher: 'teacher',
  };

  const roleLabelMap: Record<string, string> = {
    admin: 'مدير نظام',
    teacher: 'كادر تعليمي',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Sign in using NextAuth
      await signIn(email, password);

      // Wait a moment for the session to be updated
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get the session to check the user's role
      const response = await fetch('/api/auth/session');
      const sessionData = await response.json();

      const userRole = sessionData?.user?.role || 'student';
      const expectedRole = roleMap[activeTab];

      // Validate that the user's role matches the selected tab
      if (userRole !== expectedRole) {
        await signOut();
        toast.error(`هذا الحساب ليس حساب ${roleLabelMap[activeTab]}. يرجى اختيار التبويب الصحيح.`);
        return;
      }

      toast.success('تم تسجيل الدخول بنجاح');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
      <Card className="w-full max-w-md glass">
        <CardHeader className="text-center pb-2">
          <Link href="/" className="inline-flex items-center gap-2 justify-center mb-4">
            <Image
              src={logoImg}
              alt="شعار المنصة"
              className="w-10 h-10 rounded-xl object-cover"
              placeholder="blur"
            />
            <span className="text-xl font-bold">منصتي التعليمية</span>
          </Link>
          <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6" dir="rtl">
            <TabsList className="grid w-full grid-cols-2 h-auto p-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex flex-col items-center gap-1 py-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="email@example.com" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" dir="ltr" />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? 'جاري التسجيل...' : 'تسجيل الدخول'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
