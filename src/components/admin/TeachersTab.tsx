import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Video, BarChart3 } from 'lucide-react';
import { Teacher, TeacherStats } from './types';
import { StatsCard } from './StatsCard';
import { AddTeacherDialog } from './AddTeacherDialog';
import { TeachersList } from './TeachersList';

interface TeachersTabProps {
  teachers: Teacher[];
  stats: Record<string, TeacherStats>;
  onAddTeacher: (email: string, name: string, password: string) => Promise<void>;
  onRemoveTeacher: (teacherId: string) => Promise<void>;
  onToggleSubscription: (teacherId: string, active: boolean) => Promise<void>;
  onCopyLink: (slug: string, id: string) => void;
  copiedId: string | null;
  getSubscriptionStatus: (teacher: Teacher) => { label: string; color: string };
}

export const TeachersTab = ({
  teachers,
  stats,
  onAddTeacher,
  onRemoveTeacher,
  onToggleSubscription,
  onCopyLink,
  copiedId,
  getSubscriptionStatus,
}: TeachersTabProps) => {
  const totalStats = {
    teachers: teachers.length,
    quizzes: Object.values(stats).reduce((s, t) => s + t.quizzes, 0),
    videos: Object.values(stats).reduce((s, t) => s + t.videos, 0),
    results: Object.values(stats).reduce((s, t) => s + t.publicResults, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard icon={Users} value={totalStats.teachers} label="معلم" />
        <StatsCard icon={BookOpen} value={totalStats.quizzes} label="اختبار" color="bg-emerald-500/10" />
        <StatsCard icon={Video} value={totalStats.videos} label="فيديو" color="bg-blue-500/10" />
        <StatsCard icon={BarChart3} value={totalStats.results} label="نتيجة اختبار" color="bg-amber-500/10" />
      </div>

      {/* Teachers list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5" />
            إدارة المعلمين
          </CardTitle>
          <AddTeacherDialog onAddTeacher={onAddTeacher} />
        </CardHeader>
        <CardContent>
          <TeachersList
            teachers={teachers}
            stats={stats}
            onRemoveTeacher={onRemoveTeacher}
            onToggleSubscription={onToggleSubscription}
            onCopyLink={onCopyLink}
            copiedId={copiedId}
            getSubscriptionStatus={getSubscriptionStatus}
          />
        </CardContent>
      </Card>
    </div>
  );
};
