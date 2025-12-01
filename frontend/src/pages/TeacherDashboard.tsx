import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import CreateExamModal from '../components/teacher/CreateExamModal';
import AttendanceModal from '../components/teacher/AttendanceModal';
import EditCurriculumModal from '../components/teacher/EditCurriculumModal';
import ScheduleClassModal from '../components/teacher/ScheduleClassModal';
import { AdminSection } from './admin/components/AdminSection';
import { AdminListItem } from './admin/components/AdminListItem';

const TeacherDashboard: React.FC = () => {
    const { teacherData, dashboardData, loading } = useAppData();
    const { t } = useTranslation();
    const [activeModal, setActiveModal] = useState<string | null>(null);

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center bg-[#F2F2F7] dark:bg-[#000000] text-black dark:text-white">Loading...</div>;
    }

    const actions = [
        { id: 'create_exam', label: t('teacher.create_exam'), icon: '📝', color: 'bg-blue-500' },
        { id: 'attendance', label: t('teacher.mark_attendance'), icon: '✅', color: 'bg-green-500' },
        { id: 'curriculum', label: t('teacher.edit_curriculum'), icon: '📚', color: 'bg-orange-500' },
        { id: 'schedule', label: t('teacher.schedule_class'), icon: '📅', color: 'bg-purple-500' },
    ];

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] pb-24 pt-4 text-black dark:text-white">
            <CreateExamModal
                isOpen={activeModal === 'create_exam'}
                onClose={() => setActiveModal(null)}
                groups={teacherData?.groups || []}
            />
            <AttendanceModal
                isOpen={activeModal === 'attendance'}
                onClose={() => setActiveModal(null)}
                groups={teacherData?.groups || []}
            />
            <EditCurriculumModal
                isOpen={activeModal === 'curriculum'}
                onClose={() => setActiveModal(null)}
            />
            <ScheduleClassModal
                isOpen={activeModal === 'schedule'}
                onClose={() => setActiveModal(null)}
                groups={teacherData?.groups || []}
            />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <header className="mb-6 px-4">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold text-black dark:text-white">
                            {t('teacher.welcome')}
                        </h1>
                        <span className="text-3xl">👨‍🏫</span>
                    </div>
                    <p className="text-[#8E8E93] text-lg">
                        {dashboardData?.user.onboarding_first_name || dashboardData?.user.first_name} {dashboardData?.user.last_name}
                    </p>
                </header>

                <AdminSection title="Quick Actions">
                    {actions.map((action, index) => (
                        <AdminListItem
                            key={action.id}
                            title={action.label}
                            icon={action.icon}
                            iconColor={action.color}
                            onClick={() => setActiveModal(action.id)}
                            showChevron
                            isLast={index === actions.length - 1}
                        />
                    ))}
                </AdminSection>

                <AdminSection title="Overview">
                    <AdminListItem
                        title={t('teacher.total_students')}
                        icon="👥"
                        iconColor="bg-blue-500"
                        value={teacherData?.stats.total_students}
                    />
                    <AdminListItem
                        title={t('teacher.active_groups')}
                        icon="🏫"
                        iconColor="bg-purple-500"
                        value={teacherData?.groups.length}
                        isLast
                    />
                </AdminSection>
            </motion.div>
        </div>
    );
};

export default TeacherDashboard;
