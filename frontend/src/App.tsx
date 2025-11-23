import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TelegramProvider, useTelegram } from './context/TelegramContext';
import { AppDataProvider } from './context/AppDataContext';
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
        <AppContent />
      </AppDataProvider>
    </TelegramProvider>
  );
}

const AppContent: React.FC = () => {
  const { user } = useTelegram();

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center bg-tg-secondary text-tg-text">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/student" replace />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/journey" element={<Journey />} />
        <Route path="/student/leaderboard" element={<Leaderboard />} />
        <Route path="/student/profile" element={<Profile />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
