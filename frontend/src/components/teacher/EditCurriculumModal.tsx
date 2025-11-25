import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload } from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';
import { useTranslation } from 'react-i18next';
import Lottie from 'lottie-react';
import duckSuccess from '../../assets/animations/duck_success.json';

interface EditCurriculumModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const EditCurriculumModal: React.FC<EditCurriculumModalProps> = ({ isOpen, onClose }) => {
    const { webApp } = useTelegram();
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        subject: '',
        topic: '',
        description: '',
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

        if (!formData.subject || !formData.topic) {
            webApp.HapticFeedback.notificationOccurred('error');
            return;
        }

        console.log('Update curriculum:', formData);
        webApp.HapticFeedback.notificationOccurred('success');
        setShowSuccess(true);

        setTimeout(() => {
            setShowSuccess(false);
            onClose();
            setFormData({ subject: '', topic: '', description: '' });
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
                            <h2 className="text-xl font-bold mt-4 text-tg-text">{t('teacher.curriculum_updated')}</h2>
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
                                <h1 className="text-xl font-bold text-tg-text">{t('teacher.edit_curriculum')}</h1>
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-tg-hint mb-2">
                                        {t('teacher.subject')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full bg-tg-secondary text-tg-text px-4 py-3 rounded-xl border border-tg-hint/10 focus:border-tg-button focus:outline-none transition-colors"
                                        placeholder="e.g. Mathematics"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-tg-hint mb-2">
                                        {t('teacher.topic')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.topic}
                                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                        className="w-full bg-tg-secondary text-tg-text px-4 py-3 rounded-xl border border-tg-hint/10 focus:border-tg-button focus:outline-none transition-colors"
                                        placeholder="e.g. Algebra Basics"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-tg-hint mb-2">
                                        {t('teacher.description')}
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-tg-secondary text-tg-text px-4 py-3 rounded-xl border border-tg-hint/10 focus:border-tg-button focus:outline-none transition-colors h-32 resize-none"
                                        placeholder="Enter topic description..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-tg-hint mb-2">
                                        {t('teacher.materials')}
                                    </label>
                                    <div className="border-2 border-dashed border-tg-hint/20 rounded-xl p-6 flex flex-col items-center justify-center text-tg-hint gap-2">
                                        <Upload size={24} />
                                        <span className="text-sm">Tap to upload files</span>
                                    </div>
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
                                        {t('teacher.save')}
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

export default EditCurriculumModal;
