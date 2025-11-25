import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';
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
                    className="fixed inset-0 z-[60] bg-tg-bg"
                >
                    {showSuccess ? (
                        <div className="flex flex-col items-center justify-center h-full">
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
                            <div className="sticky top-0 bg-tg-bg/95 backdrop-blur-xl border-b border-tg-hint/10 px-4 py-4 z-10">
                                <h1 className="text-xl font-bold text-tg-text">{t('teacher.schedule_class')}</h1>
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-tg-hint mb-2">
                                        <Users size={16} className="inline mr-1" />
                                        {t('teacher.select_group')} <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.groupId}
                                        onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                                        className="w-full bg-tg-secondary text-tg-text px-4 py-3 rounded-xl border border-tg-hint/10 focus:border-tg-button focus:outline-none transition-colors"
                                    >
                                        <option value="">Select a group...</option>
                                        {groups.map((group) => (
                                            <option key={group.id} value={group.id}>{group.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-tg-hint mb-2">
                                            <Calendar size={16} className="inline mr-1" />
                                            {t('teacher.date')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full bg-tg-secondary text-tg-text px-4 py-3 rounded-xl border border-tg-hint/10 focus:border-tg-button focus:outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-tg-hint mb-2">
                                            <Clock size={16} className="inline mr-1" />
                                            {t('teacher.time')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            className="w-full bg-tg-secondary text-tg-text px-4 py-3 rounded-xl border border-tg-hint/10 focus:border-tg-button focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-tg-hint mb-2">
                                        {t('teacher.duration')} (min)
                                    </label>
                                    <select
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full bg-tg-secondary text-tg-text px-4 py-3 rounded-xl border border-tg-hint/10 focus:border-tg-button focus:outline-none transition-colors"
                                    >
                                        <option value="30">30 minutes</option>
                                        <option value="45">45 minutes</option>
                                        <option value="60">60 minutes</option>
                                        <option value="90">90 minutes</option>
                                        <option value="120">120 minutes</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-tg-hint mb-2">
                                        <MapPin size={16} className="inline mr-1" />
                                        {t('teacher.location')}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full bg-tg-secondary text-tg-text px-4 py-3 rounded-xl border border-tg-hint/10 focus:border-tg-button focus:outline-none transition-colors"
                                        placeholder="e.g. Room 101 or Online Link"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-tg-hint mb-2">
                                        {t('teacher.topic')}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.topic}
                                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                        className="w-full bg-tg-secondary text-tg-text px-4 py-3 rounded-xl border border-tg-hint/10 focus:border-tg-button focus:outline-none transition-colors"
                                        placeholder="e.g. Chapter 5 Review"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.98 }}
                                        onClick={onClose}
                                        className="flex-1 bg-tg-secondary text-tg-text py-3 rounded-xl font-medium"
                                    >
                                        {t('teacher.cancel')}
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 bg-tg-button text-tg-button-text py-3 rounded-xl font-medium"
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
