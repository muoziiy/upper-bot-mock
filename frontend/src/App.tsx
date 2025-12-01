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
const AdminTeacherDetails = React.lazy(() => import('./pages/admin/AdminTeacherDetails'));
const AdminProfile = React.lazy(() => import('./pages/admin/AdminProfile'));
const AdminBroadcast = React.lazy(() => import('./pages/admin/AdminBroadcast'));
const AdminNotifications = React.lazy(() => import('./pages/admin/AdminNotifications'));
const AdminBotSettings = React.lazy(() => import('./pages/admin/AdminBotSettings'));
const AdminCenterSettings = React.lazy(() => import('./pages/admin/AdminCenterSettings'));
const AdminExportData = React.lazy(() => import('./pages/admin/AdminExportData'));
const AdminRequests = React.lazy(() => import('./pages/admin/AdminRequests'));
const AdminManageAdmins = React.lazy(() => import('./pages/admin/AdminManageAdmins'));
const AdminAttendance = React.lazy(() => import('./pages/admin/AdminAttendance'));
const AdminExams = React.lazy(() => import('./pages/admin/AdminExams'));
const ExamEditor = React.lazy(() => import('./pages/admin/ExamEditor'));
const TeacherGrading = React.lazy(() => import('./pages/admin/TeacherGrading'));
const StudentExams = React.lazy(() => import('./pages/StudentExams'));
const TakeExam = React.lazy(() => import('./pages/TakeExam'));
const TeacherExams = React.lazy(() => import('./pages/TeacherExams'));

const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const GuestDashboard = React.lazy(() => import('./pages/GuestDashboard'));
const WaitingPage = React.lazy(() => import('./pages/WaitingPage'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));
const Profile = React.lazy(() => import('./pages/Profile'));

const ParentExams = React.lazy(() => import('./pages/ParentExams'));
const Lessons = React.lazy(() => import('./pages/Lessons'));
const Groups = React.lazy(() => import('./pages/Groups'));
const TeacherProfile = React.lazy(() => import('./pages/TeacherProfile'));
const ParentProfile = React.lazy(() => import('./pages/ParentProfile'));

const AppContent = () => {
  const { user } = useTelegram();
  const { loading, dashboardData } = useAppData();
  const location = useLocation();

  // Determine if user is onboarded based on dashboardData presence
  // If loading is true, we wait. If loading is false and no dashboardData, maybe not onboarded?
  // But fetchAllData tries to login. If login fails (404), dashboardData is null.
  // So !!dashboardData is a good proxy for isOnboarded.
  const isOnboarded = !!dashboardData?.user;

  const routes = [
    {
      path: '/',
      element: !user ? <GuestDashboard /> :
        !isOnboarded ? <Navigate to="/onboarding" /> :
          user.role === 'student' ? <StudentDashboard /> :
            user.role === 'teacher' ? <TeacherDashboard /> :
              user.role === 'parent' ? <ParentDashboard /> :
                user.role === 'admin' ? <AdminDashboard /> :
                  <WaitingPage />
    },
    { path: '/onboarding', element: <Onboarding /> },
    { path: '/waiting', element: <WaitingPage /> },
    { path: '/leaderboard', element: <Leaderboard /> },
    { path: '/profile', element: <Profile /> },

    // Student Routes
    { path: '/student/exams', element: <StudentExams /> },
    { path: '/student/exams/:id/take', element: <TakeExam /> },

    // Teacher Routes
    { path: '/teacher/lessons', element: <Lessons /> },
    { path: '/teacher/groups', element: <Groups /> },
    { path: '/teacher/profile', element: <TeacherProfile /> },
    { path: '/teacher/exams', element: <TeacherExams /> },
    { path: '/teacher/exams/:id', element: <ExamEditor /> }, // Reusing Admin Editor for now

    // Parent Routes
    { path: '/parent/exams', element: <ParentExams /> },
    { path: '/parent/profile', element: <ParentProfile /> },

    // Admin Routes
    { path: '/admin/stats', element: <AdminStats /> },
    { path: '/admin/groups', element: <AdminGroups /> },
    { path: '/admin/teachers', element: <AdminTeachers /> },
    { path: '/admin/actions', element: <AdminActions /> },
    { path: '/admin/subjects', element: <AdminSubjects /> },
    { path: '/admin/students', element: <AdminStudents /> },
    { path: '/admin/students/:id', element: <AdminStudentDetails /> },
    { path: '/admin/teachers/:id', element: <AdminTeacherDetails /> },
    { path: '/admin/profile', element: <AdminProfile /> },
    { path: '/admin/broadcast', element: <AdminBroadcast /> },
    { path: '/admin/notifications', element: <AdminNotifications /> },
    { path: '/admin/bot-settings', element: <AdminBotSettings /> },
    { path: '/admin/center-settings', element: <AdminCenterSettings /> },
    { path: '/admin/export', element: <AdminExportData /> },
    { path: '/admin/requests', element: <AdminRequests /> },
    { path: '/admin/admins', element: <AdminManageAdmins /> },
    { path: '/admin/attendance', element: <AdminAttendance /> },
    { path: '/admin/exams', element: <AdminExams /> },
    { path: '/admin/exams/:id', element: <ExamEditor /> },
    { path: '/admin/grading', element: <TeacherGrading /> },

    { path: '*', element: <Navigate to="/" /> }
  ];

  const element = useRoutes(routes);

  // Hide bottom nav on specific pages
  const hideNavPaths = [
    '/onboarding',
    '/waiting',
    '/admin/students/',
    '/student/exams/',
    '/teacher/exams/',
    '/admin/exams/'
  ];
  const shouldShowNav = user && isOnboarded && !hideNavPaths.some(path => location.pathname.startsWith(path));

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

export default App;
