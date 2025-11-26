import React, { useEffect } from 'react';
import { useTelegram } from '../../context/TelegramContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface ParentPaymentHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    child: any;
}

const ParentPaymentHistoryModal: React.FC<ParentPaymentHistoryModalProps> = ({ isOpen, onClose, child }) => {
    const { t } = useTranslation();
    const { webApp } = useTelegram();

    useEffect(() => {
        if (isOpen && webApp) {
            webApp.BackButton.show();
            webApp.BackButton.onClick(onClose);

            return () => {
                webApp.BackButton.hide();
                webApp.BackButton.offClick(onClose);
            };
        }
    }, [isOpen, webApp, onClose]);

    // Mock payment data
    const mockPayments = child?.subjects?.map((subject: any) => ({
        subject: subject.name,
        payments: [
            { status: 'paid', date: '2024-01-05', amount: 500000 },
            { status: 'paid', date: '2024-02-05', amount: 500000 },
            { status: 'paid', date: '2024-03-05', amount: 500000 },
            { status: 'paid', date: '2024-04-05', amount: 500000 },
            { status: 'paid', date: '2024-05-05', amount: 500000 },
            { status: 'paid', date: '2024-06-05', amount: 500000 },
            { status: 'paid', date: '2024-07-05', amount: 500000 },
            { status: 'paid', date: '2024-08-05', amount: 500000 },
            { status: 'pending', amount: 500000 },
            { status: 'unpaid', amount: 500000 },
            { status: 'unpaid', amount: 500000 },
            { status: 'unpaid', amount: 500000 }
        ]
    })) || [];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('uz-UZ', {
            style: 'currency',
            currency: 'UZS',
            minimumFractionDigits: 0
        }).format(amount);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 500 }}
                        className="fixed inset-x-0 bottom-0 bg-tg-bg rounded-t-3xl z-[60] max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-tg-bg border-b border-tg-hint/10 px-4 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-tg-text">{t('profile.payment_history')}</h2>
                                <p className="text-sm text-tg-hint">
                                    {child.first_name} {child.last_name}
                                </p>
                            </div>
                        </div>

                        <div className="p-4 space-y-6">
                            {mockPayments.map((subjectPayment: any, idx: number) => (
                                <div key={idx}>
                                    <h3 className="text-sm font-medium text-tg-hint uppercase mb-3">
                                        {subjectPayment.subject}
                                    </h3>

                                    {/* Payment Grid */}
                                    <div className="bg-tg-secondary/50 rounded-xl p-4 mb-3">
                                        <div className="grid grid-cols-6 gap-3 mb-3">
                                            {subjectPayment.payments.map((payment: any, payIdx: number) => (
                                                <div
                                                    key={payIdx}
                                                    className={`
                                                        w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold
                                                        ${payment.status === 'paid'
                                                            ? 'bg-green-500 text-white'
                                                            : payment.status === 'pending'
                                                                ? 'bg-yellow-500 text-white'
                                                                : 'bg-tg-bg border-2 border-tg-hint/30 text-tg-hint'}
                                                    `}
                                                >
                                                    {payIdx + 1}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Legend */}
                                        <div className="flex items-center justify-between text-xs border-t border-tg-hint/10 pt-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded bg-green-500"></div>
                                                <span className="text-tg-hint">{t('profile.month_paid')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded bg-yellow-500"></div>
                                                <span className="text-tg-hint">{t('parent.pending')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded border-2 border-tg-hint/30"></div>
                                                <span className="text-tg-hint">{t('profile.month_unpaid')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed Payment List */}
                                    <div className="space-y-2">
                                        {subjectPayment.payments
                                            .filter((p: any) => p.date)
                                            .map((payment: any, payIdx: number) => (
                                                <div
                                                    key={payIdx}
                                                    className="bg-tg-secondary/30 rounded-lg p-3 flex items-center justify-between"
                                                >
                                                    <div>
                                                        <p className="text-sm font-medium text-tg-text">
                                                            {new Date(payment.date).toLocaleDateString('en-US', {
                                                                month: 'long',
                                                                year: 'numeric'
                                                            })}
                                                        </p>
                                                        <p className="text-xs text-tg-hint">
                                                            {new Date(payment.date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-tg-text">
                                                            {formatCurrency(payment.amount)}
                                                        </p>
                                                        <span
                                                            className={`text-xs font-medium ${payment.status === 'paid'
                                                                ? 'text-green-500'
                                                                : 'text-yellow-500'
                                                                }`}
                                                        >
                                                            {payment.status === 'paid' ? '✓ Paid' : 'Pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ParentPaymentHistoryModal;
