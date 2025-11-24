import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';
import { useTranslation } from 'react-i18next';

interface PaymentRecord {
    month: number;
    year: number;
    amount: number;
    paid: boolean;
    date?: string;
}

interface PaymentDisplayItem extends PaymentRecord {
    monthName: string;
}

interface PaymentDotsViewProps {
    payments: PaymentRecord[];
    subjectName?: string;
}

const PaymentDotsView: React.FC<PaymentDotsViewProps> = ({ payments, subjectName }) => {
    const { t } = useTranslation();
    const { webApp } = useTelegram();
    const [selectedMonth, setSelectedMonth] = useState<PaymentDisplayItem | null>(null);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    // Create array of 12 months with payment status
    const monthlyPayments = months.map((month, index) => {
        const payment = payments.find(p => p.month === index + 1 && p.year === currentYear);
        return {
            month: index + 1,
            year: currentYear,
            monthName: month,
            amount: payment?.amount || 0,
            paid: payment?.paid || false,
            date: payment?.date
        };
    });

    const handleDotClick = (payment: typeof monthlyPayments[0]) => {
        setSelectedMonth(payment);
        webApp.HapticFeedback.impactOccurred('light');
    };

    const handleClose = () => {
        setSelectedMonth(null);
        webApp.BackButton.hide();
    };

    React.useEffect(() => {
        if (selectedMonth) {
            webApp.BackButton.show();
            webApp.BackButton.onClick(handleClose);
        } else {
            webApp.BackButton.hide();
        }

        return () => {
            webApp.BackButton.offClick(handleClose);
        };
    }, [selectedMonth]);

    return (
        <>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-tg-text">{t('profile.payment_status')}</h3>
                    {subjectName && <span className="text-xs text-tg-hint">{subjectName}</span>}
                </div>

                {/* Payment Dots - 6x2 Grid */}
                <div className="grid grid-cols-6 gap-3">
                    {monthlyPayments.map((payment, index) => (
                        <motion.button
                            key={index}
                            onClick={() => handleDotClick(payment)}
                            whileTap={{ scale: 0.95 }}
                            className="flex flex-col items-center gap-1.5"
                        >
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${payment.paid
                                        ? 'bg-green-500 shadow-md shadow-green-500/20'
                                        : 'bg-tg-secondary border-2 border-tg-hint/20'
                                    }`}
                            >
                                {payment.paid ? (
                                    <Check size={18} className="text-white" />
                                ) : (
                                    <X size={18} className="text-tg-hint/50" />
                                )}
                            </div>
                            <span className="text-[10px] text-tg-hint font-medium">{payment.monthName}</span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Payment Details Modal */}
            <AnimatePresence>
                {selectedMonth && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                        onClick={handleClose}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 32, stiffness: 380 }}
                            className="absolute bottom-0 left-0 right-0 bg-tg-bg rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-12 h-1 bg-tg-hint/30 rounded-full mx-auto mb-6" />

                            <h2 className="text-2xl font-bold text-tg-text mb-6">
                                {t('profile.payment_details')} - {selectedMonth.monthName} {selectedMonth.year}
                            </h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-tg-secondary rounded-xl">
                                    <span className="text-tg-hint">{t('profile.status')}</span>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${selectedMonth.paid
                                            ? 'bg-green-500/20 text-green-500'
                                            : 'bg-red-500/20 text-red-500'
                                            }`}
                                    >
                                        {selectedMonth.paid ? t('profile.month_paid') : t('profile.month_unpaid')}
                                    </span>
                                </div>

                                {selectedMonth.paid && (
                                    <>
                                        <div className="flex items-center justify-between p-4 bg-tg-secondary rounded-xl">
                                            <span className="text-tg-hint">{t('profile.amount')}</span>
                                            <span className="text-lg font-bold text-tg-text">
                                                ${selectedMonth.amount.toLocaleString()}
                                            </span>
                                        </div>

                                        {selectedMonth.date && (
                                            <div className="flex items-center justify-between p-4 bg-tg-secondary rounded-xl">
                                                <span className="text-tg-hint">{t('profile.date')}</span>
                                                <span className="text-tg-text">
                                                    {new Date(selectedMonth.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default PaymentDotsView;
