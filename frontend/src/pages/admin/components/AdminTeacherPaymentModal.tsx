import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, Plus, Check, Clock, X as XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegram } from '../../../context/TelegramContext';

interface Payment {
    id: string;
    amount: number;
    payment_date: string;
    description?: string;
    status?: 'paid' | 'pending' | 'unpaid'; // Added status to interface
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
                // Ensure status exists, default to 'paid' if missing for old records
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
                    amount: parseFloat(amount),
                    payment_date: date,
                    description,
                    status: 'paid' // Default to paid for admin payouts
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
                // Reset form
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
        if (status === 'paid') return <Check className="w-4 h-4 text-green-500" />;
        if (status === 'pending') return <Clock className="w-4 h-4 text-yellow-500" />;
        return <XIcon className="w-4 h-4 text-red-500" />;
    };

    const getStatusBgColor = (status: string) => {
        if (status === 'paid') return 'bg-green-500/10';
        if (status === 'pending') return 'bg-yellow-500/10';
        return 'bg-red-500/10';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-[#F2F2F7] dark:bg-[#000000] flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#C6C6C8] dark:border-[#38383A] flex items-center justify-between bg-[#F2F2F7] dark:bg-[#1C1C1E]">
                <h2 className="text-lg font-semibold text-black dark:text-white">
                    {view === 'add' ? 'Add Payout' : `Payouts - ${teacherName}`}
                </h2>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                <AnimatePresence mode="wait">
                    {view === 'history' ? (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            {/* Add Button */}
                            <button
                                onClick={() => setView('add')}
                                className="w-full py-3 rounded-xl bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-blue-500/20"
                            >
                                <Plus size={20} />
                                Add Payout
                            </button>

                            {/* List */}
                            <div className="bg-white dark:bg-[#1C1C1E] rounded-xl overflow-hidden shadow-sm">
                                {payments.length > 0 ? (
                                    payments.map((payment, index) => (
                                        <motion.div
                                            key={payment.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`p-4 flex items-center justify-between ${index !== payments.length - 1 ? 'border-b border-[#C6C6C8]/50 dark:border-[#38383A]/50' : ''}`}
                                        >
                                            <div>
                                                <h3 className="font-medium text-black dark:text-white">
                                                    {new Date(payment.payment_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                                </h3>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    {getStatusIcon(payment.status || 'paid')}
                                                    <span className="text-xs text-[#8E8E93]">
                                                        {payment.status === 'paid' ? `Paid on ${new Date(payment.payment_date).toLocaleDateString()}` : payment.status}
                                                    </span>
                                                </div>
                                                {payment.description && (
                                                    <div className="text-xs text-[#8E8E93] mt-1 italic">
                                                        {payment.description}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <span className="text-lg font-bold block text-black dark:text-white">
                                                        {payment.amount.toLocaleString()} UZS
                                                    </span>
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusBgColor(payment.status || 'paid')} text-black dark:text-white`}>
                                                        {(payment.status || 'paid').toUpperCase()}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(payment.id)}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-[#8E8E93]">
                                        No payout history found.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="add"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {/* Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#8E8E93] ml-1">Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8E93]" size={18} />
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-white dark:bg-[#1C1C1E] text-black dark:text-white pl-11 p-3.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#8E8E93] ml-1">Amount (UZS)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0"
                                    className="w-full bg-white dark:bg-[#1C1C1E] text-black dark:text-white p-3.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500/20 text-lg font-semibold"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#8E8E93] ml-1">Note (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g. Salary for October"
                                    className="w-full bg-white dark:bg-[#1C1C1E] text-black dark:text-white p-3.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500/20 resize-none h-24"
                                />
                            </div>

                            {/* Save Button */}
                            <div className="pt-4">
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="w-full py-3.5 rounded-xl bg-blue-500 text-white font-semibold active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20"
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
