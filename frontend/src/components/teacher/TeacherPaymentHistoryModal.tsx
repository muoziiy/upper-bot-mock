import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTelegram } from '../../context/TelegramContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

interface TeacherPaymentHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TeacherPaymentHistoryModal: React.FC<TeacherPaymentHistoryModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { webApp } = useTelegram();
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    // Fetch payments
    useEffect(() => {
        const fetchPayments = async () => {
            if (!webApp?.initDataUnsafe?.user?.id) return;

            try {
                setLoading(true);
                const apiUrl = import.meta.env.VITE_API_URL;
                const headers = {
                    'x-user-id': webApp.initDataUnsafe.user.id.toString(),
                    'Content-Type': 'application/json'
                };

                const response = await fetch(`${apiUrl}/teachers/payments`, { headers });
                if (response.ok) {
                    const data = await response.json();
                    setPayments(data || []);
                }
            } catch (error) {
                console.error('Error fetching payments:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchPayments();
        }
    }, [isOpen, webApp]);

    const getStatusIcon = () => {
        // All payments in this table are considered paid/completed
        return <Check className="w-4 h-4 text-green-500" />;
    };

    const getStatusBgColor = () => {
        return 'bg-green-500/10';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
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
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tg-button"></div>
                                </div>
                            ) : payments.length === 0 ? (
                                <div className="text-center py-8 text-tg-hint">
                                    {t('teacher_profile.no_payments')}
                                </div>
                            ) : (
                                <div className="bg-tg-bg rounded-xl overflow-hidden">
                                    {payments.map((payment, index) => (
                                        <motion.div
                                            key={payment.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`p-4 flex items-center justify-between ${index !== payments.length - 1 ? 'border-b border-tg-secondary/50' : ''
                                                }`}
                                        >
                                            <div>
                                                <h3 className="font-medium text-tg-text">{formatDate(payment.payment_date)}</h3>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    {getStatusIcon()}
                                                    <span className="text-xs text-tg-hint">
                                                        {t('teacher_profile.paid_on')} {new Date(payment.payment_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {payment.description && (
                                                    <p className="text-xs text-tg-hint mt-1">{payment.description}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <span className="text-lg font-bold block text-tg-text">{payment.amount.toLocaleString()} UZS</span>
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusBgColor()}`}>
                                                    PAID
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TeacherPaymentHistoryModal;
