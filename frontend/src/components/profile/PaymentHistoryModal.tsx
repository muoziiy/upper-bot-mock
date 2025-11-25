import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegram } from '../../context/TelegramContext';
import { useTranslation } from 'react-i18next';
import { Check, X, Clock } from 'lucide-react';

interface PaymentRecord {
    status: 'paid' | 'unpaid' | 'pending';
    amount?: number;
    date?: string;
    month?: number;
    year?: number;
}

interface PaymentHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    subjectName: string;
    payments: PaymentRecord[];
}

const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
    isOpen,
    onClose,
    subjectName,
    payments
}) => {
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
    }, [isOpen, onClose, webApp]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid':
                return <Check size={16} className="text-green-500" />;
            case 'unpaid':
                return <X size={16} className="text-red-500" />;
            case 'pending':
                return <Clock size={16} className="text-yellow-500" />;
            default:
                return null;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'paid':
                return t('profile.month_paid');
            case 'unpaid':
                return t('profile.month_unpaid');
            case 'pending':
                return t('profile.status'); // Or a specific 'pending' key if available
            default:
                return status;
        }
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
                        className="h-full flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-tg-bg/95 backdrop-blur-xl border-b border-tg-hint/10 px-4 py-4 z-10 flex items-center justify-between">
                            <h1 className="text-xl font-bold text-tg-text">{t('profile.payment_history')}</h1>
                            <div className="text-sm text-tg-hint">{subjectName}</div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {payments.map((payment, index) => (
                                <div
                                    key={index}
                                    className={`
                                        flex items-center justify-between p-4 rounded-xl border
                                        ${payment.status === 'unpaid'
                                            ? 'bg-red-500/10 border-red-500/20'
                                            : 'bg-tg-secondary border-transparent'}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center
                                            ${payment.status === 'paid' ? 'bg-green-500/20' :
                                                payment.status === 'unpaid' ? 'bg-red-500/20' : 'bg-yellow-500/20'}
                                        `}>
                                            {getStatusIcon(payment.status)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-tg-text">
                                                {/* Mocking month name for demo since we just have an array */}
                                                {t(`months.${['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'][index % 12]}`)}
                                            </p>
                                            <p className="text-xs text-tg-hint">
                                                {payment.date || '---'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-tg-text">
                                            {payment.status === 'paid' ? '$150' : '---'}
                                        </p>
                                        <p className={`text-xs ${payment.status === 'paid' ? 'text-green-500' :
                                                payment.status === 'unpaid' ? 'text-red-500' : 'text-yellow-500'
                                            }`}>
                                            {getStatusText(payment.status)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PaymentHistoryModal;
