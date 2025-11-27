import React, { Suspense } from 'react';
import { BrowserRouter as Router, useRoutes, Navigate, useLocation } from 'react-router-dom';
import { TelegramProvider, useTelegram } from './context/TelegramContext';
import { AppDataProvider, useAppData } from './context/AppDataContext';
import BottomNav from './components/BottomNav';
import './i18n'; // Initialize i18n

// Lazy load pages
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
  { path: "/admin/admins", element: <AdminAdmins /> },
  { path: "/admin/actions", element: <AdminActions /> },
  { path: "/admin/subjects", element: <AdminSubjects /> }, // New
  { path: "/admin/profile", element: <Profile /> },
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
