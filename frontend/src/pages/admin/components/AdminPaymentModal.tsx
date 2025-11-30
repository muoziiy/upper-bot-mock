import React, { useState, useEffect } from 'react';
import { Calendar, Check, ChevronDown, Trash2, Plus, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { useTelegram } from '../../../context/TelegramContext';

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
        <div className="fixed inset-0 z-[60] bg-tg-bg flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-tg-hint/10 flex items-center justify-between bg-tg-bg">
                <h2 className="text-lg font-semibold text-tg-text">
                    {view === 'add' ? 'Add Payment' : `Payments - ${studentName}`}
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
                                Add Payment
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
                                                    <span>•</span>
                                                    <span className="capitalize">{payment.payment_method}</span>
                                                </div>
                                                {payment.subject_name && (
                                                    <div className="text-xs text-tg-button mt-1 font-medium">
                                                        {payment.subject_name}
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
                                        No payment history found.
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

                            {/* Group */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-tg-hint ml-1">Group</label>
                                <div className="relative">
                                    <select
                                        value={selectedGroupId}
                                        onChange={(e) => setSelectedGroupId(e.target.value)}
                                        className="w-full bg-tg-secondary text-tg-text p-3.5 rounded-xl border-none outline-none appearance-none focus:ring-2 focus:ring-tg-button/20"
                                    >
                                        <option value="" disabled>Select Group</option>
                                        {groups.map(g => (
                                            <option key={g.id} value={g.id}>{g.name} ({g.price.toLocaleString()} UZS)</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-tg-hint pointer-events-none" size={18} />
                                </div>
                            </div>

                            {/* Lessons Attended */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-tg-hint ml-1">Lessons Attended</label>
                                <input
                                    type="number"
                                    value={lessonsAttended}
                                    onChange={(e) => setLessonsAttended(e.target.value)}
                                    className="w-full bg-tg-secondary text-tg-text p-3.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-tg-button/20"
                                />
                                <p className="text-xs text-tg-hint ml-1">
                                    💡 Expected: {expectedAmount.toLocaleString()} UZS ({lessonsAttended}/12 lessons)
                                </p>
                            </div>

                            {/* Payment Method */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-tg-hint ml-1">Payment Method</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setMethod('cash')}
                                        className={cn(
                                            "flex-1 py-3 rounded-xl border transition-all flex items-center justify-center gap-2",
                                            method === 'cash'
                                                ? "bg-tg-button/10 border-tg-button text-tg-button"
                                                : "bg-tg-secondary border-transparent text-tg-hint"
                                        )}
                                    >
                                        <span>💵</span> Cash
                                        {method === 'cash' && <Check size={16} />}
                                    </button>
                                    <button
                                        onClick={() => setMethod('card')}
                                        className={cn(
                                            "flex-1 py-3 rounded-xl border transition-all flex items-center justify-center gap-2",
                                            method === 'card'
                                                ? "bg-tg-button/10 border-tg-button text-tg-button"
                                                : "bg-tg-secondary border-transparent text-tg-hint"
                                        )}
                                    >
                                        <span>💳</span> Card
                                        {method === 'card' && <Check size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-tg-hint ml-1">Amount Paid</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => {
                                            setAmount(e.target.value);
                                            setShowConfirmation(false);
                                        }}
                                        placeholder="0"
                                        className={cn(
                                            "w-full bg-tg-secondary text-tg-text p-3.5 rounded-xl border outline-none focus:ring-2 transition-all text-lg font-semibold",
                                            amount && !isAmountMatching
                                                ? "border-red-300 focus:ring-red-500/20 text-red-500"
                                                : amount && isAmountMatching
                                                    ? "border-green-300 focus:ring-green-500/20 text-green-500"
                                                    : "border-transparent focus:ring-tg-button/20"
                                        )}
                                    />
                                    {amount && isAmountMatching && (
                                        <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-500" size={20} />
                                    )}
                                </div>
                                {amount && !isAmountMatching && (
                                    <p className="text-xs text-red-500 flex items-center gap-1 ml-1">
                                        <AlertTriangle size={12} />
                                        Amount differs from expected {expectedAmount.toLocaleString()} UZS
                                    </p>
                                )}
                            </div>

                            {/* Save Button */}
                            <div className="pt-4">
                                {showConfirmation ? (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
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
                                        className="w-full py-3.5 rounded-xl bg-tg-button text-white font-semibold active:scale-[0.98] transition-all shadow-lg shadow-tg-button/20"
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
