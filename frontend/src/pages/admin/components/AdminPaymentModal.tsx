import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { useTelegram } from '../../../context/TelegramContext';
import { AdminSection } from './AdminSection';
import { AdminListItem } from './AdminListItem';

interface Payment {
    id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    subject_name?: string; // or group name
    group_id?: string;
}

interface Group {
    id: string;
    name: string;
    price: number;
}

interface AdminPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    studentName: string;
    groups: Group[]; // Passed from parent
    defaultGroupId?: string | null;
}

const AdminPaymentModal: React.FC<AdminPaymentModalProps> = ({ isOpen, onClose, studentId, studentName, groups, defaultGroupId }) => {
    const { webApp } = useTelegram();
    const [view, setView] = useState<'history' | 'add'>('history');
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(false);

    // Add Payment Form State
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedGroupId, setSelectedGroupId] = useState<string>('');
    const [lessonsAttended, setLessonsAttended] = useState<string>('12');
    const [amount, setAmount] = useState<string>('');
    const [method, setMethod] = useState<'cash' | 'card'>('cash');
    const [showConfirmation, setShowConfirmation] = useState(false);

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

    // Set default group
    useEffect(() => {
        if (defaultGroupId) {
            setSelectedGroupId(defaultGroupId);
        } else if (groups.length > 0 && !selectedGroupId) {
            setSelectedGroupId(groups[0].id);
        }
    }, [groups, defaultGroupId, isOpen]);

    const fetchPayments = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/students/${studentId}/payments`);
            if (res.ok) {
                const data = await res.json();
                setPayments(data);
            }
        } catch (e) {
            console.error('Failed to fetch payments', e);
        }
    };

    const handleDelete = async (paymentId: string) => {
        webApp.showConfirm('Are you sure you want to delete this payment?', async (confirm) => {
            if (confirm) {
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/students/${studentId}/payments/${paymentId}`, {
                        method: 'DELETE'
                    });
                    if (res.ok) {
                        fetchPayments();
                        webApp.showAlert('Payment deleted');
                    }
                } catch (e) {
                    webApp.showAlert('Failed to delete payment');
                }
            }
        });
    };

    const calculateExpectedAmount = () => {
        const group = groups.find(g => g.id === selectedGroupId);
        if (!group || !lessonsAttended) return 0;
        const lessons = parseInt(lessonsAttended);
        if (isNaN(lessons)) return 0;
        // Logic: Price is for 12 lessons usually.
        return Math.round((group.price / 12) * lessons);
    };

    const expectedAmount = calculateExpectedAmount();
    const isAmountMatching = parseInt(amount?.replace(/,/g, '') || '0') === expectedAmount;

    const handleSave = async () => {
        if (!amount || !selectedGroupId) {
            webApp.showAlert('Please fill in all fields');
            return;
        }

        if (!isAmountMatching && !showConfirmation) {
            setShowConfirmation(true);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/students/${studentId}/payments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    payment_date: date,
                    payment_method: method,
                    group_id: selectedGroupId,
                    lessons_attended: parseInt(lessonsAttended),
                    status: 'completed',
                    month: new Date(date).getMonth() + 1,
                    year: new Date(date).getFullYear()
                })
            });

            if (res.ok) {
                webApp?.showPopup({
                    title: 'Success',
                    message: 'Payment saved successfully',
                    buttons: [{ type: 'ok' }]
                });
                fetchPayments();
                setView('history');
                // Reset form
                setAmount('');
                setShowConfirmation(false);
            } else {
                throw new Error('Failed');
            }
        } catch (e) {
            webApp.showAlert('Failed to save payment');
        } finally {
            setLoading(false);
        }
    };

    // Auto-calculate amount when lessons or group changes
    useEffect(() => {
        const newAmount = calculateExpectedAmount();
        if (newAmount > 0) {
            setAmount(newAmount.toString());
        }
    }, [lessonsAttended, selectedGroupId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-[#F2F2F7] dark:bg-[#000000] flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-tg-hint/10 flex items-center justify-between bg-[#F2F2F7] dark:bg-[#000000]">
                <h2 className="text-lg font-semibold text-black dark:text-white">
                    {view === 'add' ? 'Add Payment' : `Payments - ${studentName}`}
                </h2>
                <button onClick={onClose} className="text-tg-button font-medium">
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
                            {/* Actions */}
                            <AdminSection>
                                <AdminListItem
                                    title="Add Payment"
                                    icon="➕"
                                    iconColor="bg-blue-500"
                                    onClick={() => setView('add')}
                                    isLast
                                />
                            </AdminSection>

                            {/* History List */}
                            <AdminSection title="History">
                                {payments.length > 0 ? (
                                    payments.map((payment, index) => (
                                        <AdminListItem
                                            key={payment.id}
                                            title={`${payment.amount.toLocaleString()} UZS`}
                                            subtitle={`${new Date(payment.payment_date).toLocaleDateString()} • ${payment.payment_method} • ${payment.subject_name || 'General'}`}
                                            icon="💰"
                                            iconColor="bg-green-500"
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
                                        No payment history found.
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
                            <AdminSection title="Payment Details">
                                {/* Date */}
                                <div className="px-4 py-3 bg-white dark:bg-[#1C1C1E] border-b border-[#C6C6C8] dark:border-[#38383A] flex items-center justify-between">
                                    <span className="text-[17px] text-black dark:text-white">Date</span>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="bg-transparent text-right text-[17px] text-[#8E8E93] outline-none"
                                    />
                                </div>

                                {/* Group */}
                                <div className="px-4 py-3 bg-white dark:bg-[#1C1C1E] border-b border-[#C6C6C8] dark:border-[#38383A] flex items-center justify-between">
                                    <span className="text-[17px] text-black dark:text-white">Group</span>
                                    <select
                                        value={selectedGroupId}
                                        onChange={(e) => setSelectedGroupId(e.target.value)}
                                        className="bg-transparent text-right text-[17px] text-[#8E8E93] outline-none appearance-none"
                                    >
                                        <option value="" disabled>Select Group</option>
                                        {groups.map(g => (
                                            <option key={g.id} value={g.id}>{g.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Lessons */}
                                <div className="px-4 py-3 bg-white dark:bg-[#1C1C1E] border-b border-[#C6C6C8] dark:border-[#38383A] flex items-center justify-between">
                                    <span className="text-[17px] text-black dark:text-white">Lessons</span>
                                    <input
                                        type="number"
                                        value={lessonsAttended}
                                        onChange={(e) => setLessonsAttended(e.target.value)}
                                        className="bg-transparent text-right text-[17px] text-[#8E8E93] outline-none w-20"
                                    />
                                </div>

                                {/* Method */}
                                <div className="px-4 py-3 bg-white dark:bg-[#1C1C1E] border-b border-[#C6C6C8] dark:border-[#38383A] flex items-center justify-between">
                                    <span className="text-[17px] text-black dark:text-white">Method</span>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setMethod('cash')}
                                            className={cn("text-[17px] transition-colors", method === 'cash' ? "text-blue-500 font-semibold" : "text-[#8E8E93]")}
                                        >
                                            Cash
                                        </button>
                                        <button
                                            onClick={() => setMethod('card')}
                                            className={cn("text-[17px] transition-colors", method === 'card' ? "text-blue-500 font-semibold" : "text-[#8E8E93]")}
                                        >
                                            Card
                                        </button>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="px-4 py-3 bg-white dark:bg-[#1C1C1E] flex items-center justify-between">
                                    <span className="text-[17px] text-black dark:text-white">Amount</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => {
                                            setAmount(e.target.value);
                                            setShowConfirmation(false);
                                        }}
                                        placeholder="0"
                                        className={cn(
                                            "bg-transparent text-right text-[17px] outline-none w-32",
                                            amount && !isAmountMatching ? "text-red-500" : "text-blue-500"
                                        )}
                                    />
                                </div>
                            </AdminSection>

                            {amount && !isAmountMatching && (
                                <div className="px-4 mb-6 text-xs text-red-500 flex items-center gap-1">
                                    <AlertTriangle size={12} />
                                    Expected: {expectedAmount.toLocaleString()} UZS
                                </div>
                            )}

                            <div className="px-4">
                                {showConfirmation ? (
                                    <div className="space-y-2">
                                        <p className="text-center text-red-500 text-sm font-medium">
                                            ⚠️ Amount mismatch. Are you sure?
                                        </p>
                                        <button
                                            onClick={handleSave}
                                            disabled={loading}
                                            className="w-full py-3.5 rounded-xl bg-red-500 text-white font-semibold active:scale-[0.98] transition-all"
                                        >
                                            Yes, Save Payment
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="w-full py-3.5 rounded-xl bg-blue-500 text-white font-semibold active:scale-[0.98] transition-all"
                                    >
                                        Save Payment
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminPaymentModal;
