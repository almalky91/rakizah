import { Button } from '@/components/ui/button';
import { BookOpen, Video, Gamepad2, BarChart3, Trash2, Copy, Check, ExternalLink } from 'lucide-react';
import { Teacher, TeacherStats } from './types';

interface TeacherCardMobileProps {
  teacher: Teacher;
  stats: TeacherStats;
  onRemoveTeacher: (teacherId: string) => Promise<void>;
  onToggleSubscription: (teacherId: string, active: boolean) => Promise<void>;
  onCopyLink: (slug: string, id: string) => void;
  copiedId: string | null;
  getSubscriptionStatus: (teacher: Teacher) => { label: string; color: string };
}

export const TeacherCardMobile = ({
  teacher,
  stats,
  onRemoveTeacher,
  onToggleSubscription,
  onCopyLink,
  copiedId,
  getSubscriptionStatus,
}: TeacherCardMobileProps) => {
  const status = getSubscriptionStatus(teacher);

  return (
    <div className="p-4 rounded-xl bg-muted/50 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            {teacher.fullName?.charAt(0) || '؟'}
          </div>
          <div>
            <p className="font-semibold text-sm">{teacher.fullName}</p>
            <p className="text-xs text-muted-foreground" dir="ltr">{teacher.email}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onRemoveTeacher(teacher.id)} 
          className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      
      {teacher.schoolName && (
        <p className="text-xs text-muted-foreground">{teacher.schoolName}</p>
      )}
      
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{stats.quizzes}</span>
        <span className="flex items-center gap-1"><Video className="w-3 h-3" />{stats.videos}</span>
        <span className="flex items-center gap-1"><Gamepad2 className="w-3 h-3" />{stats.games}</span>
        <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />{stats.publicResults} نتيجة</span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${status.color}`}>
            {status.label}
          </span>
          <Button
            variant={teacher.subscriptionActive ? "outline" : "default"}
            size="sm"
            className="text-xs h-7"
            onClick={() => onToggleSubscription(teacher.id, !teacher.subscriptionActive)}
          >
            {teacher.subscriptionActive ? 'إيقاف' : 'تفعيل'}
          </Button>
        </div>
        <div className="flex items-center gap-1">
          {teacher.publicSlug && (
            <>
              <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => onCopyLink(teacher.publicSlug!, teacher.id)}>
                {copiedId === teacher.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-7" asChild>
                <a href={`/p/${teacher.publicSlug}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
