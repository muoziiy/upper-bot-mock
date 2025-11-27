import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, CreditCard, Banknote, Trash2, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { useTelegram } from '../../../context/TelegramContext';

interface Payment {
    id: string;
    amount: number;
    payment_date: string;
    payment_method: 'cash' | 'card';
    status: 'paid' | 'pending' | 'unpaid';
    subject_name?: string;
    subject_id?: string;
    notes?: string;
}

interface Subject {
    id: string;
    name: string;
}

interface AdminPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    studentName: string;
}

const AdminPaymentModal: React.FC<AdminPaymentModalProps> = ({ isOpen, onClose, studentId, studentName }) => {
    const { webApp } = useTelegram();
    const [view, setView] = useState<'list' | 'add'>('list');
    const [payments, setPayments] = useState<Payment[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        subject_id: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash' as 'cash' | 'card',
        status: 'paid' as 'paid' | 'pending' | 'unpaid',
        notes: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchPayments();
            fetchSubjects();
        }
    }, [isOpen, studentId]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/students/${studentId}/payments`);
            if (res.ok) {
                const data = await res.json();
                setPayments(data);
            }
        } catch (e) {
            console.error('Failed to fetch payments', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/subjects`);
            if (res.ok) {
                const data = await res.json();
                setSubjects(data);
            }
        } catch (e) {
            console.error('Failed to fetch subjects', e);
        }
    };

    const handleSubmit = async () => {
        if (!formData.subject_id || !formData.amount) {
            webApp?.showAlert('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/students/${studentId}/payments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    month: new Date(formData.payment_date).getMonth() + 1,
                    year: new Date(formData.payment_date).getFullYear()
                })
            });

            if (res.ok) {
                webApp?.showPopup({
                    title: 'Success',
                    message: 'Payment recorded successfully.',
                    buttons: [{ type: 'ok' }]
                });
                setView('list');
                fetchPayments();
                // Reset form
                setFormData({
                    subject_id: '',
                    amount: '',
                    payment_date: new Date().toISOString().split('T')[0],
                    payment_method: 'cash',
                    status: 'paid',
                    notes: ''
                });
            } else {
                throw new Error('Failed to save');
            }
        } catch (e) {
            webApp?.showAlert('Failed to save payment');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (paymentId: string) => {
        webApp?.showConfirm('Are you sure you want to delete this payment?', async (confirm) => {
            if (confirm) {
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/students/${studentId}/payments/${paymentId}`, {
                        method: 'DELETE'
                    });
                    if (res.ok) {
                        fetchPayments();
                    }
                } catch (e) {
                    console.error('Failed to delete', e);
                }
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="bg-tg-bg w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-xl max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-tg-hint/10 bg-tg-secondary/50">
                    <h2 className="text-lg font-semibold text-tg-text">
                        {view === 'add' ? 'Add Payment' : 'Payments'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-tg-hint/10 rounded-full transition-colors">
                        <X size={20} className="text-tg-hint" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {view === 'list' ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-tg-hint">History for {studentName}</p>
                                <button
                                    onClick={() => setView('add')}
                                    className="flex items-center gap-1.5 bg-tg-button text-white px-3 py-1.5 rounded-lg text-sm font-medium active:opacity-80 transition-opacity"
                                >
                                    <Plus size={16} />
                                    Add New
                                </button>
                            </div>

                            {loading ? (
                                <div className="text-center py-8 text-tg-hint">Loading...</div>
                            ) : payments.length > 0 ? (
                                <div className="space-y-3">
                                    {payments.map((payment) => (
                                        <div key={payment.id} className="bg-tg-secondary/30 p-3 rounded-xl border border-tg-hint/10 flex justify-between items-center">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-tg-text">{payment.subject_name || 'Unknown Subject'}</span>
                                                    <span className={cn(
                                                        "text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold",
                                                        payment.status === 'paid' ? "bg-green-500/10 text-green-500" :
                                                            payment.status === 'pending' ? "bg-yellow-500/10 text-yellow-500" :
                                                                "bg-red-500/10 text-red-500"
                                                    )}>
                                                        {payment.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-tg-hint mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {new Date(payment.payment_date).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        {payment.payment_method === 'cash' ? <Banknote size={12} /> : <CreditCard size={12} />}
                                                        {payment.payment_method}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-tg-text">${payment.amount}</span>
                                                <button
                                                    onClick={() => handleDelete(payment.id)}
                                                    className="text-red-500 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-tg-hint">
                                    <div className="text-4xl mb-2">💸</div>
                                    No payments recorded
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Subject Select */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-tg-hint uppercase ml-1">Subject</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {subjects.map((subject) => (
                                        <button
                                            key={subject.id}
                                            onClick={() => setFormData({ ...formData, subject_id: subject.id })}
                                            className={cn(
                                                "p-3 rounded-xl text-sm font-medium border transition-all text-left",
                                                formData.subject_id === subject.id
                                                    ? "bg-tg-button text-white border-tg-button"
                                                    : "bg-tg-secondary border-transparent text-tg-text hover:bg-tg-secondary/80"
                                            )}
                                        >
                                            {subject.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Amount */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-tg-hint uppercase ml-1">Amount</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-tg-hint" size={18} />
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full bg-tg-secondary text-tg-text pl-10 pr-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-tg-button/50"
                                    />
                                </div>
                            </div>

                            {/* Date */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-tg-hint uppercase ml-1">Date</label>
                                <input
                                    type="date"
                                    value={formData.payment_date}
                                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                                    className="w-full bg-tg-secondary text-tg-text px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-tg-button/50"
                                />
                            </div>

                            {/* Method */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-tg-hint uppercase ml-1">Method</label>
                                <div className="flex bg-tg-secondary p-1 rounded-xl">
                                    {(['cash', 'card'] as const).map((method) => (
                                        <button
                                            key={method}
                                            onClick={() => setFormData({ ...formData, payment_method: method })}
                                            className={cn(
                                                "flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                                                formData.payment_method === method
                                                    ? "bg-tg-bg text-tg-text shadow-sm"
                                                    : "text-tg-hint hover:text-tg-text"
                                            )}
                                        >
                                            {method === 'cash' ? <Banknote size={16} /> : <CreditCard size={16} />}
                                            {method.charAt(0).toUpperCase() + method.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-tg-hint uppercase ml-1">Status</label>
                                <div className="flex gap-2">
                                    {(['paid', 'pending', 'unpaid'] as const).map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setFormData({ ...formData, status })}
                                            className={cn(
                                                "flex-1 py-2 rounded-xl text-sm font-medium border transition-all capitalize",
                                                formData.status === status
                                                    ? status === 'paid' ? "bg-green-500/10 border-green-500 text-green-500"
                                                        : status === 'pending' ? "bg-yellow-500/10 border-yellow-500 text-yellow-500"
                                                            : "bg-red-500/10 border-red-500 text-red-500"
                                                    : "bg-tg-secondary border-transparent text-tg-hint"
                                            )}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-tg-hint uppercase ml-1">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Optional notes..."
                                    className="w-full bg-tg-secondary text-tg-text px-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-tg-button/50 min-h-[80px]"
                                />
                            </div>

                            {/* Actions */}
                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => setView('list')}
                                    className="flex-1 py-3 rounded-xl font-medium bg-tg-secondary text-tg-text hover:bg-tg-secondary/80 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex-1 py-3 rounded-xl font-medium bg-tg-button text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save Payment'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AdminPaymentModal;
