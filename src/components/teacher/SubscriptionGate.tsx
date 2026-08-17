'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Lock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SubscriptionGate = ({ children, teacher }: { children: React.ReactNode, teacher: any | null }) => {
  const { signOut } = useAuth();

  if (!teacher || Object.keys(teacher).length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const now = new Date();

  const trialEndsAt = teacher.trialEndsAt ? new Date(teacher.trialEndsAt) : null;
  const subscriptionEndsAt = teacher.subscriptionEndsAt ? new Date(teacher.subscriptionEndsAt) : null;

  const trialActive = Boolean(trialEndsAt && now < trialEndsAt);
  const subscriptionValid = Boolean(
    teacher.subscriptionActive &&
      subscriptionEndsAt &&
      now < subscriptionEndsAt
  );

  const hasAccess = subscriptionValid || trialActive;

  if (hasAccess) {
    return <>{children}</>;
  }

  let expiredText = '';
  if (subscriptionEndsAt && now >= subscriptionEndsAt) {
    expiredText = `انتهى الاشتراك السنوي في ${subscriptionEndsAt.toLocaleDateString('ar-SA')}`;
  } else if (trialEndsAt) {
    expiredText = `انتهت الفترة التجريبية في ${trialEndsAt.toLocaleDateString('ar-SA')}`;
  } else {
    expiredText = 'لم يتم تعيين فترة تجريبية';
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-8 pb-6 space-y-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">الاشتراك غير مفعّل</h2>
            <p className="text-muted-foreground text-sm">{expiredText}</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>يتم التفعيل من قبل مدير النظام</span>
            </div>
            <p className="text-xs text-muted-foreground">
              تواصل مع إدارة المنصة لتفعيل اشتراكك والوصول إلى لوحة التحكم
            </p>
          </div>
          <Button variant="outline" onClick={signOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionGate;
