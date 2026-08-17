import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, Copy, Check, ExternalLink } from 'lucide-react';
import { Teacher, TeacherStats } from './types';

interface TeachersTableDesktopProps {
  teachers: Teacher[];
  stats: Record<string, TeacherStats>;
  onRemoveTeacher: (teacherId: string) => Promise<void>;
  onToggleSubscription: (teacherId: string, active: boolean) => Promise<void>;
  onCopyLink: (slug: string, id: string) => void;
  copiedId: string | null;
  getSubscriptionStatus: (teacher: Teacher) => { label: string; color: string };
}

export const TeachersTableDesktop = ({
  teachers,
  stats,
  onRemoveTeacher,
  onToggleSubscription,
  onCopyLink,
  copiedId,
  getSubscriptionStatus,
}: TeachersTableDesktopProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-right">المعلم</TableHead>
          <TableHead className="text-right">المدرسة</TableHead>
          <TableHead className="text-center">الحالة</TableHead>
          <TableHead className="text-center">اختبارات</TableHead>
          <TableHead className="text-center">فيديو</TableHead>
          <TableHead className="text-center">ألعاب</TableHead>
          <TableHead className="text-center">نتائج</TableHead>
          <TableHead className="text-center">الرابط</TableHead>
          <TableHead className="text-center">إجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teachers.map(teacher => {
          const teacherStats = stats[teacher.id] || { quizzes: 0, videos: 0, games: 0, publicResults: 0 };
          const subStatus = getSubscriptionStatus(teacher);
          
          return (
            <TableRow key={teacher.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                    {teacher.fullName?.charAt(0) || '؟'}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{teacher.fullName}</p>
                    <p className="text-xs text-muted-foreground" dir="ltr">{teacher.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm">{teacher.schoolName || '—'}</TableCell>
              <TableCell className="text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className={`text-xs font-medium ${subStatus.color}`}>{subStatus.label}</span>
                  <Button
                    variant={teacher.subscriptionActive ? "outline" : "default"}
                    size="sm"
                    className="text-xs h-6 px-2"
                    onClick={() => onToggleSubscription(teacher.id, !teacher.subscriptionActive)}
                  >
                    {teacher.subscriptionActive ? 'إيقاف' : 'تفعيل'}
                  </Button>
                </div>
              </TableCell>
              <TableCell className="text-center font-medium">{teacherStats.quizzes}</TableCell>
              <TableCell className="text-center font-medium">{teacherStats.videos}</TableCell>
              <TableCell className="text-center font-medium">{teacherStats.games}</TableCell>
              <TableCell className="text-center font-medium">{teacherStats.publicResults}</TableCell>
              <TableCell className="text-center">
                {teacher.publicSlug ? (
                  <div className="flex items-center justify-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onCopyLink(teacher.publicSlug!, teacher.id)} title="نسخ الرابط">
                      {copiedId === teacher.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" asChild title="فتح الصفحة">
                      <a href={`/p/${teacher.publicSlug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                ) : '—'}
              </TableCell>
              <TableCell className="text-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onRemoveTeacher(teacher.id)} 
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
