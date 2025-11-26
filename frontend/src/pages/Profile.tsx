import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useTelegram } from '../context/TelegramContext';
import { useTranslation } from 'react-i18next';
import { Settings, ChevronRight, Calendar } from 'lucide-react';
import TeacherInfoModal from '../components/profile/TeacherInfoModal';
import AttendanceCalendarModal from '../components/profile/AttendanceCalendarModal';
import SettingsModal from '../components/profile/SettingsModal';
import PaymentHistoryModal from '../components/profile/PaymentHistoryModal';

const Profile: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useTelegram();
    const { dashboardData, loading } = useAppData();
    const [showSettings, setShowSettings] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
    const [selectedSubjectAttendance, setSelectedSubjectAttendance] = useState<any>(null);
    const [selectedSubjectPayments, setSelectedSubjectPayments] = useState<any>(null);

    // Use real student ID from DB, fallback to '---' if not set
    const studentId = dashboardData?.user.student_id || '---';

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-tg-secondary text-tg-text">
                <p>{t('common.loading')}</p>
            </div>
        );
    }

    // Mock Data
    const subjects = [
        {
            id: '1',
            name: 'English Language',
            group: 'A-123',
            teacher: {
                id: 't1',
                first_name: 'John',
                last_name: 'Smith',
                email: 'john@example.com',
                phone: '+1234567890',
                bio: 'Expert in English Literature.',
                subjects: ['English', 'Literature']
            },
            payments: [
                { status: 'paid', date: '2024-01-05' }, { status: 'paid', date: '2024-02-05' }, { status: 'paid', date: '2024-03-05' },
                { status: 'paid', date: '2024-04-05' }, { status: 'paid', date: '2024-05-05' }, { status: 'paid', date: '2024-06-05' },
                { status: 'paid', date: '2024-07-05' }, { status: 'paid', date: '2024-08-05' }, { status: 'pending' },
                { status: 'unpaid' }, { status: 'unpaid' }, { status: 'unpaid' }
            ],
            attendance: [
                { date: '2024-11-01', status: 'present' },
                { date: '2024-11-03', status: 'present' },
                { date: '2024-11-05', status: 'absent' },
                { date: '2024-11-08', status: 'present' },
            ]
        },
        {
            id: '2',
            name: 'Mathematics',
            group: 'B-456',
            teacher: {
                id: 't2',
                first_name: 'Sarah',
                last_name: 'Connor',
                email: 'sarah@example.com',
                phone: '+9876543210',
                bio: 'Mathematics genius.',
                subjects: ['Math', 'Algebra']
            },
            payments: [
                { status: 'paid', date: '2024-01-10' }, { status: 'paid', date: '2024-02-10' }, { status: 'paid', date: '2024-03-10' },
                { status: 'paid', date: '2024-04-10' }, { status: 'unpaid' }, { status: 'unpaid' },
                { status: 'unpaid' }, { status: 'unpaid' }, { status: 'unpaid' }, { status: 'unpaid' }, { status: 'unpaid' }, { status: 'unpaid' }
            ],
            attendance: [
                { date: '2024-11-02', status: 'present' },
                { date: '2024-11-04', status: 'late' },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-tg-secondary pb-24 pt-6 text-tg-text">
            {/* Modals */}
            <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
            <TeacherInfoModal
                teacher={selectedTeacher}
                isOpen={!!selectedTeacher}
                onClose={() => setSelectedTeacher(null)}
            />
            {selectedSubjectAttendance && (
                <AttendanceCalendarModal
                    isOpen={!!selectedSubjectAttendance}
                    onClose={() => setSelectedSubjectAttendance(null)}
                    subjectName={selectedSubjectAttendance.name}
                    attendance={selectedSubjectAttendance.attendance}
                />
            )}
            {selectedSubjectPayments && (
                <PaymentHistoryModal
                    isOpen={!!selectedSubjectPayments}
                    onClose={() => setSelectedSubjectPayments(null)}
                    subjectName={selectedSubjectPayments.name}
                    payments={selectedSubjectPayments.payments}
                />
            )}

            <div className="px-4 space-y-6">
                {/* Profile Header */}
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
                        <div className="flex items-center justify-center gap-2 text-sm text-tg-hint">
                            <span className="capitalize">{dashboardData?.user.role}</span>
                            <span>•</span>
                            <span>ID: #{studentId}</span>
                        </div>
                    </div>
                </div>

                {/* Settings Button */}
                <button
                    onClick={() => setShowSettings(true)}
                    className="w-full bg-tg-bg rounded-xl p-4 flex items-center justify-between hover:bg-tg-bg/80 active:bg-tg-bg/60 transition-colors shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-tg-button/10 p-2 rounded-lg">
                            <Settings size={20} className="text-tg-button" />
                        </div>
                        <span className="text-tg-text font-medium">{t('profile.account_settings')}</span>
                    </div>
                    <ChevronRight size={20} className="text-tg-hint" />
                </button>

                {/* My Subjects */}
                <div>
                    <div className="px-4 pb-2 text-xs font-medium uppercase text-tg-hint">
                        {t('profile.my_subjects')}
                    </div>
                    <div className="space-y-4">
                        {subjects.map(subject => (
                            <div key={subject.id} className="bg-tg-bg rounded-xl overflow-hidden shadow-sm">
                                {/* Subject Header */}
                                <div className="p-4 border-b border-tg-secondary/50">
                                    <h3 className="text-lg font-semibold text-tg-text">{subject.name}</h3>
                                </div>

                                {/* Info Rows */}
                                <div className="divide-y divide-tg-secondary/50">
                                    {/* Group & Teacher */}
                                    <div className="flex items-center divide-x divide-tg-secondary/50">
                                        <div className="flex-1 p-3 flex flex-col items-center justify-center text-center">
                                            <span className="text-xs text-tg-hint uppercase mb-1">{t('profile.group')}</span>
                                            <span className="font-medium text-tg-text">{subject.group}</span>
                                        </div>
                                        <button
                                            onClick={() => setSelectedTeacher(subject.teacher)}
                                            className="flex-1 p-3 flex flex-col items-center justify-center text-center hover:bg-tg-secondary/30 transition-colors active:bg-tg-secondary/50"
                                        >
                                            <span className="text-xs text-tg-hint uppercase mb-1 flex items-center gap-1">
                                                {t('profile.teacher')} <ChevronRight size={12} />
                                            </span>
                                            <span className="font-medium text-tg-button">{subject.teacher.first_name}</span>
                                        </button>
                                    </div>

                                    {/* Payment Circles */}
                                    <button
                                        onClick={() => setSelectedSubjectPayments(subject)}
                                        className="w-full p-4 flex flex-col items-center hover:bg-tg-secondary/30 transition-colors active:bg-tg-secondary/50"
                                    >
                                        <span className="text-xs text-tg-hint uppercase mb-3 flex items-center gap-1">
                                            {t('profile.payment_history')} <ChevronRight size={12} />
                                        </span>
                                        <div className="grid grid-cols-6 gap-3">
                                            {subject.payments.map((payment, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`
                                                        w-3 h-3 rounded-full 
                                                        ${payment.status === 'paid' ? 'bg-green-500' :
                                                            payment.status === 'pending' ? 'bg-yellow-500' : 'bg-tg-secondary border border-tg-hint/30'}
                                                    `}
                                                />
                                            ))}
                                        </div>
                                    </button>

                                    {/* Attendance Link */}
                                    <button
                                        onClick={() => setSelectedSubjectAttendance(subject)}
                                        className="w-full p-3 flex items-center justify-center gap-2 hover:bg-tg-secondary/30 transition-colors active:bg-tg-secondary/50 text-tg-button"
                                    >
                                        <Calendar size={18} />
                                        <span className="font-medium">{t('profile.view_attendance')}</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
