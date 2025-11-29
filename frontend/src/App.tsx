import React, { Suspense } from 'react';
import { BrowserRouter as Router, useRoutes, Navigate, useLocation } from 'react-router-dom';
import { TelegramProvider, useTelegram } from './context/TelegramContext';
import { AppDataProvider, useAppData } from './context/AppDataContext';
import BottomNav from './components/BottomNav';
import './i18n'; // Initialize i18n

// Lazy load pages
const StudentDashboard = React.lazy(() => import('./pages/StudentDashboard'));
const TeacherDashboard = React.lazy(() => import('./pages/TeacherDashboard'));
const ParentDashboard = React.lazy(() => import('./pages/ParentDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminStats = React.lazy(() => import('./pages/admin/AdminStats'));
const AdminGroups = React.lazy(() => import('./pages/admin/AdminGroups'));
const AdminTeachers = React.lazy(() => import('./pages/admin/AdminTeachers'));
const AdminActions = React.lazy(() => import('./pages/admin/AdminActions'));
const AdminSubjects = React.lazy(() => import('./pages/admin/AdminSubjects'));
const AdminStudents = React.lazy(() => import('./pages/admin/AdminStudents'));
const AdminStudentDetails = React.lazy(() => import('./pages/admin/AdminStudentDetails'));
const AdminProfile = React.lazy(() => import('./pages/admin/AdminProfile'));
const AdminBroadcast = React.lazy(() => import('./pages/admin/AdminBroadcast'));
const AdminNotifications = React.lazy(() => import('./pages/admin/AdminNotifications'));
const AdminBotSettings = React.lazy(() => import('./pages/admin/AdminBotSettings'));
const AdminCenterSettings = React.lazy(() => import('./pages/admin/AdminCenterSettings'));
const AdminExportData = React.lazy(() => import('./pages/admin/AdminExportData'));
const AdminAdmins = React.lazy(() => import('./pages/admin/AdminAdmins'));
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const GuestDashboard = React.lazy(() => import('./pages/GuestDashboard'));
const WaitingPage = React.lazy(() => import('./pages/WaitingPage'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Exams = React.lazy(() => import('./pages/Exams'));
const ParentExams = React.lazy(() => import('./pages/ParentExams'));
const Lessons = React.lazy(() => import('./pages/Lessons'));
const Groups = React.lazy(() => import('./pages/Groups'));
const TeacherProfile = React.lazy(() => import('./pages/TeacherProfile'));
const ParentProfile = React.lazy(() => import('./pages/ParentProfile'));

function App() {
  return (
    <TelegramProvider>
      <AppDataProvider>
        <Router>
          <AppContent />
        </Router>
      </AppDataProvider>
    </TelegramProvider>
  );
}

const AppContent: React.FC = () => {
  const { } = useTelegram();
  const { loading, dashboardData } = useAppData();
  const location = useLocation();

  const role = dashboardData?.user.role || 'new_user'; // Default to new_user if not set

  // Routes where BottomNav should be hidden
  const hideNavRoutes = ['/onboarding', '/guest', '/waiting'];
  const shouldShowNav = !hideNavRoutes.includes(location.pathname);

  const getHomeRoute = () => {
    switch (role) {
      case 'teacher': return '/teacher';
      case 'parent': return '/parent';
      case 'admin':
      case 'super_admin': return '/admin/stats';
      case 'guest': return '/guest';
      case 'waiting_user':
      case 'waiting_staff': return '/waiting';
      case 'new_user': return '/onboarding';
      default: return '/student'; // Fallback for 'student'
    }
  };

  const element = useRoutes([
    { path: "/", element: <Navigate to={getHomeRoute()} replace /> },

    // Onboarding & Guest Routes
    { path: "/onboarding", element: <Onboarding /> },
    { path: "/guest", element: <GuestDashboard /> },
    { path: "/waiting", element: <WaitingPage /> },

    // Student Routes
    { path: "/student", element: <StudentDashboard /> },
    { path: "/student/journey", element: <Navigate to="/student" replace /> }, // Deprecated
    { path: "/student/exams", element: <Exams /> },
    { path: "/student/leaderboard", element: <Leaderboard /> },
    { path: "/student/profile", element: <Profile /> },

    // Teacher Routes
    { path: "/teacher", element: <TeacherDashboard /> },
    { path: "/teacher/groups", element: <Groups /> },
    { path: "/teacher/lessons", element: <Lessons /> },
    { path: "/teacher/profile", element: <TeacherProfile /> },

    // Parent Routes
    { path: "/parent", element: <ParentDashboard /> },
    { path: "/parent/exams", element: <ParentExams /> },
    { path: "/parent/profile", element: <ParentProfile /> },

    // Admin Routes
    { path: "/admin", element: <AdminDashboard /> },
    { path: "/admin/stats", element: <AdminStats /> },
    { path: "/admin/groups", element: <AdminGroups /> },
    { path: "/admin/teachers", element: <AdminTeachers /> },
    { path: "/admin/actions", element: <AdminActions /> },
    { path: "/admin/subjects", element: <AdminSubjects /> },
    { path: "/admin/students", element: <AdminStudents /> },
    { path: "/admin/students/:id", element: <AdminStudentDetails /> }, // New Page
    { path: "/admin/profile", element: <AdminProfile /> },
    { path: "/admin/broadcast", element: <AdminBroadcast /> },
    { path: "/admin/notifications", element: <AdminNotifications /> },
    { path: "/admin/settings", element: <AdminBotSettings /> },
    { path: "/admin/center-settings", element: <AdminCenterSettings /> },
    { path: "/admin/export", element: <AdminExportData /> },
    { path: "/admin/admins", element: <AdminAdmins /> },
  ]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-tg-secondary text-tg-text">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-tg-secondary text-tg-text">
      <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
        {element}
      </Suspense>
      {shouldShowNav && <BottomNav />}
    </div>
  );
};

export default App;
