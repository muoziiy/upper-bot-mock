import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTelegram } from '../context/TelegramContext';
import { Settings2, DollarSign, Users, Calendar, Award, ChevronRight, LogOut } from 'lucide-react';
import TeacherAccountSettingsModal from '../components/teacher/TeacherAccountSettingsModal';
import TeacherPaymentHistoryModal from '../components/teacher/TeacherPaymentHistoryModal';

const TeacherProfile: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useTelegram();
    const [showAccountSettings, setShowAccountSettings] = useState(false);
    const [showPaymentHistory, setShowPaymentHistory] = useState(false);

    // Mock teacher stats
    const stats = {
        totalStudents: 45,
        activeGroups: 6,
        classesThisMonth: 28
    };

    return (
        <div className="min-h-screen bg-tg-secondary pb-24 pt-4 text-tg-text px-4">
            {/* Profile Header */}
            <div className="flex flex-col items-center justify-center mb-6 py-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg mb-3">
                    {user?.first_name?.[0] || 'T'}
                </div>
                <h2 className="text-2xl font-bold text-center">
                    {user?.first_name || 'Teacher'} {user?.last_name || ''}
                </h2>
                <p className="text-tg-hint text-center">@{user?.username || 'teacher'}</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-tg-bg p-3 rounded-xl flex flex-col items-center justify-center text-center shadow-sm border border-tg-hint/5">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-1">
                        <Users size={16} />
                    </div>
                    <p className="text-lg font-bold">{stats.totalStudents}</p>
                    <p className="text-[10px] text-tg-hint uppercase font-medium">{t('teacher_profile.students')}</p>
                </div>
                <div className="bg-tg-bg p-3 rounded-xl flex flex-col items-center justify-center text-center shadow-sm border border-tg-hint/5">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 mb-1">
                        <Award size={16} />
                    </div>
                    <p className="text-lg font-bold">{stats.activeGroups}</p>
                    <p className="text-[10px] text-tg-hint uppercase font-medium">{t('teacher_profile.groups')}</p>
                </div>
                <div className="bg-tg-bg p-3 rounded-xl flex flex-col items-center justify-center text-center shadow-sm border border-tg-hint/5">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-1">
                        <Calendar size={16} />
                    </div>
                    <p className="text-lg font-bold">{stats.classesThisMonth}</p>
                    <p className="text-[10px] text-tg-hint uppercase font-medium">{t('teacher_profile.classes')}</p>
                </div>
            </div>

            {/* Settings Group */}
            <div className="space-y-2 mb-6">
                <h3 className="text-xs font-medium text-tg-hint uppercase px-4">{t('teacher_profile.settings')}</h3>
                <div className="bg-tg-bg rounded-xl overflow-hidden shadow-sm border border-tg-hint/5">
                    <button
                        onClick={() => setShowAccountSettings(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 border-b border-tg-secondary/50 active:bg-tg-secondary/50 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white">
                            <Settings2 size={18} />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-medium text-tg-text text-sm">{t('teacher_profile.account_settings')}</p>
                        </div>
                        <ChevronRight size={20} className="text-tg-hint/50" />
                    </button>

                    <button
                        onClick={() => setShowPaymentHistory(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 active:bg-tg-secondary/50 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-white">
                            <DollarSign size={18} />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-medium text-tg-text text-sm">{t('teacher_profile.payment_history')}</p>
                        </div>
                        <ChevronRight size={20} className="text-tg-hint/50" />
                    </button>
                </div>
            </div>

            {/* App Info Group */}
            <div className="space-y-2">
                <h3 className="text-xs font-medium text-tg-hint uppercase px-4">{t('teacher_profile.app')}</h3>
                <div className="bg-tg-bg rounded-xl overflow-hidden shadow-sm border border-tg-hint/5">
                    <button className="w-full flex items-center gap-3 px-4 py-3 active:bg-tg-secondary/50 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center text-white">
                            <LogOut size={18} />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-medium text-tg-text text-sm">Log Out</p>
                        </div>
                    </button>
                </div>
                <p className="text-center text-xs text-tg-hint py-4">
                    Version 1.0.0
                </p>
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
