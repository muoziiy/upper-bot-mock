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
const ExamTaker = React.lazy(() => import('./pages/ExamTaker'));

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

function App() {
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
