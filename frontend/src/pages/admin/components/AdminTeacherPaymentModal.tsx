import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegram } from '../../../context/TelegramContext';
import { AdminSection } from './AdminSection';
import { AdminListItem } from './AdminListItem';

interface Payment {
    id: string;
    amount: number;
    payment_date: string;
    description?: string;
    status?: 'paid' | 'pending' | 'unpaid';
}

interface AdminTeacherPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacherId: string;
    teacherName: string;
}

const AdminTeacherPaymentModal: React.FC<AdminTeacherPaymentModalProps> = ({ isOpen, onClose, teacherId, teacherName }) => {
    const { webApp } = useTelegram();
    const [view, setView] = useState<'history' | 'add'>('history');
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);

    // Add Payment Form State
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState<string>('');
    const [description, setDescription] = useState('');

    // Handle Native Back Button
    useEffect(() => {
        if (isOpen) {
            webApp.BackButton.show();
            const handleBack = () => {
                if (view === 'add') {
                    setView('history');
                } else {
                    onClose();
                }
            };
            webApp.BackButton.onClick(handleBack);
            return () => {
                webApp.BackButton.offClick(handleBack);
                if (view === 'history') webApp.BackButton.hide();
            };
        }
    }, [isOpen, view, onClose, webApp]);

    // Fetch payments on open
    useEffect(() => {
        if (isOpen) {
            fetchPayments();
        }
    }, [isOpen]);

    const fetchPayments = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/teachers/${teacherId}/payments`);
            if (res.ok) {
                const data = await res.json();
                const formattedData = data.map((p: any) => ({ ...p, status: p.status || 'paid' }));
                setPayments(formattedData);
            }
        } catch (e) {
            console.error('Failed to fetch payments', e);
        }
    };

    const handleDelete = async (paymentId: string) => {
        webApp.showConfirm('Are you sure you want to delete this payout?', async (confirm) => {
            if (confirm) {
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/teachers/${teacherId}/payments/${paymentId}`, {
                        method: 'DELETE'
                    });
                    if (res.ok) {
                        fetchPayments();
                        webApp.showAlert('Payout deleted');
                    }
                } catch (e) {
                    webApp.showAlert('Failed to delete payout');
                }
            }
        });
    };

    const formatAmount = (value: string) => {
        const number = value.replace(/\D/g, '');
        return number.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\s/g, '');
        if (!/^\d*$/.test(rawValue)) return;
        setAmount(rawValue);
    };

    const handleSave = async () => {
        if (!amount || !date) {
            webApp.showAlert('Please fill in amount and date');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/teachers/${teacherId}/payments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(amount.replace(/\s/g, '')),
                    payment_date: date,
                    description,
                    status: 'paid'
                })
            });

            if (res.ok) {
                webApp?.showPopup({
                    title: 'Success',
                    message: 'Payout saved successfully',
                    buttons: [{ type: 'ok' }]
                });
                fetchPayments();
                setView('history');
                setAmount('');
                setDescription('');
            } else {
                throw new Error('Failed');
            }
        } catch (e) {
            webApp.showAlert('Failed to save payout');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        if (status === 'paid') return '✅';
        if (status === 'pending') return '⏳';
        return '❌';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-[#F2F2F7] dark:bg-[#000000] flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#C6C6C8] dark:border-[#38383A] flex items-center justify-between bg-[#F2F2F7] dark:bg-[#1C1C1E]">
                <h2 className="text-lg font-semibold text-black dark:text-white">
                    {view === 'add' ? 'Add Payout' : `Payouts - ${teacherName}`}
                </h2>
                <button onClick={onClose} className="text-blue-500 font-medium">
                    Done
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pt-4">
                <AnimatePresence mode="wait">
                    {view === 'history' ? (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <AdminSection>
                                <AdminListItem
                                    title="Add Payout"
                                    icon="➕"
                                    iconColor="bg-blue-500"
                                    onClick={() => setView('add')}
                                    isLast
                                />
                            </AdminSection>

                            <AdminSection title="History">
                                {payments.length > 0 ? (
                                    payments.map((payment, index) => (
                                        <AdminListItem
                                            key={payment.id}
                                            title={`${payment.amount.toLocaleString()} UZS`}
                                            subtitle={`${new Date(payment.payment_date).toLocaleDateString()} • ${payment.status || 'paid'}`}
                                            icon={getStatusIcon(payment.status || 'paid')}
                                            iconColor="bg-transparent"
                                            rightElement={
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(payment.id);
                                                    }}
                                                    className="p-2 text-red-500 active:opacity-70"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            }
                                            isLast={index === payments.length - 1}
                                        />
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-[#8E8E93] bg-white dark:bg-[#1C1C1E]">
                                        No payout history found.
                                    </div>
                                )}
                            </AdminSection>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="add"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <AdminSection title="Payout Details">
                                <div className="px-4 py-3 bg-white dark:bg-[#1C1C1E] border-b border-[#C6C6C8] dark:border-[#38383A] flex items-center justify-between">
                                    <span className="text-[17px] text-black dark:text-white">Date</span>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="bg-transparent text-right text-[17px] text-[#8E8E93] outline-none"
                                    />
                                </div>
                                <div className="px-4 py-3 bg-white dark:bg-[#1C1C1E] border-b border-[#C6C6C8] dark:border-[#38383A] flex items-center justify-between">
                                    <span className="text-[17px] text-black dark:text-white">Amount</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={formatAmount(amount)}
                                        onChange={handleAmountChange}
                                        placeholder="0"
                                        className="bg-transparent text-right text-[17px] text-blue-500 outline-none w-32"
                                    />
                                </div>
                                <div className="px-4 py-3 bg-white dark:bg-[#1C1C1E] flex flex-col gap-2">
                                    <span className="text-[17px] text-black dark:text-white">Note</span>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Optional description..."
                                        className="w-full bg-transparent text-[17px] text-black dark:text-white outline-none resize-none h-20 placeholder:text-[#8E8E93]"
                                    />
                                </div>
                            </AdminSection>

                            <div className="px-4 mt-4">
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="w-full py-3.5 rounded-xl bg-blue-500 text-white font-semibold active:scale-[0.98] transition-all"
                                >
                                    {loading ? 'Saving...' : 'Save Payout'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminTeacherPaymentModal;
