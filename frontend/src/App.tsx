import React, { Suspense } from 'react';
import { BrowserRouter as Router, useRoutes, Navigate } from 'react-router-dom';
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
const AdminAdmins = React.lazy(() => import('./pages/admin/AdminAdmins'));
const AdminActions = React.lazy(() => import('./pages/admin/AdminActions'));
const AdminSubjects = React.lazy(() => import('./pages/admin/AdminSubjects')); // New
const Onboarding = React.lazy(() => import('./pages/Onboarding')); // New
const GuestDashboard = React.lazy(() => import('./pages/GuestDashboard')); // New
const WaitingPage = React.lazy(() => import('./pages/WaitingPage')); // New
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
  const { user } = useTelegram();
  const { loading, dashboardData } = useAppData();

  const role = dashboardData?.user.role || 'new_user'; // Default to new_user if not set

  const getHomeRoute = () => {
    switch (role) {
      case 'teacher': return '/teacher';
      case 'parent': return '/parent';
      case 'admin':
      case 'super_admin': return '/admin';
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
    { path: "/admin/admins", element: <AdminAdmins /> },
    { path: "/admin/actions", element: <AdminActions /> },
    { path: "/admin/subjects", element: <AdminSubjects /> }, // New
    { path: "/admin/profile", element: <Profile /> },
  ]);

  if (!user || loading) {
    return <div className="flex min-h-screen items-center justify-center bg-tg-secondary text-tg-text">Loading...</div>;
  }

  return (
    <div className="w-full">
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-tg-secondary text-tg-text">Loading...</div>}>
        {element}
      </Suspense>
      <BottomNav />
    </div>
  );
};

export default App;
