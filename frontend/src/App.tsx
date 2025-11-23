import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TelegramProvider, useTelegram } from './context/TelegramContext';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';

const AppContent: React.FC = () => {
  const { user } = useTelegram();
  const [role, setRole] = useState<string>('guest');

  useEffect(() => {
    // Mock role fetching based on user ID
    // In real app, fetch from backend
    if (user) {
      // For demo, we default to student. 
      // You can change this to 'teacher' or 'admin' to test other views.
      setRole('student');
    }
  }, [user]);

  if (!user) {
    return <div className="p-4 text-center">Loading Telegram Data...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={
        role === 'student' ? <Navigate to="/student" /> :
          role === 'teacher' ? <Navigate to="/teacher" /> :
            role === 'admin' ? <Navigate to="/admin" /> :
              <div className="p-4">Welcome Guest! Please register.</div>
      } />
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/teacher" element={<TeacherDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
};

function App() {
  return (
    <TelegramProvider>
      <Router>
        <AppContent />
      </Router>
    </TelegramProvider>
  );
}

export default App;
