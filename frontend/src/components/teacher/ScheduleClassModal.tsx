import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Removed unused imports
import { useTelegram } from '../../context/TelegramContext';
import { useTranslation } from 'react-i18next';
import Lottie from 'lottie-react';
import duckSuccess from '../../assets/animations/duck_success.json';

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
    const [showSuccess, setShowSuccess] = useState(false);

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
        setShowSuccess(true);

        setTimeout(() => {
            setShowSuccess(false);
            onClose();
            setFormData({
                groupId: '',
                date: '',
                time: '',
                duration: '60',
                location: '',
                topic: ''
            });
        }, 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] bg-tg-secondary"
                >
                    {showSuccess ? (
                        <div className="flex flex-col items-center justify-center h-full bg-tg-bg">
                            <div className="w-48 h-48">
                                <Lottie animationData={duckSuccess} loop={false} />
                            </div>
                            <h2 className="text-xl font-bold mt-4 text-tg-text">{t('teacher.class_scheduled')}</h2>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            transition={{ type: 'spring', damping: 32, stiffness: 380 }}
                            className="h-full overflow-y-auto"
                        >
                            <div className="sticky top-0 bg-tg-bg/95 backdrop-blur-xl border-b border-tg-secondary/50 px-4 py-3 flex items-center justify-center z-10">
                                <h1 className="text-lg font-bold text-tg-text">{t('teacher.schedule_class')}</h1>
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 space-y-6 pb-24">
                                {/* Group & Topic */}
                                <div className="space-y-2">
                                    <h3 className="text-xs font-medium text-tg-hint uppercase px-4">{t('teacher.details')}</h3>
                                    <div className="bg-tg-bg rounded-xl overflow-hidden">
                                        <div className="flex items-center px-4 py-3 border-b border-tg-secondary/50">
                                            <label className="w-24 text-tg-text font-medium">{t('teacher.group')}</label>
                                            <select
                                                value={formData.groupId}
                                                onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                                                className="flex-1 bg-transparent text-tg-text focus:outline-none text-right"
                                            >
                                                <option value="">Select...</option>
                                                {groups.map((group) => (
                                                    <option key={group.id} value={group.id}>{group.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-center px-4 py-3">
                                            <label className="w-24 text-tg-text font-medium">{t('teacher.topic')}</label>
                                            <input
                                                type="text"
                                                value={formData.topic}
                                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                                className="flex-1 bg-transparent text-tg-text focus:outline-none text-right placeholder-tg-hint"
                                                placeholder="Optional"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className="space-y-2">
                                    <h3 className="text-xs font-medium text-tg-hint uppercase px-4">{t('teacher.time')}</h3>
                                    <div className="bg-tg-bg rounded-xl overflow-hidden">
                                        <div className="flex items-center px-4 py-3 border-b border-tg-secondary/50">
                                            <label className="w-24 text-tg-text font-medium">{t('teacher.date')}</label>
                                            <input
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                className="flex-1 bg-transparent text-tg-text focus:outline-none text-right"
                                            />
                                        </div>
                                        <div className="flex items-center px-4 py-3 border-b border-tg-secondary/50">
                                            <label className="w-24 text-tg-text font-medium">{t('teacher.time')}</label>
                                            <input
                                                type="text"
                                                value={formData.time}
                                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                                className="flex-1 bg-transparent text-tg-text focus:outline-none text-right placeholder-tg-hint"
                                                placeholder="HH:MM"
                                            />
                                        </div>
                                        <div className="flex items-center px-4 py-3">
                                            <label className="w-24 text-tg-text font-medium">{t('teacher.duration')}</label>
                                            <select
                                                value={formData.duration}
                                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                className="flex-1 bg-transparent text-tg-text focus:outline-none text-right"
                                            >
                                                <option value="30">30 min</option>
                                                <option value="45">45 min</option>
                                                <option value="60">60 min</option>
                                                <option value="90">90 min</option>
                                                <option value="120">120 min</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="space-y-2">
                                    <h3 className="text-xs font-medium text-tg-hint uppercase px-4">{t('teacher.location')}</h3>
                                    <div className="bg-tg-bg rounded-xl overflow-hidden">
                                        <div className="flex items-center px-4 py-3">
                                            <label className="w-24 text-tg-text font-medium">{t('teacher.room')}</label>
                                            <input
                                                type="text"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                className="flex-1 bg-transparent text-tg-text focus:outline-none text-right placeholder-tg-hint"
                                                placeholder="e.g. Room 101"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <motion.button
                                        type="submit"
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full bg-tg-button text-tg-button-text py-3 rounded-xl font-bold text-lg shadow-sm"
                                    >
                                        {t('teacher.schedule')}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ScheduleClassModal;
