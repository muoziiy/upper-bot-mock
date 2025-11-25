import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { motion } from 'framer-motion';
import { Plus, CheckSquare, BookOpen, Calendar as CalendarIcon, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CreateExamModal from '../components/teacher/CreateExamModal';
import AttendanceModal from '../components/teacher/AttendanceModal';
import EditCurriculumModal from '../components/teacher/EditCurriculumModal';
import ScheduleClassModal from '../components/teacher/ScheduleClassModal';

const TeacherDashboard: React.FC = () => {
    const { teacherData, loading } = useAppData();
    const { t } = useTranslation();
    const [activeModal, setActiveModal] = useState<string | null>(null);

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center bg-tg-secondary text-tg-text">Loading...</div>;
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const actions = [
        { id: 'create_exam', label: t('teacher.create_exam'), icon: Plus, color: 'bg-blue-500' },
        { id: 'attendance', label: t('teacher.mark_attendance'), icon: CheckSquare, color: 'bg-green-500' },
        { id: 'curriculum', label: t('teacher.edit_curriculum'), icon: BookOpen, color: 'bg-orange-500' },
        { id: 'schedule', label: t('teacher.schedule_class'), icon: CalendarIcon, color: 'bg-purple-500' },
    ];

    return (
        <div className="min-h-screen bg-tg-secondary pb-24 pt-4 text-tg-text px-4">
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
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <header className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{t('teacher.welcome')}</h1>
                        <p className="text-tg-hint">{teacherData?.name}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-tg-button text-tg-button-text flex items-center justify-center font-bold text-lg">
                        {teacherData?.name.charAt(0)}
                    </div>
                </header>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {actions.map((action) => (
                        <motion.button
                            key={action.id}
                            variants={itemVariants}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveModal(action.id)}
                            className="bg-tg-bg p-4 rounded-xl shadow-sm flex flex-col items-start gap-3 border border-tg-hint/10"
                        >
                            <div className={`p-2 rounded-lg ${action.color} text-white`}>
                                <action.icon size={20} />
                            </div>
                            <span className="text-sm font-semibold text-left leading-tight">
                                {action.label}
                            </span>
                        </motion.button>
                    ))}
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 gap-3">
                    <motion.div variants={itemVariants} className="bg-tg-bg p-4 rounded-xl shadow-sm border border-tg-hint/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Users size={16} className="text-tg-hint" />
                            <p className="text-tg-hint text-xs font-medium uppercase">{t('teacher.total_students')}</p>
                        </div>
                        <p className="text-2xl font-bold">{teacherData?.total_students}</p>
                    </motion.div>
                    <motion.div variants={itemVariants} className="bg-tg-bg p-4 rounded-xl shadow-sm border border-tg-hint/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Users size={16} className="text-tg-hint" />
                            <p className="text-tg-hint text-xs font-medium uppercase">{t('teacher.active_groups')}</p>
                        </div>
                        <p className="text-2xl font-bold">{teacherData?.groups.length}</p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default TeacherDashboard;
