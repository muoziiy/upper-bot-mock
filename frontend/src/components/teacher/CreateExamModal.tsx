import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegram } from '../../context/TelegramContext';
import { useTranslation } from 'react-i18next';
import Lottie from 'lottie-react';
import duckSuccess from '../../assets/animations/duck_success.json';
import { AdminSection } from '../../pages/admin/components/AdminSection';
import { useNavigate } from 'react-router-dom';

interface CreateExamModalProps {
    isOpen: boolean;
    onClose: () => void;
    groups: { id: string; name: string }[];
}

const CreateExamModal: React.FC<CreateExamModalProps> = ({ isOpen, onClose, groups }) => {
    const { webApp, user } = useTelegram();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        type: 'online' as 'online' | 'offline',
        groupId: ''
    });
    const [errors, setErrors] = useState<{ [key: string]: boolean }>({
        title: false,
        date: false,
        time: false,
        groupId: false
    });
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all required fields
        const newErrors = {
            title: !formData.title.trim(),
            date: !formData.date,
            time: !formData.time,
            groupId: !formData.groupId
        };

        setErrors(newErrors);

        // If any errors, show haptic feedback and don't submit
        if (Object.values(newErrors).some(error => error)) {
            webApp.HapticFeedback.notificationOccurred('error');
            return;
        }

        setIsSubmitting(true);

        try {
            const scheduledDate = new Date(`${formData.date}T${formData.time}`);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/exams/teacher/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id?.toString() || ''
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: '',
                    duration_minutes: 60, // Default
                    type: formData.type,
                    location: '',
                    groups: [formData.groupId],
                    scheduled_date: scheduledDate.toISOString()
                })
            });

            if (response.ok) {
                const data = await response.json();
                webApp.HapticFeedback.notificationOccurred('success');
                setShowSuccess(true);

                // Close after animation and redirect
                setTimeout(() => {
                    setShowSuccess(false);
                    onClose();
                    setFormData({
                        title: '',
                        date: '',
                        time: '',
                        type: 'online',
                        groupId: ''
                    });

                    // Redirect to edit questions if online
                    if (formData.type === 'online') {
                        navigate(`/admin/exams/${data.examId}`); // Reusing Admin Editor for now
                    }
                }, 2000);
            } else {
                webApp.HapticFeedback.notificationOccurred('error');
                alert('Failed to create exam');
            }
        } catch (error) {
            console.error('Error creating exam:', error);
            webApp.HapticFeedback.notificationOccurred('error');
        } finally {
            setIsSubmitting(false);
        }
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
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="w-48 h-48">
                                <Lottie animationData={duckSuccess} loop={false} />
                            </div>
                            <h2 className="text-xl font-bold mt-4 text-black dark:text-white">{t('teacher.exam_created')}</h2>
                        </div>
                    ) : (
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
                                <h1 className="text-[17px] font-semibold text-black dark:text-white">{t('teacher.create_exam')}</h1>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className={`text-blue-500 text-[17px] font-semibold ${isSubmitting ? 'opacity-50' : ''}`}
                                >
                                    {isSubmitting ? 'Creating...' : 'Create'}
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="pt-6 pb-24">
                                {/* Title */}
                                <AdminSection title={t('teacher.exam_title')}>
                                    <div className="px-4 py-3 bg-white dark:bg-[#1C1C1E]">
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => {
                                                setFormData({ ...formData, title: e.target.value });
                                                setErrors({ ...errors, title: false });
                                            }}
                                            className={`w-full bg-transparent text-[17px] text-black dark:text-white focus:outline-none ${errors.title ? 'placeholder-red-500' : ''}`}
                                            placeholder="e.g., Mid-Term Exam"
                                        />
                                    </div>
                                </AdminSection>

                                {/* Date & Time */}
                                <AdminSection title="Date & Time">
                                    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1C1C1E] border-b border-[#C6C6C8] dark:border-[#38383A]">
                                        <label className="text-[17px] text-black dark:text-white">{t('teacher.exam_date')}</label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => {
                                                setFormData({ ...formData, date: e.target.value });
                                                setErrors({ ...errors, date: false });
                                            }}
                                            className={`bg-transparent text-[17px] text-[#8E8E93] text-right focus:outline-none ${errors.date ? 'text-red-500' : ''}`}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1C1C1E]">
                                        <label className="text-[17px] text-black dark:text-white">{t('teacher.exam_time')}</label>
                                        <input
                                            type="time"
                                            value={formData.time}
                                            onChange={(e) => {
                                                setFormData({ ...formData, time: e.target.value });
                                                setErrors({ ...errors, time: false });
                                            }}
                                            className={`bg-transparent text-[17px] text-[#8E8E93] text-right focus:outline-none ${errors.time ? 'text-red-500' : ''}`}
                                        />
                                    </div>
                                </AdminSection>

                                {/* Type */}
                                <AdminSection title={t('teacher.exam_type')}>
                                    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1C1C1E] border-b border-[#C6C6C8] dark:border-[#38383A]" onClick={() => setFormData({ ...formData, type: 'online' })}>
                                        <span className="text-[17px] text-black dark:text-white">{t('teacher.online')}</span>
                                        {formData.type === 'online' && <span className="text-blue-500 text-[17px]">✓</span>}
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#1C1C1E]" onClick={() => setFormData({ ...formData, type: 'offline' })}>
                                        <span className="text-[17px] text-black dark:text-white">{t('teacher.offline')}</span>
                                        {formData.type === 'offline' && <span className="text-blue-500 text-[17px]">✓</span>}
                                    </div>
                                </AdminSection>

                                {/* Group */}
                                <AdminSection title={t('teacher.select_group')}>
                                    <div className="px-4 py-3 bg-white dark:bg-[#1C1C1E]">
                                        <select
                                            value={formData.groupId}
                                            onChange={(e) => {
                                                setFormData({ ...formData, groupId: e.target.value });
                                                setErrors({ ...errors, groupId: false });
                                            }}
                                            className={`w-full bg-transparent text-[17px] text-black dark:text-white focus:outline-none ${errors.groupId ? 'text-red-500' : ''}`}
                                        >
                                            <option value="">Select a group...</option>
                                            {groups.map((group) => (
                                                <option key={group.id} value={group.id}>
                                                    {group.name}
                                                </option>
                                            ))}
                                        </select>
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

export default CreateExamModal;
