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
                    className="fixed inset-0 z-[60] bg-tg-secondary"
                >
                    {showSuccess ? (
                        <div className="flex flex-col items-center justify-center h-full bg-tg-bg">
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
                            <div className="sticky top-0 bg-tg-bg/95 backdrop-blur-xl border-b border-tg-secondary/50 px-4 py-3 flex items-center justify-center z-10">
                                <h1 className="text-lg font-bold text-tg-text">{t('teacher.edit_curriculum')}</h1>
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <h3 className="text-xs font-medium text-tg-hint uppercase px-4">{t('teacher.details')}</h3>
                                    <div className="bg-tg-bg rounded-xl overflow-hidden">
                                        <div className="flex items-center px-4 py-3 border-b border-tg-secondary/50">
                                            <label className="w-24 text-tg-text font-medium">{t('teacher.subject')}</label>
                                            <input
                                                type="text"
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                className="flex-1 bg-transparent text-tg-text focus:outline-none text-right placeholder-tg-hint"
                                                placeholder="Required"
                                            />
                                        </div>
                                        <div className="flex items-center px-4 py-3">
                                            <label className="w-24 text-tg-text font-medium">{t('teacher.topic')}</label>
                                            <input
                                                type="text"
                                                value={formData.topic}
                                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                                className="flex-1 bg-transparent text-tg-text focus:outline-none text-right placeholder-tg-hint"
                                                placeholder="Required"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xs font-medium text-tg-hint uppercase px-4">{t('teacher.description')}</h3>
                                    <div className="bg-tg-bg rounded-xl p-4">
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-transparent text-tg-text focus:outline-none resize-none placeholder-tg-hint"
                                            placeholder="Enter topic description..."
                                            rows={4}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xs font-medium text-tg-hint uppercase px-4">{t('teacher.materials')}</h3>
                                    <div className="bg-tg-bg rounded-xl p-6 flex flex-col items-center justify-center text-tg-hint gap-2 border-2 border-dashed border-tg-secondary/50">
                                        <Upload size={24} />
                                        <span className="text-sm">Tap to upload files</span>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <motion.button
                                        type="submit"
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full bg-tg-button text-tg-button-text py-3 rounded-xl font-bold text-lg shadow-sm"
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
