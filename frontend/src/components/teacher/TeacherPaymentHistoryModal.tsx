import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTelegram } from '../../context/TelegramContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Clock, DollarSign } from 'lucide-react';

interface TeacherPaymentHistoryModalProps {
    onClose: () => void;
}

const TeacherPaymentHistoryModal: React.FC<TeacherPaymentHistoryModalProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const { webApp } = useTelegram();

    // Mock payment history data
    const paymentHistory = [
        { month: 'November 2024', amount: 1500, status: 'paid', paidOn: '2024-11-05' },
        { month: 'October 2024', amount: 1500, status: 'paid', paidOn: '2024-10-05' },
        { month: 'September 2024', amount: 1500, status: 'paid', paidOn: '2024-09-05' },
        { month: 'August 2024', amount: 1500, status: 'paid', paidOn: '2024-08-05' },
        { month: 'July 2024', amount: 1500, status: 'paid', paidOn: '2024-07-05' },
        { month: 'June 2024', amount: 1500, status: 'paid', paidOn: '2024-06-05' },
        { month: 'May 2024', amount: 1450, status: 'paid', paidOn: '2024-05-05' },
        { month: 'April 2024', amount: 1450, status: 'paid', paidOn: '2024-04-05' },
        { month: 'March 2024', amount: 1450, status: 'paid', paidOn: '2024-03-05' },
        { month: 'February 2024', amount: 1450, status: 'paid', paidOn: '2024-02-05' },
        { month: 'January 2024', amount: 1450, status: 'paid', paidOn: '2024-01-05' },
        { month: 'December 2023', amount: 1400, status: 'paid', paidOn: '2023-12-05' },
    ];

    // Handle back button
    React.useEffect(() => {
        if (webApp) {
            webApp.BackButton.show();
            webApp.BackButton.onClick(onClose);
            return () => {
                webApp.BackButton.hide();
                webApp.BackButton.offClick(onClose);
            };
        }
    }, [webApp, onClose]);

    const getStatusIcon = (status: string) => {
        if (status === 'paid') return <Check className="w-4 h-4 text-green-500" />;
        if (status === 'pending') return <Clock className="w-4 h-4 text-yellow-500" />;
        return <X className="w-4 h-4 text-red-500" />;
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
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-tg-secondary z-50 overflow-y-auto"
            >
                {/* Header */}
                <div className="sticky top-0 bg-tg-bg border-b border-tg-secondary/50 px-4 py-3 flex items-center justify-between z-10">
                    <h2 className="text-lg font-bold">{t('teacher_profile.payment_history')}</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-tg-secondary flex items-center justify-center hover:bg-tg-secondary/80 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 pb-24">
                    <div className="space-y-3">
                        {paymentHistory.map((payment, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-tg-bg rounded-xl p-4 shadow-sm"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-medium">{payment.month}</h3>
                                        <p className="text-sm text-tg-hint">{t('teacher_profile.salary')}</p>
                                    </div>
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getStatusBgColor(payment.status)}`}>
                                        {getStatusIcon(payment.status)}
                                        <span className="text-xs font-medium">
                                            {payment.status === 'paid' ? t('profile.month_paid') : getStatusText(payment.status)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-tg-secondary/30">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-tg-hint" />
                                        <span className="text-lg font-bold">${payment.amount.toLocaleString()}</span>
                                    </div>
                                    {payment.paidOn && (
                                        <span className="text-xs text-tg-hint">
                                            {getStatusText(payment.status)} {payment.paidOn}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TeacherPaymentHistoryModal;
