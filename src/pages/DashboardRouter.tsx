import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import TeacherDashboard from '@/pages/teacher/TeacherDashboard';
import StudentPortal from '@/pages/student/StudentPortal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const DashboardRouter = () => {
  const { user, loading, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  // Show loading UI while NextAuth session initializes
  if (loading) {
    return <LoadingSpinner fullScreen size="lg" text="جاري تحميل البيانات..." />;
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  switch (userRole) {
    case 'admin':
      return <AdminDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    default:
      return <StudentPortal />;
  }
};

export default DashboardRouter;
