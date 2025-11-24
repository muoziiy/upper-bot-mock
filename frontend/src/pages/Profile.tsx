import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useTelegram } from '../context/TelegramContext';
import { Section } from '../components/ui/Section';
import { Card } from '../components/ui/Card';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Settings, ChevronRight, ExternalLink, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PaymentDotsView from '../components/profile/PaymentDotsView';
import SubjectCard from '../components/profile/SubjectCard';
import TeacherInfoModal from '../components/profile/TeacherInfoModal';
import AttendanceHistory from '../components/profile/AttendanceHistory';
import SettingsModal from '../components/profile/SettingsModal';

const Profile: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useTelegram();
    const navigate = useNavigate();
    const { dashboardData, attendanceHistory, loading } = useAppData();
    const [showSettings, setShowSettings] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [showTeacherModal, setShowTeacherModal] = useState(false);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-tg-secondary text-tg-text">
                <p>{t('common.loading')}</p>
            </div>
        );
    }

    // Mock data - Replace with actual data from Supabase
    const subjects = [
        {
            id: '1',
            name: 'English Grammar',
            teacher_name: 'John Smith',
            progress: 75,
            color: '#3b82f6'
        },
        {
            id: '2',
            name: 'Mathematics',
            teacher_name: 'Sarah Johnson',
            progress: 60,
            color: '#10b981'
        },
        {
            id: '3',
            name: 'Physics',
            teacher_name: 'Michael Brown',
            progress: 45,
            color: '#f59e0b'
        }
    ];

    const teacherInfo = {
        id: '1',
        first_name: 'John',
        last_name: 'Smith',
        photo_url: undefined,
        email: 'john.smith@example.com',
        phone: '+1 234 567 8900',
        bio: 'Experienced English teacher with 10+ years of teaching experience. Passionate about helping students achieve their language goals.',
        subjects: ['English Grammar', 'IELTS Preparation', 'Business English']
    };

    const groupInfo = {
        name: 'Advanced English - Group A',
        student_count: 12,
        schedule: 'Mon, Wed, Fri - 10:00 AM'
    };

    const paymentRecords = [
        { month: 1, year: 2024, amount: 150, paid: true, date: '2024-01-05' },
        { month: 2, year: 2024, amount: 150, paid: true, date: '2024-02-05' },
        { month: 3, year: 2024, amount: 150, paid: true, date: '2024-03-05' },
        { month: 4, year: 2024, amount: 150, paid: false },
        { month: 5, year: 2024, amount: 150, paid: false },
    ];

    const currentSubject = subjects.find(s => s.id === selectedSubject) || subjects[0];

    return (
        <div className="min-h-screen bg-tg-secondary pb-24 pt-4 text-tg-text">
            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
            <TeacherInfoModal
                teacher={teacherInfo}
                isOpen={showTeacherModal}
                onClose={() => setShowTeacherModal(false)}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 space-y-6"
            >
                {/* Header */}
                <header className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-tg-button to-tg-accent flex items-center justify-center text-white text-3xl font-bold overflow-hidden flex-shrink-0">
                        {user?.photo_url ? (
                            <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span>{dashboardData?.user.first_name?.[0] || 'U'}</span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold">{dashboardData?.user.first_name}</h1>
                        <p className="text-sm text-tg-hint capitalize">{dashboardData?.user.role}</p>
                    </div>
                </header>

                {/* My Subjects */}
                <Section title={t('profile.my_subjects')}>
                    <div className="space-y-3">
                        {subjects.map((subject) => (
                            <SubjectCard
                                key={subject.id}
                                subject={subject}
                                isSelected={selectedSubject === subject.id}
                                onClick={() => setSelectedSubject(subject.id)}
                            />
                        ))}
                    </div>
                    {subjects.length === 0 && (
                        <Card className="py-8 text-center">
                            <p className="text-tg-hint">{t('profile.select_subject')}</p>
                        </Card>
                    )}
                </Section>

                {/* Teacher & Group Info */}
                {currentSubject && (
                    <Section title={t('profile.teacher') + ' & ' + t('profile.group')}>
                        <div className="space-y-3">
                            {/* Teacher Info Buttons */}
                            <div className="grid grid-cols-2 gap-3">
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Card
                                        className="p-4 cursor-pointer flex flex-col items-center text-center"
                                        onClick={() => setShowTeacherModal(true)}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                                            <Info size={24} className="text-blue-500" />
                                        </div>
                                        <span className="text-sm font-medium">{t('profile.teacher_info')}</span>
                                    </Card>
                                </motion.div>

                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Card
                                        className="p-4 cursor-pointer flex flex-col items-center text-center"
                                        onClick={() => navigate(`/teacher/${teacherInfo.id}`)}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                                            <ExternalLink size={24} className="text-green-500" />
                                        </div>
                                        <span className="text-sm font-medium">{t('profile.view_teacher_profile')}</span>
                                    </Card>
                                </motion.div>
                            </div>

                            {/* Group Info Card */}
                            <Card className="p-4">
                                <h3 className="font-semibold text-tg-text mb-3">{t('profile.group_info')}</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-tg-hint">Group Name</span>
                                        <span className="text-tg-text font-medium">{groupInfo.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-tg-hint">Students</span>
                                        <span className="text-tg-text font-medium">{groupInfo.student_count}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-tg-hint">Schedule</span>
                                        <span className="text-tg-text font-medium">{groupInfo.schedule}</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </Section>
                )}

                {/* Payment Status (12-Month Dots) */}
                {currentSubject && (
                    <Section title={t('profile.payment_history')}>
                        <Card className="p-4">
                            <PaymentDotsView
                                payments={paymentRecords}
                                subjectName={currentSubject.name}
                            />
                        </Card>
                    </Section>
                )}

                {/* Attendance History (Keep Calendar View) */}
                <Section title={t('profile.attendance_history')}>
                    <AttendanceHistory attendance={attendanceHistory} />
                </Section>

                {/* Settings */}
                <Section title={t('profile.settings')}>
                    <Card
                        className="flex items-center justify-between p-4 cursor-pointer active:scale-95 transition-transform"
                        onClick={() => setShowSettings(true)}
                    >
                        <div className="flex items-center gap-3">
                            <Settings className="h-5 w-5 text-tg-hint" />
                            <span>{t('profile.account_settings')}</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-tg-hint" />
                    </Card>
                </Section>
            </motion.div>
        </div>
    );
};

export default Profile;
