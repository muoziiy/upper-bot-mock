import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users } from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';
import { useTranslation } from 'react-i18next';

interface CreateExamModalProps {
    isOpen: boolean;
    onClose: () => void;
    groups: { id: string; name: string }[];
}

const CreateExamModal: React.FC<CreateExamModalProps> = ({ isOpen, onClose, groups }) => {
    const { webApp } = useTelegram();
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        type: 'online' as 'online' | 'offline',
        groupId: ''
    });

    useEffect(() => {
        if (isOpen) {
            webApp.BackButton.show();
            webApp.BackButton.onClick(onClose);
        } else {
            webApp.BackButton.hide();
        }

        return () => {
            webApp.BackButton.offClick(onClose);
        };
    }, [isOpen, onClose, webApp]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Create exam:', formData);
        // TODO: Add API call to create exam
        webApp.HapticFeedback.notificationOccurred('success');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-tg-bg"
                >
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        transition={{ type: 'spring', damping: 32, stiffness: 380 }}
                        className="h-full overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-tg-bg/95 backdrop-blur-xl border-b border-tg-hint/10 px-4 py-4 z-10">
                            <h1 className="text-xl font-bold text-tg-text">{t('teacher.create_exam')}</h1>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-tg-hint mb-2">
                                    {t('teacher.exam_title')}
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-tg-secondary text-tg-text px-4 py-3 rounded-xl border border-tg-hint/10 focus:border-tg-button focus:outline-none transition-colors"
                                    placeholder="e.g., Mid-Term Exam"
                                    required
                                />
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-tg-hint mb-2">
                                    <Calendar size={16} className="inline mr-1" />
                                    {t('teacher.exam_date')}
                                </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full bg-tg-secondary text-tg-text px-4 py-3 rounded-xl border border-tg-hint/10 focus:border-tg-button focus:outline-none transition-colors"
                                    required
                                />
                            </div>

                            {/* Time */}
                            <div>
                                <label className="block text-sm font-medium text-tg-hint mb-2">
                                    <Clock size={16} className="inline mr-1" />
                                    {t('teacher.exam_time')}
                                </label>
                                <input
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="w-full bg-tg-secondary text-tg-text px-4 py-3 rounded-xl border border-tg-hint/10 focus:border-tg-button focus:outline-none transition-colors"
                                    required
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-tg-hint mb-2">
                                    {t('teacher.exam_type')}
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'online' })}
                                        className={`p-3 rounded-xl border-2 transition-all ${formData.type === 'online'
                                            ? 'border-tg-button bg-tg-button/10 text-tg-button'
                                            : 'border-tg-hint/10 bg-tg-secondary text-tg-text'
                                            }`}
                                    >
                                        {t('teacher.online')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'offline' })}
                                        className={`p-3 rounded-xl border-2 transition-all ${formData.type === 'offline'
                                            ? 'border-tg-button bg-tg-button/10 text-tg-button'
                                            : 'border-tg-hint/10 bg-tg-secondary text-tg-text'
                                            }`}
                                    >
                                        {t('teacher.offline')}
                                    </button>
                                </div>
                            </div>

                            {/* Group */}
                            <div>
                                <label className="block text-sm font-medium text-tg-hint mb-2">
                                    <Users size={16} className="inline mr-1" />
                                    {t('teacher.select_group')}
                                </label>
                                <select
                                    value={formData.groupId}
                                    onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                                    className="w-full bg-tg-secondary text-tg-text px-4 py-3 rounded-xl border border-tg-hint/10 focus:border-tg-button focus:outline-none transition-colors"
                                    required
                                >
                                    <option value="">Select a group...</option>
                                    {groups.map((group) => (
                                        <option key={group.id} value={group.id}>
                                            {group.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Buttons */}
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
                                    {t('teacher.create')}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CreateExamModal;
