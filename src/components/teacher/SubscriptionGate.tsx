import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Lock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubscriptionStatus {
  trialEndsAt: Date | null;
  subscriptionActive: boolean;
  subscriptionEndsAt: Date | null;
  loading: boolean;
}

const SubscriptionGate = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    trialEndsAt: null,
    subscriptionActive: false,
    subscriptionEndsAt: null,
    loading: true,
  });

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('profiles')
      .select('trial_ends_at, subscription_active, subscription_ends_at')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setStatus({
          trialEndsAt: data?.trial_ends_at ? new Date(data.trial_ends_at) : null,
          subscriptionActive: (data as any)?.subscription_active || false,
          subscriptionEndsAt: (data as any)?.subscription_ends_at ? new Date((data as any).subscription_ends_at) : null,
          loading: false,
        });
      });
  }, [user?.id]);

  if (status.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const now = new Date();
  const trialActive = status.trialEndsAt && now < status.trialEndsAt;
  
  // Check if subscription is active AND not expired
  const subscriptionValid = status.subscriptionActive && 
    (!status.subscriptionEndsAt || now < status.subscriptionEndsAt);
  
  const hasAccess = subscriptionValid || trialActive;

  if (hasAccess) {
    return <>{children}</>;
  }

  // Determine message
  let expiredText = '';
  if (status.subscriptionEndsAt && now >= status.subscriptionEndsAt) {
    expiredText = `انتهى الاشتراك السنوي في ${status.subscriptionEndsAt.toLocaleDateString('ar-SA')}`;
  } else if (status.trialEndsAt) {
    expiredText = `انتهت الفترة التجريبية في ${status.trialEndsAt.toLocaleDateString('ar-SA')}`;
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
