import React, { Suspense } from 'react';
import { BrowserRouter as Router, useRoutes, Navigate } from 'react-router-dom';
import { TelegramProvider, useTelegram } from './context/TelegramContext';
import { AppDataProvider, useAppData } from './context/AppDataContext';
import BottomNav from './components/BottomNav';

// Lazy load pages
const StudentDashboard = React.lazy(() => import('./pages/StudentDashboard'));
const TeacherDashboard = React.lazy(() => import('./pages/TeacherDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Journey = React.lazy(() => import('./pages/Journey'));

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
  const { loading } = useAppData();

  const element = useRoutes([
    { path: "/", element: <Navigate to="/student" replace /> },
    { path: "/student", element: <StudentDashboard /> },
    { path: "/student/journey", element: <Journey /> },
    { path: "/student/leaderboard", element: <Leaderboard /> },
    { path: "/student/profile", element: <Profile /> },
    { path: "/teacher", element: <TeacherDashboard /> },
    { path: "/admin", element: <AdminDashboard /> },
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
