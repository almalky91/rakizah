'use client';

import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import TeacherDashboard from '@/pages/teacher/TeacherDashboard';
import StudentPortal from '@/pages/student/StudentPortal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function DashboardPage() {
  const { user, loading, userRole } = useAuth();

  // Show loading UI while NextAuth session initializes
  if (loading) {
    return <LoadingSpinner fullScreen size="lg" text="جاري تحميل لوحة التحكم..." />;
  }

  if (!user) {
    // Redirect to login will be handled by middleware or layout
    return null;
  }

  switch (userRole) {
    case 'admin':
      return <AdminDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    default:
      return <StudentPortal />;
  }
}
