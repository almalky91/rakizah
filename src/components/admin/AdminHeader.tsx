import { Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
  onSignOut: () => void;
}

export const AdminHeader = ({ onSignOut }: AdminHeaderProps) => {
  return (
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
        <Button variant="ghost" onClick={onSignOut} className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
          <LogOut className="w-4 h-4 ml-2" />
          <span className="hidden sm:inline">تسجيل الخروج</span>
        </Button>
      </div>
    </header>
  );
};
