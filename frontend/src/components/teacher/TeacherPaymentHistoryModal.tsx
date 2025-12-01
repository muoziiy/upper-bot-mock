import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTelegram } from '../../context/TelegramContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminSection } from '../../pages/admin/components/AdminSection';
import { AdminListItem } from '../../pages/admin/components/AdminListItem';
import { mockService } from '../../services/mockData';

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
            try {
                setLoading(true);
                const data = await mockService.getTeacherPayments();
                setPayments(data || []);
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
                    className="fixed inset-0 z-[60] bg-[#F2F2F7] dark:bg-[#000000]"
                >
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="h-full overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-[#F2F2F7]/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl border-b border-[#C6C6C8] dark:border-[#38383A] px-4 py-3 flex items-center justify-between z-10">
                            <button onClick={onClose} className="text-blue-500 text-[17px]">
                                Cancel
                            </button>
                            <h2 className="text-[17px] font-semibold text-black dark:text-white">{t('teacher_profile.payment_history')}</h2>
                            <div className="w-[50px]"></div> {/* Spacer for centering */}
                        </div>

                        {/* Content */}
                        <div className="pt-6 pb-24">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                </div>
                            ) : payments.length === 0 ? (
                                <div className="text-center py-8 text-[#8E8E93]">
                                    {t('teacher_profile.no_payments')}
                                </div>
                            ) : (
                                <AdminSection>
                                    {payments.map((payment, index) => (
                                        <AdminListItem
                                            key={payment.id}
                                            title={formatDate(payment.payment_date)}
                                            subtitle={payment.description || t('teacher_profile.paid_on') + ' ' + new Date(payment.payment_date).toLocaleDateString()}
                                            icon="✅"
                                            iconColor="bg-green-500"
                                            value={`${payment.amount.toLocaleString()} UZS`}
                                            isLast={index === payments.length - 1}
                                        />
                                    ))}
                                </AdminSection>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TeacherPaymentHistoryModal;
