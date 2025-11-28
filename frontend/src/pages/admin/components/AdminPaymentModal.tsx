import React, { useState, useEffect } from 'react';
import { Calendar, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { useTelegram } from '../../../context/TelegramContext';

interface AdminPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    studentName: string;
}

const AdminPaymentModal: React.FC<AdminPaymentModalProps> = ({ isOpen, onClose, studentId, studentName }) => {
    const { webApp } = useTelegram();
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [method, setMethod] = useState<'cash' | 'card' | 'click' | 'payme'>('cash');
    const [isMethodOpen, setIsMethodOpen] = useState(false);

    // Handle Native Back Button
    useEffect(() => {
        if (isOpen && webApp) {
            webApp.BackButton.show();
            const handleBack = () => onClose();
            webApp.BackButton.onClick(handleBack);
            return () => {
                webApp.BackButton.offClick(handleBack);
                webApp.BackButton.hide();
            };
        }
    }, [isOpen, webApp, onClose]);

    const handleSubmit = async () => {
        if (!amount || !date) {
            webApp?.showAlert('Please fill in Amount and Date');
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
                    status: 'completed',
                    month: new Date(date).getMonth() + 1,
                    year: new Date(date).getFullYear()
                })
            });

            if (res.ok) {
                webApp?.showPopup({
                    title: 'Success',
                    message: 'Payment recorded successfully',
                    buttons: [{ type: 'ok' }]
                });
                onClose();
            } else {
                throw new Error('Failed to record payment');
            }
        } catch (e) {
            webApp?.showAlert('Failed to record payment');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const methods = [
        { id: 'cash', label: 'Cash', icon: '💵' },
        { id: 'card', label: 'Card', icon: '💳' },
        { id: 'click', label: 'Click', icon: '🔵' },
        { id: 'payme', label: 'Payme', icon: '🟢' }
    ];

    const selectedMethod = methods.find(m => m.id === method);

    return (
        <div className="fixed inset-0 z-[60] bg-tg-bg flex flex-col h-[100dvh]">
            {/* Header */}
            <div className="px-4 py-3 border-b border-tg-hint/10 flex items-center justify-center relative bg-tg-bg z-10">
                <h2 className="text-lg font-semibold text-tg-text">Record Payment</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-tg-secondary rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
                        💰
                    </div>
                    <h3 className="text-xl font-bold text-tg-text">{studentName}</h3>
                    <p className="text-tg-hint text-sm">New Payment Record</p>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-tg-hint ml-1">Amount (UZS)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="w-full bg-tg-secondary text-tg-text p-3.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-tg-button/50 transition-all placeholder:text-tg-hint/50 text-lg font-medium"
                    />
                </div>

                {/* Date */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-tg-hint ml-1">Payment Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tg-hint" size={18} />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-tg-secondary text-tg-text pl-11 p-3.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-tg-button/50"
                        />
                    </div>
                </div>

                {/* Method Selector */}
                <div className="space-y-2 relative">
                    <label className="text-sm font-medium text-tg-hint ml-1">Payment Method</label>
                    <button
                        onClick={() => setIsMethodOpen(!isMethodOpen)}
                        className="w-full bg-tg-secondary text-tg-text p-3.5 rounded-xl flex items-center justify-between active:scale-[0.99] transition-transform"
                    >
                        <div className="flex items-center gap-2">
                            <span>{selectedMethod?.icon}</span>
                            <span>{selectedMethod?.label}</span>
                        </div>
                        <ChevronDown size={18} className={cn("text-tg-hint transition-transform", isMethodOpen ? "rotate-180" : "")} />
                    </button>

                    <AnimatePresence>
                        {isMethodOpen && (
                            <>
                                <div className="fixed inset-0 z-20" onClick={() => setIsMethodOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-tg-bg border border-tg-hint/10 rounded-xl shadow-xl z-30 overflow-hidden"
                                >
                                    {methods.map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => {
                                                setMethod(m.id as any);
                                                setIsMethodOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-tg-secondary/50 flex items-center justify-between border-b border-tg-hint/5 last:border-none"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>{m.icon}</span>
                                                <span>{m.label}</span>
                                            </div>
                                            {method === m.id && <Check size={16} className="text-tg-button" />}
                                        </button>
                                    ))}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 border-t border-tg-hint/10 bg-tg-bg pb-8">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-tg-button text-white font-semibold active:scale-[0.98] transition-all shadow-lg shadow-tg-button/20 disabled:opacity-70 disabled:scale-100"
                >
                    {loading ? 'Processing...' : 'Confirm Payment'}
                </button>
            </div>
        </div>
    );
};

export default AdminPaymentModal;
