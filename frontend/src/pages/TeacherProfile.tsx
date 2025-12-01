import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTelegram } from '../context/TelegramContext';
import { useAppData } from '../context/AppDataContext';
import TeacherAccountSettingsModal from '../components/teacher/TeacherAccountSettingsModal';
import TeacherPaymentHistoryModal from '../components/teacher/TeacherPaymentHistoryModal';
import { AdminSection } from './admin/components/AdminSection';
import { AdminListItem } from './admin/components/AdminListItem';

const TeacherProfile: React.FC = () => {
    const { t } = useTranslation();
    const { user, webApp } = useTelegram();
    const { dashboardData, logout } = useAppData();
    const [showAccountSettings, setShowAccountSettings] = useState(false);
    const [showPaymentHistory, setShowPaymentHistory] = useState(false);

    // Generate random 6-digit ID (consistent for session)
    const teacherId = useMemo(() => {
        return Math.floor(100000 + Math.random() * 900000);
    }, []);

    // Mock teacher stats
    const stats = {
        totalStudents: 45,
        activeGroups: 6,
        classesThisMonth: 28
    };

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] pb-24 pt-6 text-black dark:text-white">
            {/* Profile Header */}
            <div className="flex flex-col items-center justify-center mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden shadow-lg mb-3">
                    {user?.emoji ? (
                        <span className="text-5xl">{user.emoji}</span>
                    ) : (
                        <span>{user?.first_name?.[0] || 'T'}</span>
                    )}
                </div>
                <h1 className="text-2xl font-bold text-black dark:text-white mt-2">
                    {user?.first_name} {user?.last_name}
                </h1>
                <div className="flex items-center gap-2 text-[#8E8E93]">
                    <span className="capitalize">{dashboardData?.user.role}</span>
                    <span>•</span>
                    <span>ID: #{teacherId}</span>
                </div>
            </div>

            {/* Stats Overview */}
            <AdminSection>
                <div className="flex items-center justify-between px-2 py-1">
                    <div className="flex flex-col items-center gap-1 flex-1">
                        <span className="text-2xl">👥</span>
                        <span className="text-xl font-bold">{stats.totalStudents}</span>
                        <span className="text-[10px] text-[#8E8E93] uppercase font-medium">{t('teacher_profile.students')}</span>
                    </div>
                    <div className="w-[0.5px] h-10 bg-[#C6C6C8] dark:bg-[#38383A]" />
                    <div className="flex flex-col items-center gap-1 flex-1">
                        <span className="text-2xl">🏫</span>
                        <span className="text-xl font-bold">{stats.activeGroups}</span>
                        <span className="text-[10px] text-[#8E8E93] uppercase font-medium">{t('teacher_profile.groups')}</span>
                    </div>
                    <div className="w-[0.5px] h-10 bg-[#C6C6C8] dark:bg-[#38383A]" />
                    <div className="flex flex-col items-center gap-1 flex-1">
                        <span className="text-2xl">📅</span>
                        <span className="text-xl font-bold">{stats.classesThisMonth}</span>
                        <span className="text-[10px] text-[#8E8E93] uppercase font-medium">{t('teacher_profile.classes')}</span>
                    </div>
                </div>
            </AdminSection>

            {/* Settings Group */}
            <AdminSection title={t('teacher_profile.settings')}>
                <AdminListItem
                    title={t('teacher_profile.account_settings')}
                    icon="⚙️"
                    iconColor="bg-orange-500"
                    onClick={() => setShowAccountSettings(true)}
                    showChevron
                />
                <AdminListItem
                    title={t('teacher_profile.payment_history')}
                    icon="💰"
                    iconColor="bg-green-500"
                    onClick={() => setShowPaymentHistory(true)}
                    showChevron
                    isLast
                />
            </AdminSection>

            {/* App Info Group */}
            <AdminSection title={t('teacher_profile.app')}>
                <AdminListItem
                    title="Switch Role"
                    icon="🔄"
                    iconColor="bg-blue-500"
                    onClick={() => {
                        webApp.HapticFeedback.impactOccurred('medium');
                        logout();
                    }}
                    showChevron
                />
                <AdminListItem
                    title={t('teacher_profile.log_out')}
                    icon="🚪"
                    iconColor="bg-red-500"
                    onClick={() => {
                        webApp.HapticFeedback.impactOccurred('medium');
                        logout();
                    }}
                    destructive
                    isLast
                />
            </AdminSection>

            {/* Modals */}
            {showAccountSettings && (
                <TeacherAccountSettingsModal
                    isOpen={showAccountSettings}
                    onClose={() => setShowAccountSettings(false)}
                />
            )}
            {showPaymentHistory && (
                <TeacherPaymentHistoryModal
                    isOpen={showPaymentHistory}
                    onClose={() => setShowPaymentHistory(false)}
                />
            )}
        </div>
    );
};

export default TeacherProfile;
