import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTelegram } from '../../context/TelegramContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface TeacherAccountSettingsModalProps {
    onClose: () => void;
}

const TeacherAccountSettingsModal: React.FC<TeacherAccountSettingsModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const { user, webApp } = useTelegram();

    // Mock teacher data
    const [teacherInfo, setTeacherInfo] = useState({
        first_name: user?.first_name || 'John',
        last_name: user?.last_name || 'Smith',
        email: 'john.smith@example.com',
        phone: '+1234567890',
        bio: 'Experienced mathematics teacher with 10+ years of teaching experience.',
        subjects: ['Mathematics', 'Physics', 'Chemistry']
    });

    const handleSave = () => {
        // TODO: Implement save functionality
        console.log('Saving teacher info:', teacherInfo);
        onClose();
    };

    // Handle back button
    React.useEffect(() => {
        if (webApp) {
            webApp.BackButton.show();
            webApp.BackButton.onClick(onClose);
            return () => {
                webApp.BackButton.hide();
                webApp.BackButton.offClick(onClose);
            };
        }
    }, [webApp, onClose]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-tg-secondary z-50 overflow-y-auto"
            >
                {/* Header */}
                <div className="sticky top-0 bg-tg-bg border-b border-tg-secondary/50 px-4 py-3 flex items-center justify-between z-10">
                    <h2 className="text-lg font-bold">{t('teacher_profile.account_settings')}</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-tg-secondary flex items-center justify-center hover:bg-tg-secondary/80 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-6 pb-24">
                    {/* Edit Info Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-tg-hint uppercase">{t('teacher_profile.edit_info')}</h3>

                        {/* First Name */}
                        <div className="space-y-2">
                            <label className="text-xs text-tg-hint ml-4 uppercase font-medium">
                                {t('settings.first_name')}
                            </label>
                            <input
                                type="text"
                                value={teacherInfo.first_name}
                                onChange={(e) => setTeacherInfo({ ...teacherInfo, first_name: e.target.value })}
                                className="w-full bg-tg-bg p-4 rounded-xl text-tg-text border border-tg-secondary/50 focus:border-tg-button focus:outline-none"
                            />
                        </div>

                        {/* Last Name */}
                        <div className="space-y-2">
                            <label className="text-xs text-tg-hint ml-4 uppercase font-medium">
                                {t('settings.last_name')}
                            </label>
                            <input
                                type="text"
                                value={teacherInfo.last_name}
                                onChange={(e) => setTeacherInfo({ ...teacherInfo, last_name: e.target.value })}
                                className="w-full bg-tg-bg p-4 rounded-xl text-tg-text border border-tg-secondary/50 focus:border-tg-button focus:outline-none"
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-xs text-tg-hint ml-4 uppercase font-medium">
                                {t('teacher_profile.email')}
                            </label>
                            <input
                                type="email"
                                value={teacherInfo.email}
                                onChange={(e) => setTeacherInfo({ ...teacherInfo, email: e.target.value })}
                                className="w-full bg-tg-bg p-4 rounded-xl text-tg-text border border-tg-secondary/50 focus:border-tg-button focus:outline-none"
                            />
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-xs text-tg-hint ml-4 uppercase font-medium">
                                {t('teacher_profile.phone')}
                            </label>
                            <input
                                type="tel"
                                value={teacherInfo.phone}
                                onChange={(e) => setTeacherInfo({ ...teacherInfo, phone: e.target.value })}
                                className="w-full bg-tg-bg p-4 rounded-xl text-tg-text border border-tg-secondary/50 focus:border-tg-button focus:outline-none"
                            />
                        </div>

                        {/* Bio */}
                        <div className="space-y-2">
                            <label className="text-xs text-tg-hint ml-4 uppercase font-medium">
                                {t('teacher_profile.bio')}
                            </label>
                            <textarea
                                value={teacherInfo.bio}
                                onChange={(e) => setTeacherInfo({ ...teacherInfo, bio: e.target.value })}
                                rows={4}
                                className="w-full bg-tg-bg p-4 rounded-xl text-tg-text border border-tg-secondary/50 focus:border-tg-button focus:outline-none resize-none"
                            />
                        </div>

                        {/* Subjects */}
                        <div className="space-y-2">
                            <label className="text-xs text-tg-hint ml-4 uppercase font-medium">
                                {t('teacher_profile.subjects')}
                            </label>
                            <div className="flex flex-wrap gap-2 p-4 bg-tg-bg rounded-xl">
                                {teacherInfo.subjects.map((subject, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1.5 bg-tg-button/10 text-tg-button rounded-full text-sm font-medium"
                                    >
                                        {subject}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-tg-secondary text-tg-text px-6 py-3 rounded-xl font-medium hover:bg-tg-secondary/80 transition-colors"
                        >
                            {t('teacher.cancel')}
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 bg-tg-button text-tg-button-text px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
                        >
                            {t('teacher_profile.save_changes')}
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TeacherAccountSettingsModal;
