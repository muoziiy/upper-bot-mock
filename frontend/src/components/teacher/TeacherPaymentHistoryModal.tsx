import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTelegram } from '../../context/TelegramContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, X as XIcon } from 'lucide-react';

interface TeacherPaymentHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TeacherPaymentHistoryModal: React.FC<TeacherPaymentHistoryModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { webApp } = useTelegram();

    // Mock payment history data
    const paymentHistory = [
        { month: 'November 2024', amount: 1500, status: 'paid', paidOn: '2024-11-05' },
        { month: 'October 2024', amount: 1500, status: 'paid', paidOn: '2024-10-05' },
        { month: 'September 2024', amount: 1500, status: 'paid', paidOn: '2024-09-05' },
        { month: 'August 2024', amount: 1500, status: 'paid', paidOn: '2024-08-05' },
        { month: 'July 2024', amount: 1500, status: 'paid', paidOn: '2024-07-05' },
    ];

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

    const getStatusIcon = (status: string) => {
        if (status === 'paid') return <Check className="w-4 h-4 text-green-500" />;
        if (status === 'pending') return <Clock className="w-4 h-4 text-yellow-500" />;
        return <XIcon className="w-4 h-4 text-red-500" />;
    };

    const getStatusText = (status: string) => {
        if (status === 'paid') return t('teacher_profile.paid_on');
        if (status === 'pending') return t('teacher_profile.pending');
        return t('profile.month_unpaid');
    };

    const getStatusBgColor = (status: string) => {
        if (status === 'paid') return 'bg-green-500/10';
        if (status === 'pending') return 'bg-yellow-500/10';
        return 'bg-red-500/10';
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
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="h-full overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-tg-bg/95 backdrop-blur-xl border-b border-tg-secondary/50 px-4 py-3 flex items-center justify-center z-10">
                            <h2 className="text-lg font-bold text-tg-text">{t('teacher_profile.payment_history')}</h2>
                        </div>

                        {/* Content */}
                        <div className="p-4 pb-24">
                            <div className="bg-tg-bg rounded-xl overflow-hidden">
                                {paymentHistory.map((payment, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`p-4 flex items-center justify-between ${index !== paymentHistory.length - 1 ? 'border-b border-tg-secondary/50' : ''
                                            }`}
                                    >
                                        <div>
                                            <h3 className="font-medium text-tg-text">{payment.month}</h3>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                {getStatusIcon(payment.status)}
                                                <span className="text-xs text-tg-hint">
                                                    {payment.status === 'paid'
                                                        ? `${t('teacher_profile.paid_on')} ${payment.paidOn}`
                                                        : getStatusText(payment.status)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-bold block text-tg-text">${payment.amount.toLocaleString()}</span>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusBgColor(payment.status)}`}>
                                                {payment.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TeacherPaymentHistoryModal;
