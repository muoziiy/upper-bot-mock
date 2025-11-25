import React, { useState, useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useTelegram } from '../context/TelegramContext';
import { ListGroup } from '../components/ui/ListGroup';
import { ListItem } from '../components/ui/ListItem';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Settings, Send, User, Users, BookOpen, BarChart2 } from 'lucide-react';
import PaymentDotsView from '../components/profile/PaymentDotsView';
import TeacherInfoModal from '../components/profile/TeacherInfoModal';
import AttendanceHistory from '../components/profile/AttendanceHistory';
import SettingsModal from '../components/profile/SettingsModal';

const Profile: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useTelegram();
    const { dashboardData, attendanceHistory, loading } = useAppData();
    const [showSettings, setShowSettings] = useState(false);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
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
            telegram_username: 'sarahjohnson',
            stats: {
                attendancePercentage: 92,
                averageScore: 85,
                lessonsCompleted: 18,
                totalLessons: 24
            }
        },
        {
            id: '2',
            name: 'Physics',
            teacher_name: 'Michael Brown',
            progress: 60,
            color: '#10b981',
            telegram_username: 'michaelbrown',
            stats: {
                attendancePercentage: 88,
                averageScore: 78,
                lessonsCompleted: 14,
                totalLessons: 24
            }
        },
        {
            id: '3',
            name: 'English Grammar',
            teacher_name: 'John Smith',
            progress: 85,
            color: '#f59e0b',
            telegram_username: 'johnsmith',
            stats: {
                attendancePercentage: 95,
                averageScore: 92,
                lessonsCompleted: 20,
                totalLessons: 24
            }
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

    // Mock payment records with subjectId
    const allPaymentRecords = [
        { month: 1, year: 2024, amount: 150, paid: true, date: '2024-01-05', subjectId: '1' },
        { month: 2, year: 2024, amount: 150, paid: true, date: '2024-02-05', subjectId: '1' },
        { month: 3, year: 2024, amount: 150, paid: true, date: '2024-03-05', subjectId: '1' },
        { month: 1, year: 2024, amount: 120, paid: true, date: '2024-01-10', subjectId: '2' },
        { month: 2, year: 2024, amount: 120, paid: false, subjectId: '2' },
        { month: 1, year: 2024, amount: 180, paid: true, date: '2024-01-15', subjectId: '3' },
        { month: 2, year: 2024, amount: 180, paid: true, date: '2024-02-15', subjectId: '3' },
        { month: 3, year: 2024, amount: 180, paid: false, subjectId: '3' },
    ];

    // Initialize selected subject
    if (!selectedSubjectId && subjects.length > 0) {
        setSelectedSubjectId(subjects[0].id);
    }

    const currentSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];

    // Filter data based on selected subject
    const filteredAttendance = useMemo(() => {
        // Assuming attendanceHistory has a 'subject' field that matches subject name
        // If not, we might need to adjust this matching logic
        return attendanceHistory.filter(a => a.subject === currentSubject.name);
    }, [attendanceHistory, currentSubject]);

    const filteredPayments = useMemo(() => {
        return allPaymentRecords.filter(p => p.subjectId === currentSubject.id);
    }, [allPaymentRecords, currentSubject]);


    const handleContactTeacher = (username: string) => {
        if (username) {
            window.open(`https://t.me/${username}`, '_blank');
        }
    };

    return (
        <div className="min-h-screen bg-tg-secondary pb-24 pt-6 text-tg-text">
            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
            <TeacherInfoModal
                teacher={teacherInfo}
                isOpen={showTeacherModal}
                onClose={() => setShowTeacherModal(false)}
            />

            <div className="px-4 space-y-6">
                {/* Header */}
                <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-tg-button to-tg-accent flex items-center justify-center text-white text-4xl font-bold overflow-hidden shadow-lg">
                        {user?.photo_url ? (
                            <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span>{dashboardData?.user.first_name?.[0] || 'U'}</span>
                        )}
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">{dashboardData?.user.first_name} {dashboardData?.user.last_name}</h1>
                        <p className="text-sm text-tg-hint capitalize">{dashboardData?.user.role}</p>
                    </div>
                </div>

                {/* Subject Switcher */}
                {subjects.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar justify-start md:justify-center">
                        {subjects.map(subject => (
                            <button
                                key={subject.id}
                                onClick={() => setSelectedSubjectId(subject.id)}
                                className={`
                                    px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                                    ${selectedSubjectId === subject.id
                                        ? 'bg-tg-button text-white shadow-md'
                                        : 'bg-tg-bg text-tg-text hover:bg-tg-bg/80'
                                    }
                                `}
                            >
                                {subject.name}
                            </button>
                        ))}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedSubjectId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Statistics Group */}
                        <ListGroup header={t('profile.statistics')}>
                            <ListItem
                                icon={<BarChart2 size={20} />}
                                title={t('profile.average_score')}
                                value={<span className="font-semibold text-tg-text">{currentSubject.stats.averageScore}%</span>}
                            />
                            <ListItem
                                icon={<BookOpen size={20} />}
                                title={t('profile.lessons_attended')}
                                value={
                                    <div className="flex items-center gap-2">
                                        <div className="w-24 h-2 bg-tg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-tg-button"
                                                style={{ width: `${(currentSubject.stats.lessonsCompleted / currentSubject.stats.totalLessons) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs">{currentSubject.stats.lessonsCompleted}/{currentSubject.stats.totalLessons}</span>
                                    </div>
                                }
                            />
                        </ListGroup>

                        {/* Education Info Group */}
                        <ListGroup header={t('profile.education_info')}>
                            <ListItem
                                icon={<User size={20} />}
                                title={t('profile.teacher')}
                                subtitle={currentSubject.teacher_name}
                                rightElement={
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleContactTeacher(currentSubject.telegram_username || '');
                                        }}
                                        className="p-2 text-tg-button hover:bg-tg-secondary rounded-full transition-colors"
                                    >
                                        <Send size={18} />
                                    </button>
                                }
                                onClick={() => setShowTeacherModal(true)}
                                showChevron
                            />
                            <ListItem
                                icon={<Users size={20} />}
                                title={t('profile.group')}
                                subtitle={groupInfo.name}
                                value={<span className="text-xs">{groupInfo.schedule}</span>}
                            />
                        </ListGroup>

                        {/* Payment History */}
                        <ListGroup header={t('profile.payment_history')}>
                            <div className="p-4">
                                <PaymentDotsView
                                    payments={filteredPayments}
                                    subjectName={currentSubject.name}
                                />
                            </div>
                        </ListGroup>

                        {/* Attendance History */}
                        <ListGroup header={t('profile.attendance_history')}>
                            <div className="p-4">
                                <AttendanceHistory attendance={filteredAttendance} />
                            </div>
                        </ListGroup>
                    </motion.div>
                </AnimatePresence>

                {/* Settings Group */}
                <ListGroup header={t('profile.settings')}>
                    <ListItem
                        icon={<Settings size={20} />}
                        title={t('profile.account_settings')}
                        onClick={() => setShowSettings(true)}
                        showChevron
                    />
                </ListGroup>
            </div>
        </div>
    );
};

export default Profile;
