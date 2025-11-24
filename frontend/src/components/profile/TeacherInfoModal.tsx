import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, BookOpen } from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';
import { useTranslation } from 'react-i18next';

interface TeacherInfo {
    id: string;
    first_name: string;
    last_name?: string;
    photo_url?: string;
    email?: string;
    phone?: string;
    bio?: string;
    subjects?: string[];
}

interface TeacherInfoModalProps {
    teacher: TeacherInfo | null;
    isOpen: boolean;
    onClose: () => void;
}

const TeacherInfoModal: React.FC<TeacherInfoModalProps> = ({ teacher, isOpen, onClose }) => {
    const { webApp } = useTelegram();
    const { t } = useTranslation();

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
    }, [isOpen, onClose]);

    if (!teacher) return null;

    const fullName = `${teacher.first_name} ${teacher.last_name || ''}`.trim();

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
                            <h1 className="text-xl font-bold text-tg-text">{t('profile.teacher_info')}</h1>
                        </div>

                        <div className="p-4 space-y-6">
                            {/* Teacher Profile */}
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-tg-button to-tg-accent flex items-center justify-center text-white text-3xl font-bold mb-4 overflow-hidden">
                                    {teacher.photo_url ? (
                                        <img
                                            src={teacher.photo_url}
                                            alt={fullName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User size={40} />
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-tg-text mb-1">{fullName}</h2>
                                <p className="text-tg-hint">{t('profile.teacher')}</p>
                            </div>

                            {/* Bio */}
                            {teacher.bio && (
                                <div className="bg-tg-secondary rounded-xl p-4">
                                    <p className="text-tg-text text-sm leading-relaxed">{teacher.bio}</p>
                                </div>
                            )}

                            {/* Contact Information */}
                            <div className="space-y-3">
                                {teacher.email && (
                                    <div className="flex items-center gap-3 p-4 bg-tg-secondary rounded-xl">
                                        <div className="w-10 h-10 rounded-full bg-tg-button/20 flex items-center justify-center flex-shrink-0">
                                            <Mail size={20} className="text-tg-button" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-tg-hint mb-0.5">Email</p>
                                            <p className="text-sm text-tg-text truncate">{teacher.email}</p>
                                        </div>
                                    </div>
                                )}

                                {teacher.phone && (
                                    <div className="flex items-center gap-3 p-4 bg-tg-secondary rounded-xl">
                                        <div className="w-10 h-10 rounded-full bg-tg-button/20 flex items-center justify-center flex-shrink-0">
                                            <Phone size={20} className="text-tg-button" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-tg-hint mb-0.5">Phone</p>
                                            <p className="text-sm text-tg-text">{teacher.phone}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Subjects */}
                            {teacher.subjects && teacher.subjects.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-tg-text mb-3 flex items-center gap-2">
                                        <BookOpen size={16} />
                                        Subjects
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {teacher.subjects.map((subject, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1.5 bg-tg-button/20 text-tg-button text-sm rounded-full"
                                            >
                                                {subject}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TeacherInfoModal;
