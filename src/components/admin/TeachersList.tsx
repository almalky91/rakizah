'use client';

import { Users } from 'lucide-react';
import { Teacher, TeacherStats } from './types';
import { TeacherCardMobile } from './TeacherCardMobile';
import { TeachersTableDesktop } from './TeachersTableDesktop';

interface TeachersListProps {
  teachers: Teacher[];
  stats: Record<string, TeacherStats>;
  onRemoveTeacher: (teacherId: string) => Promise<void>;
  onToggleSubscription: (teacherId: string, active: boolean) => Promise<void>;
  onCopyLink: (slug: string, id: string) => void;
  copiedId: string | null;
  getSubscriptionStatus: (teacher: Teacher) => { label: string; color: string };
}

export const TeachersList = ({
  teachers,
  stats,
  onRemoveTeacher,
  onToggleSubscription,
  onCopyLink,
  copiedId,
  getSubscriptionStatus,
}: TeachersListProps) => {
  if (teachers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p>لا يوجد معلمون بعد</p>
        <p className="text-sm">اضغط على "إضافة معلم" لإضافة أول معلم</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Cards view */}
      <div className="sm:hidden space-y-3">
        {teachers.map(teacher => (
          <TeacherCardMobile
            key={teacher.id}
            teacher={teacher}
            stats={stats[teacher.id] || { quizzes: 0, videos: 0, games: 0, publicResults: 0 }}
            onRemoveTeacher={onRemoveTeacher}
            onToggleSubscription={onToggleSubscription}
            onCopyLink={onCopyLink}
            copiedId={copiedId}
            getSubscriptionStatus={getSubscriptionStatus}
          />
        ))}
      </div>

      {/* Desktop: Table view */}
      <div className="hidden sm:block">
        <TeachersTableDesktop
          teachers={teachers}
          stats={stats}
          onRemoveTeacher={onRemoveTeacher}
          onToggleSubscription={onToggleSubscription}
          onCopyLink={onCopyLink}
          copiedId={copiedId}
          getSubscriptionStatus={getSubscriptionStatus}
        />
      </div>
    </>
  );
};
