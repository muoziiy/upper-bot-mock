import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTelegram } from '../context/TelegramContext';
import { Settings2, DollarSign, Users, Calendar, Award, ChevronRight, LogOut } from 'lucide-react';
import TeacherAccountSettingsModal from '../components/teacher/TeacherAccountSettingsModal';
import TeacherPaymentHistoryModal from '../components/teacher/TeacherPaymentHistoryModal';

const TeacherProfile: React.FC = () => {
    const { t } = useTranslation();
    const { user, webApp } = useTelegram();
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

    // Get profile photo from Telegram
    const profilePhotoUrl = user?.photo_url;

    return (
        <div className="min-h-screen bg-tg-secondary pb-24 pt-6 text-tg-text">
            {/* Profile Header */}
            <div className="flex flex-col items-center justify-center mb-6 px-4">
                {/* Profile Photo */}
                <div className="w-24 h-24 rounded-full mb-3 overflow-hidden shadow-lg border-2 border-tg-bg">
                    {profilePhotoUrl ? (
                        <img
                            src={profilePhotoUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white">
                            {user?.first_name?.[0] || 'T'}
                        </div>
                    )}
                </div>

                {/* Name */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold">{user?.first_name || 'Teacher'} {user?.last_name || ''}</h1>
                    <div className="flex items-center justify-center gap-2 text-sm text-tg-hint mt-1">
                        <span className="capitalize">{t('teacher_profile.role_teacher')}</span>
                        <span>•</span>
                        <span>ID: #{teacherId}</span>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-2 mb-6 px-4">
                <div className="bg-tg-bg p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm border border-tg-hint/5">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2">
                        <Users size={18} />
                    </div>
                    <p className="text-xl font-bold">{stats.totalStudents}</p>
                    <p className="text-[10px] text-tg-hint uppercase font-medium mt-0.5">{t('teacher_profile.students')}</p>
                </div>
                <div className="bg-tg-bg p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm border border-tg-hint/5">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 mb-2">
                        <Award size={18} />
                    </div>
                    <p className="text-xl font-bold">{stats.activeGroups}</p>
                    <p className="text-[10px] text-tg-hint uppercase font-medium mt-0.5">{t('teacher_profile.groups')}</p>
                </div>
                <div className="bg-tg-bg p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm border border-tg-hint/5">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-2">
                        <Calendar size={18} />
                    </div>
                    <p className="text-xl font-bold">{stats.classesThisMonth}</p>
                    <p className="text-[10px] text-tg-hint uppercase font-medium mt-0.5">{t('teacher_profile.classes')}</p>
                </div>
            </div>

            {/* Settings Group */}
            <div className="space-y-2 mb-6 px-4">
                <h3 className="text-xs font-semibold text-tg-hint uppercase px-4 mb-3">{t('teacher_profile.settings')}</h3>
                <div className="bg-tg-bg rounded-xl overflow-hidden shadow-sm border border-tg-hint/5">
                    <button
                        onClick={() => setShowAccountSettings(true)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-tg-secondary/50 active:bg-tg-secondary/30 transition-colors"
                    >
                        <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white flex-shrink-0">
                            <Settings2 size={16} />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-medium text-tg-text text-[15px]">{t('teacher_profile.account_settings')}</p>
                        </div>
                        <ChevronRight size={20} className="text-tg-hint/40 flex-shrink-0" />
                    </button>

                    <button
                        onClick={() => setShowPaymentHistory(true)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-tg-secondary/30 transition-colors"
                    >
                        <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center text-white flex-shrink-0">
                            <DollarSign size={16} />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-medium text-tg-text text-[15px]">{t('teacher_profile.payment_history')}</p>
                        </div>
                        <ChevronRight size={20} className="text-tg-hint/40 flex-shrink-0" />
                    </button>
                </div>
            </div>

            {/* App Info Group */}
            <div className="space-y-2 px-4">
                <h3 className="text-xs font-semibold text-tg-hint uppercase px-4 mb-3">{t('teacher_profile.app')}</h3>
                <div className="bg-tg-bg rounded-xl overflow-hidden shadow-sm border border-tg-hint/5">
                    <button
                        onClick={() => {
                            webApp.HapticFeedback.impactOccurred('medium');
                            // Implement logout logic here
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-tg-secondary/30 transition-colors"
                    >
                        <div className="w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center text-white flex-shrink-0">
                            <LogOut size={16} />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-medium text-red-500 text-[15px]">{t('teacher_profile.log_out')}</p>
                        </div>
                    </button>
                </div>
            </div>

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
