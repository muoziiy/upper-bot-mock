import React from 'react';
import { BrowserRouter as Router, useRoutes, Navigate } from 'react-router-dom';
import { TelegramProvider, useTelegram } from './context/TelegramContext';
import { AppDataProvider, useAppData } from './context/AppDataContext';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Journey from './pages/Journey';

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
      {element}
    </div>
  );
};

export default App;
