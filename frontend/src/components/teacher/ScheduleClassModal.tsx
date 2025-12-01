import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegram } from '../../context/TelegramContext';
import { useTranslation } from 'react-i18next';
import { AdminSection } from '../../pages/admin/components/AdminSection';

interface ScheduleClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    groups: { id: string; name: string }[];
}

const ScheduleClassModal: React.FC<ScheduleClassModalProps> = ({ isOpen, onClose, groups }) => {
    const { webApp } = useTelegram();
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        groupId: '',
        date: '',
        time: '',
        duration: '60',
        location: '',
        topic: ''
    });

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.groupId || !formData.date || !formData.time) {
            webApp.HapticFeedback.notificationOccurred('error');
            return;
        }

        console.log('Schedule class:', formData);
        webApp.HapticFeedback.notificationOccurred('success');

        // Show Telegram native popup with emoji
        webApp.showPopup({
            title: t('teacher.class_scheduled'),
            message: '✅ ' + t('teacher.class_scheduled_success'),
            buttons: [{ type: 'close' }]
        }, () => {
            // Popup closed callback
            onClose();
            setFormData({
                groupId: '',
                date: '',
                time: '',
                duration: '60',
                location: '',
                topic: ''
            });
        });
    };

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
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        transition={{ type: 'spring', damping: 32, stiffness: 380 }}
                        className="h-full overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-[#F2F2F7]/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl border-b border-[#C6C6C8] dark:border-[#38383A] px-4 py-3 flex items-center justify-between z-10">
                            <button onClick={onClose} className="text-blue-500 text-[17px]">
                                Cancel
                            </button>
                            <h1 className="text-[17px] font-semibold text-black dark:text-white">{t('teacher.schedule_class')}</h1>
                            <button onClick={handleSubmit} className="text-blue-500 text-[17px] font-semibold">
                                Schedule
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="pt-6 pb-24">
                            {/* Group & Topic */}
                            <AdminSection title={t('teacher.details')}>
                                <div className="px-4 py-3 bg-white dark:bg-[#1C1C1E] border-b border-[#C6C6C8] dark:border-[#38383A]">
                                    <select
                                        value={formData.groupId}
                                        onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                                        className="w-full bg-transparent text-[17px] text-black dark:text-white focus:outline-none"
                                    >
                                        <option value="">Select Group...</option>
                                        {groups.map((group) => (
                                            <option key={group.id} value={group.id}>{group.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="px-4 py-3 bg-white dark:bg-[#1C1C1E]">
                                    <input
                                        type="text"
                                        value={formData.topic}
                                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                        className="w-full bg-transparent text-[17px] text-black dark:text-white focus:outline-none"
                                        placeholder={t('teacher.topic') + " (Optional)"}
                                    />
                                </div>
                            </AdminSection>

                            {/* Date & Time */}
                            <AdminSection title={t('teacher.time')}>
                                <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1C1C1E] border-b border-[#C6C6C8] dark:border-[#38383A]">
                                    <label className="text-[17px] text-black dark:text-white">{t('teacher.date')}</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="bg-transparent text-[17px] text-[#8E8E93] text-right focus:outline-none"
                                    />
                                </div>
                                <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1C1C1E] border-b border-[#C6C6C8] dark:border-[#38383A]">
                                    <label className="text-[17px] text-black dark:text-white">{t('teacher.time')}</label>
                                    <input
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        className="bg-transparent text-[17px] text-[#8E8E93] text-right focus:outline-none"
                                    />
                                </div>
                                <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1C1C1E]">
                                    <label className="text-[17px] text-black dark:text-white">{t('teacher.duration')}</label>
                                    <select
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="bg-transparent text-[17px] text-[#8E8E93] text-right focus:outline-none"
                                    >
                                        <option value="30">30 min</option>
                                        <option value="45">45 min</option>
                                        <option value="60">60 min</option>
                                        <option value="90">90 min</option>
                                        <option value="120">120 min</option>
                                    </select>
                                </div>
                            </AdminSection>

                            {/* Location */}
                            <AdminSection title={t('teacher.location')}>
                                <div className="px-4 py-3 bg-white dark:bg-[#1C1C1E]">
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full bg-transparent text-[17px] text-black dark:text-white focus:outline-none"
                                        placeholder="e.g. Room 101"
                                    />
                                </div>
                            </AdminSection>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ScheduleClassModal;
