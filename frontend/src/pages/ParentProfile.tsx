import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useTelegram } from '../context/TelegramContext';
import { useTranslation } from 'react-i18next';
import { Settings, ChevronRight, Calendar, Users, AlertCircle } from 'lucide-react';
import ParentAccountSettingsModal from '../components/parent/ParentAccountSettingsModal';
import ParentPaymentHistoryModal from '../components/parent/ParentPaymentHistoryModal';
import ParentAttendanceModal from '../components/parent/ParentAttendanceModal';

const ParentProfile: React.FC = () => {
    const { t } = useTranslation();
    const { user, webApp } = useTelegram();
    const { parentData, dashboardData, loading } = useAppData();
    const [showSettings, setShowSettings] = useState(false);
    const [selectedChildPayments, setSelectedChildPayments] = useState<any>(null);
    const [selectedChildAttendance, setSelectedChildAttendance] = useState<any>(null);

    // Mock random parent ID for now
    const parentId = React.useMemo(() => Math.floor(10000 + Math.random() * 90000), []);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-tg-secondary text-tg-text">
                <p>{t('common.loading')}</p>
            </div>
        );
    }

    const handleReportProblem = () => {
        webApp?.showPopup({
            title: t('parent.report_problem'),
            message: t('parent.report_problem_message'),
            buttons: [
                { type: 'cancel' },
                { type: 'ok', id: 'send' }
            ]
        });
    };

    return (
        <div className="min-h-screen bg-tg-secondary pb-24 pt-6 text-tg-text">
            {/* Modals */}
            <ParentAccountSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
            {selectedChildPayments && (
                <ParentPaymentHistoryModal
                    isOpen={!!selectedChildPayments}
                    onClose={() => setSelectedChildPayments(null)}
                    child={selectedChildPayments}
                />
            )}
            {selectedChildAttendance && (
                <ParentAttendanceModal
                    isOpen={!!selectedChildAttendance}
                    onClose={() => setSelectedChildAttendance(null)}
                    child={selectedChildAttendance}
                />
            )}

            <div className="px-4 space-y-6">
                {/* Profile Header */}
                <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-tg-button to-tg-accent flex items-center justify-center text-white text-4xl font-bold overflow-hidden shadow-lg">
                        {user?.emoji ? (
                            <span className="text-5xl">{user.emoji}</span>
                        ) : user?.photo_url ? (
                            <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span>{dashboardData?.user.first_name?.[0] || 'P'}</span>
                        )}
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">{dashboardData?.user.onboarding_first_name || dashboardData?.user.first_name}</h1>
                        <div className="flex items-center justify-center gap-2 text-sm text-tg-hint">
                            <span className="capitalize">{dashboardData?.user.role}</span>
                            <span>•</span>
                            <span>ID: #{parentId}</span>
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

                {/* My Children */}
                <div>
                    <div className="px-4 pb-2 text-xs font-medium uppercase text-tg-hint">
                        {t('parent.my_children')}
                    </div>
                    <div className="space-y-4">
                        {parentData?.children && parentData.children.map(child => (
                            <div key={child.id} className="bg-tg-bg rounded-xl overflow-hidden shadow-sm">
                                {/* Child Header */}
                                <div className="p-4 border-b border-tg-secondary/50 flex items-center gap-3 relative">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-tg-button to-tg-accent flex items-center justify-center text-white text-lg font-bold">
                                        {child.emoji ? (
                                            <span className="text-2xl">{child.emoji}</span>
                                        ) : (
                                            <span>{child.first_name?.[0] || '?'}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-tg-text">
                                            {child.onboarding_first_name || child.first_name}
                                        </h3>
                                        <p className="text-sm text-tg-hint capitalize">{child.role}</p>
                                    </div>
                                    {/* Payment Status Badge */}
                                    <div className="absolute top-4 right-4">
                                        {child.payment_status === 'overdue' ? (
                                            <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md border-2 border-tg-secondary">
                                                Overdue
                                            </div>
                                        ) : child.payment_status === 'paid' ? (
                                            <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md border-2 border-tg-secondary">
                                                Paid
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                {/* Child Info Rows */}
                                <div className="divide-y divide-tg-secondary/50">
                                    {/* Groups Info */}
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Users size={16} className="text-tg-hint" />
                                            <span className="text-xs text-tg-hint uppercase">{t('parent.groups')}</span>
                                        </div>
                                        <div className="space-y-2">
                                            {child.subjects?.map((subject: any, idx: number) => (
                                                <div key={idx} className="flex items-center justify-between py-1">
                                                    <div>
                                                        <p className="text-sm font-medium text-tg-text">{subject.name}</p>
                                                        <p className="text-xs text-tg-hint">
                                                            {t('common.teacher')}: {subject.teacher || 'Mr. Smith'}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs font-medium bg-tg-secondary/50 px-2 py-1 rounded-lg text-tg-hint">
                                                        {subject.group}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Payment History Link */}
                                    <button
                                        onClick={() => setSelectedChildPayments(child)}
                                        className="w-full p-4 flex items-center justify-between hover:bg-tg-secondary/30 transition-colors active:bg-tg-secondary/50"
                                    >
                                        <span className="text-tg-text font-medium">{t('profile.payment_history')}</span>
                                        <ChevronRight size={20} className="text-tg-hint" />
                                    </button>

                                    {/* Attendance Link */}
                                    <button
                                        onClick={() => setSelectedChildAttendance(child)}
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

                {/* Report Bot Problem Button */}
                <button
                    onClick={handleReportProblem}
                    className="w-full bg-red-500/10 rounded-xl p-4 flex items-center justify-between hover:bg-red-500/20 active:bg-red-500/30 transition-colors shadow-sm border border-red-500/20"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-red-500/10 p-2 rounded-lg">
                            <AlertCircle size={20} className="text-red-500" />
                        </div>
                        <span className="text-red-500 font-medium">{t('parent.report_problem')}</span>
                    </div>
                    <ChevronRight size={20} className="text-red-500" />
                </button>

                {/* Switch Role Button */}
                <button
                    onClick={() => {
                        localStorage.removeItem('telegram-user');
                        window.location.reload();
                    }}
                    className="w-full bg-blue-500/10 rounded-xl p-4 flex items-center justify-between hover:bg-blue-500/20 active:bg-blue-500/30 transition-colors shadow-sm border border-blue-500/20"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500/10 p-2 rounded-lg">
                            <Users size={20} className="text-blue-500" />
                        </div>
                        <span className="text-blue-500 font-medium">Switch Role</span>
                    </div>
                    <ChevronRight size={20} className="text-blue-500" />
                </button>
            </div>
        </div>
    );
};

export default ParentProfile;
