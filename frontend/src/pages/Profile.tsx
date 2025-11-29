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
                    {/* Paid Badge */}
                    <div className="absolute -top-1 -right-1">
                        {/* Logic: Check if ANY group is overdue? Or master status? 
                            Let's assume dashboardData.user doesn't have master status yet, 
                            we might need to calculate it or check groups.
                            But wait, we updated backend to return rich groups with status.
                            Let's check if any group is 'overdue'.
                         */}
                        {dashboardData?.groups?.some((g: any) => g.status === 'overdue') ? (
                            <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md border-2 border-tg-secondary">
                                Overdue
                            </div>
                        ) : (
                            <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md border-2 border-tg-secondary flex items-center gap-1">
                                <span>Paid</span>
                                <span>{dashboardData?.user.sex === 'female' ? '👧' : '👦'}</span>
                            </div>
                        )}
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">{dashboardData?.user.onboarding_first_name || dashboardData?.user.first_name}</h1>
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

                {/* My Courses (Groups) */}
                <div>
                    <div className="px-4 pb-2 text-xs font-medium uppercase text-tg-hint">
                        {t('profile.my_subjects')}
                    </div>
                    <div className="space-y-4">
                        {dashboardData?.groups && dashboardData.groups.length > 0 ? (
                            dashboardData.groups.map((group: any) => (
                                <div key={group.id} className="bg-tg-bg rounded-xl overflow-hidden shadow-sm">
                                    <div className="p-4 border-b border-tg-secondary/50 flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-semibold text-tg-text">{group.name}</h3>
                                            <div className="text-xs text-tg-hint mt-0.5">
                                                {group.payment_type === 'lesson_based' ? (
                                                    <span className={group.lessons_remaining <= 2 ? "text-red-500 font-bold" : ""}>
                                                        {group.lessons_remaining} Credits Left
                                                    </span>
                                                ) : group.next_due_date ? (
                                                    <span className={new Date(group.next_due_date) < new Date() ? "text-red-500 font-bold" : ""}>
                                                        Due: {new Date(group.next_due_date).toLocaleDateString()}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                        {group.price && (
                                            <span className="text-sm font-bold text-tg-button bg-tg-button/10 px-2 py-1 rounded-lg">
                                                {group.price.toLocaleString()} UZS
                                            </span>
                                        )}
                                    </div>

                                    {/* Info Rows */}
                                    <div className="divide-y divide-tg-secondary/50">
                                        {/* Teacher */}
                                        {group.teacher ? (
                                            <button
                                                onClick={() => setSelectedTeacher(group.teacher)}
                                                className="w-full p-3 flex items-center justify-between hover:bg-tg-secondary/30 transition-colors active:bg-tg-secondary/50"
                                            >
                                                <span className="text-xs text-tg-hint uppercase">{t('profile.teacher')}</span>
                                                <div className="flex items-center gap-1">
                                                    <span className="font-medium text-tg-button">{group.teacher.first_name} {group.teacher.last_name}</span>
                                                    <ChevronRight size={14} className="text-tg-hint" />
                                                </div>
                                            </button>
                                        ) : (
                                            <div className="p-3 flex items-center justify-between">
                                                <span className="text-xs text-tg-hint uppercase">{t('profile.teacher')}</span>
                                                <span className="text-sm text-tg-hint italic">Not assigned</span>
                                            </div>
                                        )}

                                        {/* Payment Circles */}
                                        <button
                                            onClick={() => setSelectedSubjectPayments({ name: group.name, payments: group.payments })}
                                            className="w-full p-4 flex flex-col items-center hover:bg-tg-secondary/30 transition-colors active:bg-tg-secondary/50"
                                        >
                                            <span className="text-xs text-tg-hint uppercase mb-3 flex items-center gap-1">
                                                {t('profile.payment_history')} <ChevronRight size={12} />
                                            </span>
                                            <div className="grid grid-cols-6 gap-3">
                                                {group.payments && group.payments.length > 0 ? (
                                                    group.payments.slice(0, 12).map((payment: any, idx: number) => (
                                                        <div
                                                            key={idx}
                                                            className={`
                                                                w-3 h-3 rounded-full 
                                                                ${payment.status === 'paid' ? 'bg-green-500' :
                                                                    payment.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500/50'}
                                                            `}
                                                            title={`${payment.status} - ${new Date(payment.payment_date).toLocaleDateString()}`}
                                                        />
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-tg-hint col-span-6">No payments recorded</span>
                                                )}
                                            </div>
                                        </button>

                                        {/* Attendance Link */}
                                        <button
                                            onClick={() => setSelectedSubjectAttendance({ name: group.name, attendance: group.attendance })}
                                            className="w-full p-3 flex items-center justify-center gap-2 hover:bg-tg-secondary/30 transition-colors active:bg-tg-secondary/50 text-tg-button"
                                        >
                                            <Calendar size={18} />
                                            <span className="font-medium">{t('profile.view_attendance')}</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-tg-hint">
                                <p>No courses found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
