import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegram } from '../../context/TelegramContext';
import { useTranslation } from 'react-i18next';
import Lottie from 'lottie-react';
import duckSuccess from '../../assets/animations/duck_success.json';
import { AdminSection } from '../../pages/admin/components/AdminSection';

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
                    className="fixed inset-0 z-[60] bg-[#F2F2F7] dark:bg-[#000000]"
                >
                    {showSuccess ? (
                        <div className="flex flex-col items-center justify-center h-full bg-[#F2F2F7] dark:bg-[#000000]">
                            <div className="w-48 h-48">
                                <Lottie animationData={duckSuccess} loop={false} />
                            </div>
                            <h2 className="text-xl font-bold mt-4 text-black dark:text-white">{t('teacher.curriculum_updated')}</h2>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            transition={{ type: 'spring', damping: 32, stiffness: 380 }}
                            className="h-full overflow-y-auto"
                        >
                            <div className="sticky top-0 bg-[#F2F2F7]/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl border-b border-[#C6C6C8] dark:border-[#38383A] px-4 py-3 flex items-center justify-between z-10">
                                <button onClick={onClose} className="text-blue-500 text-[17px]">
                                    Cancel
                                </button>
                                <h1 className="text-[17px] font-semibold text-black dark:text-white">{t('teacher.edit_curriculum')}</h1>
                                <button onClick={handleSubmit} className="text-blue-500 text-[17px] font-semibold">
                                    Save
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="pt-6 pb-24">
                                <AdminSection title={t('teacher.details')}>
                                    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1C1C1E] border-b border-[#C6C6C8] dark:border-[#38383A]">
                                        <label className="text-[17px] text-black dark:text-white">{t('teacher.subject')}</label>
                                        <input
                                            type="text"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="bg-transparent text-[17px] text-[#8E8E93] text-right focus:outline-none"
                                            placeholder="Required"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1C1C1E]">
                                        <label className="text-[17px] text-black dark:text-white">{t('teacher.topic')}</label>
                                        <input
                                            type="text"
                                            value={formData.topic}
                                            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                            className="bg-transparent text-[17px] text-[#8E8E93] text-right focus:outline-none"
                                            placeholder="Required"
                                        />
                                    </div>
                                </AdminSection>

                                <AdminSection title={t('teacher.description')}>
                                    <div className="bg-white dark:bg-[#1C1C1E] p-4">
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-transparent text-[17px] text-black dark:text-white focus:outline-none resize-none"
                                            placeholder="Enter topic description..."
                                            rows={4}
                                        />
                                    </div>
                                </AdminSection>

                                <AdminSection title={t('teacher.materials')}>
                                    <div className="bg-white dark:bg-[#1C1C1E] p-6 flex flex-col items-center justify-center text-[#8E8E93] gap-2">
                                        <span className="text-2xl">📤</span>
                                        <span className="text-[15px]">Tap to upload files</span>
                                    </div>
                                </AdminSection>
                            </form>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EditCurriculumModal;
