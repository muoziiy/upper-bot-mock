import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTelegram } from '../../context/TelegramContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminSection } from '../../pages/admin/components/AdminSection';
import { mockService } from '../../services/mockData';

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
        mockService.updateTeacherSettings(teacherInfo).then((response) => {
            if (response.success) {
                webApp.HapticFeedback.notificationOccurred('success');
                onClose();
            } else {
                webApp.HapticFeedback.notificationOccurred('error');
            }
        });
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
                    className="fixed inset-0 z-[60] bg-[#F2F2F7] dark:bg-[#000000]"
                >
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="h-full overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-[#F2F2F7]/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl border-b border-[#C6C6C8] dark:border-[#38383A] px-4 py-3 flex items-center justify-between z-10">
                            <button onClick={onClose} className="text-blue-500 text-[17px]">
                                Cancel
                            </button>
                            <h2 className="text-[17px] font-semibold text-black dark:text-white">{t('teacher_profile.account_settings')}</h2>
                            <button onClick={handleSave} className="text-blue-500 text-[17px] font-semibold">
                                Done
                            </button>
                        </div>

                        {/* Content */}
                        <div className="pt-6 pb-24">
                            {/* Edit Info Section */}
                            <AdminSection title={t('teacher_profile.edit_info')}>
                                {/* First Name */}
                                <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1C1C1E] border-b border-[#C6C6C8] dark:border-[#38383A]">
                                    <label className="text-[17px] text-black dark:text-white">{t('settings.first_name')}</label>
                                    <input
                                        type="text"
                                        value={teacherInfo.first_name}
                                        onChange={(e) => setTeacherInfo({ ...teacherInfo, first_name: e.target.value })}
                                        className="bg-transparent text-[17px] text-[#8E8E93] text-right focus:outline-none"
                                    />
                                </div>

                                {/* Last Name */}
                                <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1C1C1E] border-b border-[#C6C6C8] dark:border-[#38383A]">
                                    <label className="text-[17px] text-black dark:text-white">{t('settings.last_name')}</label>
                                    <input
                                        type="text"
                                        value={teacherInfo.last_name}
                                        onChange={(e) => setTeacherInfo({ ...teacherInfo, last_name: e.target.value })}
                                        className="bg-transparent text-[17px] text-[#8E8E93] text-right focus:outline-none"
                                    />
                                </div>

                                {/* Email */}
                                <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1C1C1E] border-b border-[#C6C6C8] dark:border-[#38383A]">
                                    <label className="text-[17px] text-black dark:text-white">{t('teacher_profile.email')}</label>
                                    <input
                                        type="email"
                                        value={teacherInfo.email}
                                        onChange={(e) => setTeacherInfo({ ...teacherInfo, email: e.target.value })}
                                        className="bg-transparent text-[17px] text-[#8E8E93] text-right focus:outline-none"
                                    />
                                </div>

                                {/* Phone */}
                                <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1C1C1E]">
                                    <label className="text-[17px] text-black dark:text-white">{t('teacher_profile.phone')}</label>
                                    <input
                                        type="tel"
                                        value={teacherInfo.phone}
                                        onChange={(e) => setTeacherInfo({ ...teacherInfo, phone: e.target.value })}
                                        className="bg-transparent text-[17px] text-[#8E8E93] text-right focus:outline-none"
                                    />
                                </div>
                            </AdminSection>

                            {/* Bio Section */}
                            <AdminSection title={t('teacher_profile.bio')}>
                                <div className="bg-white dark:bg-[#1C1C1E] p-4">
                                    <textarea
                                        value={teacherInfo.bio}
                                        onChange={(e) => setTeacherInfo({ ...teacherInfo, bio: e.target.value })}
                                        rows={4}
                                        className="w-full bg-transparent text-[17px] text-black dark:text-white focus:outline-none resize-none"
                                    />
                                </div>
                            </AdminSection>

                            {/* Subjects Section */}
                            <AdminSection title={t('teacher_profile.subjects')}>
                                <div className="bg-white dark:bg-[#1C1C1E] p-4 flex flex-wrap gap-2">
                                    {teacherInfo.subjects.map((subject, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-full text-[15px] font-medium"
                                        >
                                            {subject}
                                        </span>
                                    ))}
                                </div>
                            </AdminSection>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TeacherAccountSettingsModal;
