import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
        <AppContent />
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

const pageTransition = {
  type: "tween",
  ease: [0.4, 0.0, 0.2, 1],
  duration: 0.3
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

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center bg-tg-secondary text-tg-text">Loading...</div>;
  }

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/student" replace />} />
        <Route
          path="/student"
          element={
            <motion.div
              custom={direction}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <StudentDashboard />
            </motion.div>
          }
        />
        <Route
          path="/student/journey"
          element={
            <motion.div
              custom={direction}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <Journey />
            </motion.div>
          }
        />
        <Route
          path="/student/leaderboard"
          element={
            <motion.div
              custom={direction}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <Leaderboard />
            </motion.div>
          }
        />
        <Route
          path="/student/profile"
          element={
            <motion.div
              custom={direction}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <Profile />
            </motion.div>
          }
        />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </AnimatePresence>
  );
};

export default App;
