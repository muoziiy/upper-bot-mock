import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTelegram } from '../../context/TelegramContext';
import { motion, AnimatePresence } from 'framer-motion';

interface TeacherAccountSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TeacherAccountSettingsModal: React.FC<TeacherAccountSettingsModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { user, webApp } = useTelegram();

    // Mock teacher data
    const [teacherInfo, setTeacherInfo] = useState({
        first_name: user?.first_name || 'Teacher',
        last_name: user?.last_name || '',
        email: 'teacher@example.com',
        phone: '+1234567890',
        bio: 'Experienced educator.',
        subjects: ['Mathematics', 'Physics']
    });

    const handleSave = () => {
        console.log('Saving teacher info:', teacherInfo);
        webApp.HapticFeedback.notificationOccurred('success');
        onClose();
    };

    // Handle back button
    useEffect(() => {
        if (isOpen) {
            webApp.BackButton.show();
            webApp.BackButton.onClick(onClose);
        } else {
            webApp.BackButton.hide();
            webApp.BackButton.offClick(onClose);
        }
        return () => {
            webApp.BackButton.offClick(onClose);
        };
    }, [isOpen, onClose, webApp]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] bg-tg-secondary"
                >
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="h-full overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-tg-bg/95 backdrop-blur-xl border-b border-tg-secondary/50 px-4 py-3 flex items-center justify-center z-10">
                            <h2 className="text-lg font-bold text-tg-text">{t('teacher_profile.account_settings')}</h2>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-6 pb-24">
                            {/* Edit Info Section */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-medium text-tg-hint uppercase px-4">{t('teacher_profile.edit_info')}</h3>

                                <div className="bg-tg-bg rounded-xl overflow-hidden">
                                    {/* First Name */}
                                    <div className="flex items-center px-4 py-3 border-b border-tg-secondary/50">
                                        <label className="w-24 text-tg-text font-medium">{t('settings.first_name')}</label>
                                        <input
                                            type="text"
                                            value={teacherInfo.first_name}
                                            onChange={(e) => setTeacherInfo({ ...teacherInfo, first_name: e.target.value })}
                                            className="flex-1 bg-transparent text-tg-text focus:outline-none text-right placeholder-tg-hint"
                                        />
                                    </div>

                                    {/* Last Name */}
                                    <div className="flex items-center px-4 py-3 border-b border-tg-secondary/50">
                                        <label className="w-24 text-tg-text font-medium">{t('settings.last_name')}</label>
                                        <input
                                            type="text"
                                            value={teacherInfo.last_name}
                                            onChange={(e) => setTeacherInfo({ ...teacherInfo, last_name: e.target.value })}
                                            className="flex-1 bg-transparent text-tg-text focus:outline-none text-right placeholder-tg-hint"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="flex items-center px-4 py-3 border-b border-tg-secondary/50">
                                        <label className="w-24 text-tg-text font-medium">{t('teacher_profile.email')}</label>
                                        <input
                                            type="email"
                                            value={teacherInfo.email}
                                            onChange={(e) => setTeacherInfo({ ...teacherInfo, email: e.target.value })}
                                            className="flex-1 bg-transparent text-tg-text focus:outline-none text-right placeholder-tg-hint"
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div className="flex items-center px-4 py-3">
                                        <label className="w-24 text-tg-text font-medium">{t('teacher_profile.phone')}</label>
                                        <input
                                            type="tel"
                                            value={teacherInfo.phone}
                                            onChange={(e) => setTeacherInfo({ ...teacherInfo, phone: e.target.value })}
                                            className="flex-1 bg-transparent text-tg-text focus:outline-none text-right placeholder-tg-hint"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bio Section */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-medium text-tg-hint uppercase px-4">{t('teacher_profile.bio')}</h3>
                                <div className="bg-tg-bg rounded-xl p-4">
                                    <textarea
                                        value={teacherInfo.bio}
                                        onChange={(e) => setTeacherInfo({ ...teacherInfo, bio: e.target.value })}
                                        rows={4}
                                        className="w-full bg-transparent text-tg-text focus:outline-none resize-none placeholder-tg-hint"
                                    />
                                </div>
                            </div>

                            {/* Subjects Section */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-medium text-tg-hint uppercase px-4">{t('teacher_profile.subjects')}</h3>
                                <div className="bg-tg-bg rounded-xl p-4 flex flex-wrap gap-2">
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

                            {/* Save Button */}
                            <div className="pt-4">
                                <motion.button
                                    onClick={handleSave}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-tg-button text-tg-button-text py-3 rounded-xl font-bold text-lg shadow-sm"
                                >
                                    {t('teacher_profile.save_changes')}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TeacherAccountSettingsModal;
