import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { useTelegram } from '../../../context/TelegramContext';

interface Payment {
    id: string;
    amount: number;
    payment_date: string;
    description?: string;
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
                setPayments(data);
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
                    description
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-tg-bg flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-tg-hint/10 flex items-center justify-between bg-tg-bg">
                <h2 className="text-lg font-semibold text-tg-text">
                    {view === 'add' ? 'Add Payout' : `Payouts - ${teacherName}`}
                </h2>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-tg-bg">
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
                                className="w-full py-3 rounded-xl bg-tg-button text-white font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                            >
                                <Plus size={20} />
                                Add Payout
                            </button>

                            {/* List */}
                            <div className="space-y-3">
                                {payments.length > 0 ? (
                                    payments.map((payment) => (
                                        <div key={payment.id} className="bg-tg-secondary p-4 rounded-xl border border-tg-hint/10 flex justify-between items-center">
                                            <div>
                                                <div className="font-semibold text-tg-text text-lg">
                                                    {payment.amount.toLocaleString()} UZS
                                                </div>
                                                <div className="text-sm text-tg-hint flex items-center gap-2">
                                                    <span>📅 {new Date(payment.payment_date).toLocaleDateString()}</span>
                                                </div>
                                                {payment.description && (
                                                    <div className="text-xs text-tg-hint mt-1 italic">
                                                        {payment.description}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDelete(payment.id)}
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-tg-hint">
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
                                <label className="text-sm font-medium text-tg-hint ml-1">Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tg-hint" size={18} />
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-tg-secondary text-tg-text pl-11 p-3.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-tg-button/20"
                                    />
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-tg-hint ml-1">Amount (UZS)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0"
                                    className="w-full bg-tg-secondary text-tg-text p-3.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-tg-button/20 text-lg font-semibold"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-tg-hint ml-1">Note (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g. Salary for October"
                                    className="w-full bg-tg-secondary text-tg-text p-3.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-tg-button/20 resize-none h-24"
                                />
                            </div>

                            {/* Save Button */}
                            <div className="pt-4">
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="w-full py-3.5 rounded-xl bg-tg-button text-white font-semibold active:scale-[0.98] transition-all shadow-lg shadow-tg-button/20"
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
