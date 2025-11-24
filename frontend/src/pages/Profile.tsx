import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useTelegram } from '../context/TelegramContext';
import { Section } from '../components/ui/Section';
import { Card } from '../components/ui/Card';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Settings, ChevronRight, Info, Send } from 'lucide-react';
import PaymentDotsView from '../components/profile/PaymentDotsView';
import SubjectCard from '../components/profile/SubjectCard';
import TeacherInfoModal from '../components/profile/TeacherInfoModal';
import TeacherInfoPreview from '../components/profile/TeacherInfoPreview';
import AttendanceHistory from '../components/profile/AttendanceHistory';
import SettingsModal from '../components/profile/SettingsModal';

const Profile: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useTelegram();
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

    // Mock data - 3 subjects for demo
    const subjects = [
        {
            id: '1',
            name: 'Mathematics',
            teacher_name: 'Sarah Johnson',
            progress: 75,
            color: '#3390EC',
            telegram_username: 'sarahjohnson'
        },
        {
            id: '2',
            name: 'Physics',
            teacher_name: 'Michael Brown',
            progress: 60,
            color: '#10b981',
            telegram_username: 'michaelbrown'
        },
        {
            id: '3',
            name: 'English Grammar',
            teacher_name: 'John Smith',
            progress: 85,
            color: '#f59e0b',
            telegram_username: 'johnsmith'
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
    const hasMultipleSubjects = subjects.length > 1;

    // Handler for opening Telegram chat with teacher
    const handleContactTeacher = (username: string) => {
        if (username) {
            window.open(`https://t.me/${username}`, '_blank');
        }
    };

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

                {/* Conditional Layout: Multi-Subject vs Single-Subject */}
                {hasMultipleSubjects ? (
                    <>
                        {/* Multi-Subject View: Show Subject List */}
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
                        </Section>

                        {/* Show selected subject details */}
                        {currentSubject && (
                            <>
                                {/* Teacher Info Preview */}
                                <Section title={t('profile.teacher')}>
                                    <div className="space-y-3">
                                        <TeacherInfoPreview
                                            teacher={teacherInfo}
                                            subjectName={currentSubject.name}
                                        />

                                        {/* Action Buttons */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <motion.div whileTap={{ scale: 0.98 }}>
                                                <Card
                                                    className="p-4 cursor-pointer flex flex-col items-center text-center gap-2"
                                                    onClick={() => setShowTeacherModal(true)}
                                                >
                                                    <div className="w-12 h-12 rounded-full bg-tg-button/10 flex items-center justify-center">
                                                        <Info size={24} className="text-tg-button" />
                                                    </div>
                                                    <span className="text-sm font-medium text-tg-text">{t('profile.teacher_info')}</span>
                                                </Card>
                                            </motion.div>

                                            <motion.div whileTap={{ scale: 0.98 }}>
                                                <Card
                                                    className="p-4 cursor-pointer flex flex-col items-center text-center gap-2"
                                                    onClick={() => handleContactTeacher(currentSubject.telegram_username || '')}
                                                >
                                                    <div className="w-12 h-12 rounded-full bg-tg-button flex items-center justify-center">
                                                        <Send size={24} className="text-white" />
                                                    </div>
                                                    <span className="text-sm font-medium text-tg-text">{t('profile.contact_teacher')}</span>
                                                </Card>
                                            </motion.div>
                                        </div>
                                    </div>
                                </Section>

                                {/* Group Info */}
                                <Section title={t('profile.group_info')}>
                                    <Card className="p-4">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-tg-hint">{t('profile.group_name')}</span>
                                                <span className="text-tg-text font-medium">{groupInfo.name}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-tg-hint">{t('profile.students')}</span>
                                                <span className="text-tg-text font-medium">{groupInfo.student_count}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-tg-hint">{t('profile.schedule')}</span>
                                                <span className="text-tg-text font-medium">{groupInfo.schedule}</span>
                                            </div>
                                        </div>
                                    </Card>
                                </Section>

                                {/* Payment Status */}
                                <Section title={t('profile.payment_history')}>
                                    <Card className="p-4">
                                        <PaymentDotsView
                                            payments={paymentRecords}
                                            subjectName={currentSubject.name}
                                        />
                                    </Card>
                                </Section>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        {/* Single-Subject View: Show Details Directly (No Subject Selector) */}
                        {currentSubject && (
                            <>
                                {/* Teacher Info Preview */}
                                <Section title={currentSubject.name}>
                                    <div className="space-y-3">
                                        <TeacherInfoPreview
                                            teacher={teacherInfo}
                                            subjectName={currentSubject.name}
                                        />

                                        {/* Action Buttons */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <motion.div whileTap={{ scale: 0.98 }}>
                                                <Card
                                                    className="p-4 cursor-pointer flex flex-col items-center text-center gap-2"
                                                    onClick={() => setShowTeacherModal(true)}
                                                >
                                                    <div className="w-12 h-12 rounded-full bg-tg-button/10 flex items-center justify-center">
                                                        <Info size={24} className="text-tg-button" />
                                                    </div>
                                                    <span className="text-sm font-medium text-tg-text">{t('profile.teacher_info')}</span>
                                                </Card>
                                            </motion.div>

                                            <motion.div whileTap={{ scale: 0.98 }}>
                                                <Card
                                                    className="p-4 cursor-pointer flex flex-col items-center text-center gap-2"
                                                    onClick={() => handleContactTeacher(currentSubject.telegram_username || '')}
                                                >
                                                    <div className="w-12 h-12 rounded-full bg-tg-button flex items-center justify-center">
                                                        <Send size={24} className="text-white" />
                                                    </div>
                                                    <span className="text-sm font-medium text-tg-text">{t('profile.contact_teacher')}</span>
                                                </Card>
                                            </motion.div>
                                        </div>
                                    </div>
                                </Section>

                                {/* Group Info */}
                                <Section title={t('profile.group_info')}>
                                    <Card className="p-4">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-tg-hint">{t('profile.group_name')}</span>
                                                <span className="text-tg-text font-medium">{groupInfo.name}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-tg-hint">{t('profile.students')}</span>
                                                <span className="text-tg-text font-medium">{groupInfo.student_count}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-tg-hint">{t('profile.schedule')}</span>
                                                <span className="text-tg-text font-medium">{groupInfo.schedule}</span>
                                            </div>
                                        </div>
                                    </Card>
                                </Section>

                                {/* Payment Status */}
                                <Section title={t('profile.payment_history')}>
                                    <Card className="p-4">
                                        <PaymentDotsView
                                            payments={paymentRecords}
                                            subjectName={currentSubject.name}
                                        />
                                    </Card>
                                </Section>
                            </>
                        )}
                    </>
                )}

                {/* Attendance History (Always Show) */}
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
