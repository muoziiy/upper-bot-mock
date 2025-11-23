import React from 'react';
import { BrowserRouter as Router, useRoutes, Navigate, useLocation } from 'react-router-dom';
import { TelegramProvider, useTelegram } from './context/TelegramContext';
import { AppDataProvider } from './context/AppDataContext';
import { AnimatePresence, motion } from 'framer-motion';
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

const pageVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0
  }),
  animate: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0
  })
};

const AppContent: React.FC = () => {
  const { user } = useTelegram();
  const location = useLocation();

  // Tab order for direction calculation
  const tabOrder = {
    '/student': 0,
    '/student/journey': 1,
    '/student/leaderboard': 2,
    '/student/profile': 3
  };

  const [direction, setDirection] = React.useState(0);
  const [prevPath, setPrevPath] = React.useState(location.pathname);

  React.useEffect(() => {
    const currentIndex = tabOrder[location.pathname as keyof typeof tabOrder] ?? 0;
    const previousIndex = tabOrder[prevPath as keyof typeof tabOrder] ?? 0;
    setDirection(currentIndex > previousIndex ? 1 : -1);
    setPrevPath(location.pathname);
  }, [location.pathname]);

  const element = useRoutes([
    { path: "/", element: <Navigate to="/student" replace /> },
    { path: "/student", element: <StudentDashboard /> },
    { path: "/student/journey", element: <Journey /> },
    { path: "/student/leaderboard", element: <Leaderboard /> },
    { path: "/student/profile", element: <Profile /> },
    { path: "/teacher", element: <TeacherDashboard /> },
    { path: "/admin", element: <AdminDashboard /> },
  ]);

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center bg-tg-secondary text-tg-text">Loading...</div>;
  }

  return (
    <AnimatePresence mode="wait" custom={direction}>
      {element && (
        <motion.div
          key={location.pathname}
          custom={direction}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="w-full"
        >
          {element}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default App;
