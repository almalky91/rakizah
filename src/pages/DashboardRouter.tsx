import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import TeacherDashboard from '@/pages/teacher/TeacherDashboard';
import StudentPortal from '@/pages/student/StudentPortal';

const DashboardRouter = () => {
  const { user, loading, userRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

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
