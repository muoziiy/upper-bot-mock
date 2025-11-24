import React, { Suspense } from 'react';
import { BrowserRouter as Router, useRoutes, Navigate } from 'react-router-dom';
import { TelegramProvider, useTelegram } from './context/TelegramContext';
import { AppDataProvider, useAppData } from './context/AppDataContext';
import BottomNav from './components/BottomNav';
import './i18n'; // Initialize i18n

// Lazy load pages
const StudentDashboard = React.lazy(() => import('./pages/StudentDashboard'));
const TeacherDashboard = React.lazy(() => import('./pages/TeacherDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Journey = React.lazy(() => import('./pages/Journey'));
const QuickActions = React.lazy(() => import('./pages/QuickActions'));
const Groups = React.lazy(() => import('./pages/Groups'));

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

  const role = dashboardData?.user.role || 'student';

  const getHomeRoute = () => {
    switch (role) {
      case 'teacher': return '/teacher';
      case 'admin':
      case 'super_admin': return '/admin';
      default: return '/student';
    }
  };

  const element = useRoutes([
    { path: "/", element: <Navigate to={getHomeRoute()} replace /> },

    // Student Routes
    { path: "/student", element: <StudentDashboard /> },
    { path: "/student/journey", element: <Journey /> },
    { path: "/student/leaderboard", element: <Leaderboard /> },
    { path: "/student/profile", element: <Profile /> },

    // Teacher Routes
    { path: "/teacher", element: <TeacherDashboard /> },
    { path: "/teacher/groups", element: <Groups /> },
    { path: "/teacher/actions", element: <QuickActions /> },
    { path: "/teacher/profile", element: <Profile /> },

    // Admin Routes
    { path: "/admin", element: <AdminDashboard /> },
    { path: "/admin/actions", element: <QuickActions /> },
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
