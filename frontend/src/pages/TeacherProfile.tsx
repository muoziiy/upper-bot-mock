import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTelegram } from '../context/TelegramContext';
import { Settings2, DollarSign, Users, Calendar, Award } from 'lucide-react';
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
        <div className="min-h-screen bg-tg-secondary pb-24 pt-4 text-tg-text">
            <div className="px-4">
                {/* Profile Header */}
                <div className="bg-tg-bg rounded-xl p-6 mb-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-tg-button to-tg-button/70 flex items-center justify-center text-2xl font-bold text-tg-button-text">
                            {user?.first_name?.[0] || 'T'}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">
                                {user?.first_name || 'Teacher'} {user?.last_name || ''}
                            </h2>
                            <p className="text-sm text-tg-hint">@{user?.username || 'teacher'}</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-tg-bg rounded-lg p-4 text-center">
                        <Users className="w-5 h-5 mx-auto mb-2 text-tg-button" />
                        <p className="text-2xl font-bold">{stats.totalStudents}</p>
                        <p className="text-xs text-tg-hint">{t('teacher_profile.total_students')}</p>
                    </div>
                    <div className="bg-tg-bg rounded-lg p-4 text-center">
                        <Award className="w-5 h-5 mx-auto mb-2 text-tg-button" />
                        <p className="text-2xl font-bold">{stats.activeGroups}</p>
                        <p className="text-xs text-tg-hint">{t('teacher_profile.active_groups')}</p>
                    </div>
                    <div className="bg-tg-bg rounded-lg p-4 text-center">
                        <Calendar className="w-5 h-5 mx-auto mb-2 text-tg-button" />
                        <p className="text-2xl font-bold">{stats.classesThisMonth}</p>
                        <p className="text-xs text-tg-hint">{t('teacher_profile.classes_this_month')}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    {/* Account Settings Button */}
                    <button
                        onClick={() => setShowAccountSettings(true)}
                        className="w-full bg-tg-bg rounded-xl p-4 flex items-center gap-4 hover:bg-tg-bg/80 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-full bg-tg-button/10 flex items-center justify-center">
                            <Settings2 className="w-5 h-5 text-tg-button" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-medium">{t('teacher_profile.account_settings')}</p>
                            <p className="text-sm text-tg-hint">{t('teacher_profile.edit_info')}</p>
                        </div>
                        <svg className="w-5 h-5 text-tg-hint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Payment History Button */}
                    <button
                        onClick={() => setShowPaymentHistory(true)}
                        className="w-full bg-tg-bg rounded-xl p-4 flex items-center gap-4 hover:bg-tg-bg/80 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-full bg-tg-button/10 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-tg-button" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-medium">{t('teacher_profile.payment_history')}</p>
                            <p className="text-sm text-tg-hint">{t('teacher_profile.salary')}</p>
                        </div>
                        <svg className="w-5 h-5 text-tg-hint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Modals */}
            {showAccountSettings && (
                <TeacherAccountSettingsModal onClose={() => setShowAccountSettings(false)} />
            )}
            {showPaymentHistory && (
                <TeacherPaymentHistoryModal onClose={() => setShowPaymentHistory(false)} />
            )}
        </div>
    );
};

export default TeacherProfile;
