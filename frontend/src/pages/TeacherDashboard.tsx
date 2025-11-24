import React, { useState } from 'react';
import { useTelegram } from '../context/TelegramContext';
import { useAppData } from '../context/AppDataContext';
import { Users, BookOpen, Calendar, Plus, CheckSquare, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import CreateExamModal from '../components/teacher/CreateExamModal';
import AttendanceModal from '../components/teacher/AttendanceModal';

const TeacherDashboard: React.FC = () => {
    const { user } = useTelegram();
    const { teacherData, loading } = useAppData();
    const { t } = useTranslation();
    const [showCreateExam, setShowCreateExam] = useState(false);
    const [showAttendance, setShowAttendance] = useState(false);

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center bg-tg-secondary text-tg-text">{t('common.loading')}</div>;
    }

    // Mock upcoming lessons data
    const upcomingLessons = [
        {
            id: 'l1',
            title: 'Advanced Algebra',
            group: 'Mathematics 101',
            date: 'Today',
            time: '14:00',
            duration: 60,
            location: 'Room 203'
        },
        {
            id: 'l2',
            title: 'Quantum Mechanics',
            group: 'Physics Advanced',
            date: 'Tomorrow',
            time: '10:00',
            duration: 90,
            location: 'Lab 5'
        },
        {
            id: 'l3',
            title: 'Triangle Properties',
            group: 'Geometry Basics',
            date: 'Wednesday',
            time: '16:00',
            duration: 45,
            location: 'Room 101'
        }
    ];

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

    return (
        <div className="min-h-screen bg-tg-secondary pb-24 pt-4 text-tg-text px-4">
            <CreateExamModal
                isOpen={showCreateExam}
                onClose={() => setShowCreateExam(false)}
                groups={teacherData?.groups || []}
            />
            <AttendanceModal
                isOpen={showAttendance}
                onClose={() => setShowAttendance(false)}
                groups={teacherData?.groups || []}
            />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <header className="mb-6">
                    <h1 className="text-2xl font-bold">{t('teacher.dashboard')}</h1>
                    <p className="text-tg-hint">{t('dashboard.welcome')} {user?.first_name}</p>
                </header>

                {/* Stats Overview */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <motion.div variants={itemVariants} className="bg-tg-bg p-3 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
                        <Users className="w-6 h-6 text-blue-500 mb-1" />
                        <span className="text-lg font-bold">{teacherData?.stats.total_students || 0}</span>
                        <span className="text-[10px] text-tg-hint uppercase">{t('teacher.students')}</span>
                    </motion.div>
                    <motion.div variants={itemVariants} className="bg-tg-bg p-3 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
                        <BookOpen className="w-6 h-6 text-green-500 mb-1" />
                        <span className="text-lg font-bold">{teacherData?.stats.active_groups || 0}</span>
                        <span className="text-[10px] text-tg-hint uppercase">{t('teacher.groups')}</span>
                    </motion.div>
                    <motion.div variants={itemVariants} className="bg-tg-bg p-3 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
                        <Calendar className="w-6 h-6 text-orange-500 mb-1" />
                        <span className="text-lg font-bold">{teacherData?.stats.upcoming_exams_count || 0}</span>
                        <span className="text-[10px] text-tg-hint uppercase">{t('teacher.exams')}</span>
                    </motion.div>
                </div>

                {/* Quick Actions */}
                <div className="mb-6">
                    <h2 className="text-sm font-medium text-tg-hint uppercase mb-3 px-1">{t('teacher.quick_actions')}</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <motion.button
                            variants={itemVariants}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowCreateExam(true)}
                            className="bg-tg-button text-tg-button-text p-4 rounded-xl flex flex-col items-center justify-center gap-2 shadow-sm"
                        >
                            <Plus className="w-6 h-6" />
                            <span className="text-sm font-medium">{t('teacher.create_exam')}</span>
                        </motion.button>
                        <motion.button
                            variants={itemVariants}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowAttendance(true)}
                            className="bg-tg-bg text-tg-text p-4 rounded-xl flex flex-col items-center justify-center gap-2 shadow-sm border border-tg-button/10"
                        >
                            <CheckSquare className="w-6 h-6 text-tg-button" />
                            <span className="text-sm font-medium">{t('teacher.attendance')}</span>
                        </motion.button>
                    </div>
                </div>

                {/* Upcoming Lessons */}
                <div>
                    <h2 className="text-sm font-medium text-tg-hint uppercase mb-3 px-1">{t('teacher.upcoming_lessons')}</h2>
                    <div className="space-y-3">
                        {upcomingLessons.map((lesson) => (
                            <motion.div
                                key={lesson.id}
                                variants={itemVariants}
                                className="bg-tg-bg p-4 rounded-xl shadow-sm border border-tg-secondary/50"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-tg-text">{lesson.title}</h3>
                                        <p className="text-xs text-tg-hint mt-0.5">{lesson.group}</p>
                                    </div>
                                    <span className="text-xs font-medium text-tg-button bg-tg-button/10 px-2 py-1 rounded-lg">
                                        {lesson.date}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-tg-hint mt-3">
                                    <div className="flex items-center gap-1">
                                        <Clock size={14} />
                                        <span>{lesson.time}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        <span>{lesson.duration} min</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin size={14} />
                                        <span>{lesson.location}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TeacherDashboard;
