import React, { useState, useEffect } from 'react';
import { X, Clock, DollarSign, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { useTelegram } from '../../../context/TelegramContext';

interface AdminCreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AdminCreateGroupModal: React.FC<AdminCreateGroupModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { webApp } = useTelegram();
    const [loading, setLoading] = useState(false);
    const [teachers, setTeachers] = useState<{ id: string, first_name: string, surname: string }[]>([]);

    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [teacherId, setTeacherId] = useState('');
    const [paymentModel, setPaymentModel] = useState<'monthly_date' | '12_lessons'>('monthly_date');

    // Schedule State
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [time, setTime] = useState('14:00');

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    useEffect(() => {
        if (isOpen) {
            fetchTeachers();
        }
    }, [isOpen]);

    const fetchTeachers = async () => {
        try {
            // Fetch teachers (assuming endpoint exists or filtering users)
            // For now, using a placeholder or assuming /admin/teachers endpoint exists
            // If not, we might need to fetch users?role=teacher
            // Let's assume we can fetch users and filter
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`);
            if (res.ok) {
                const data = await res.json();
                setTeachers(data.filter((u: any) => u.role === 'teacher'));
            }
        } catch (e) {
            console.error('Failed to fetch teachers', e);
        }
    };

    const handleDayToggle = (day: string) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    const handleSubmit = async () => {
        if (!name || !price) {
            webApp?.showAlert('Please fill in Name and Price');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/groups`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    price: parseFloat(price),
                    teacher_id: teacherId || null,
                    payment_model: paymentModel,
                    schedule: {
                        days: selectedDays,
                        time
                    }
                })
            });

            if (res.ok) {
                webApp?.showPopup({
                    title: 'Success',
                    message: 'Group created successfully',
                    buttons: [{ type: 'ok' }]
                });
                onSuccess();
                onClose();
            } else {
                throw new Error('Failed to create group');
            }
        } catch (e) {
            webApp?.showAlert('Failed to create group');
        } finally {
            setLoading(false);
        }
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
                <div className="flex items-center justify-between p-4 border-b border-tg-hint/10">
                    <h2 className="text-lg font-semibold text-tg-text">Create New Group</h2>
                    <button onClick={onClose} className="p-2 hover:bg-tg-hint/10 rounded-full">
                        <X size={20} className="text-tg-hint" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto space-y-5">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-tg-hint">Group Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. IELTS Foundation"
                            className="w-full bg-tg-secondary text-tg-text p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-tg-button/50"
                        />
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-tg-hint">Price (UZS)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-tg-hint" size={18} />
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0"
                                className="w-full bg-tg-secondary text-tg-text pl-10 p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-tg-button/50"
                            />
                        </div>
                    </div>

                    {/* Teacher */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-tg-hint">Teacher</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-tg-hint" size={18} />
                            <select
                                value={teacherId}
                                onChange={(e) => setTeacherId(e.target.value)}
                                className="w-full bg-tg-secondary text-tg-text pl-10 p-3 rounded-xl border-none outline-none appearance-none focus:ring-2 focus:ring-tg-button/50"
                            >
                                <option value="">Select Teacher</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.first_name} {t.surname}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Payment Model */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-tg-hint">Payment Model</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setPaymentModel('monthly_date')}
                                className={cn(
                                    "p-3 rounded-xl text-sm font-medium transition-all border",
                                    paymentModel === 'monthly_date'
                                        ? "bg-tg-button text-white border-tg-button"
                                        : "bg-tg-secondary text-tg-text border-transparent"
                                )}
                            >
                                Monthly Date
                            </button>
                            <button
                                onClick={() => setPaymentModel('12_lessons')}
                                className={cn(
                                    "p-3 rounded-xl text-sm font-medium transition-all border",
                                    paymentModel === '12_lessons'
                                        ? "bg-tg-button text-white border-tg-button"
                                        : "bg-tg-secondary text-tg-text border-transparent"
                                )}
                            >
                                12 Lessons
                            </button>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-tg-hint">Schedule</label>

                        {/* Custom Week Selector */}
                        <div className="flex justify-between gap-1">
                            {weekDays.map(day => (
                                <button
                                    key={day}
                                    onClick={() => handleDayToggle(day)}
                                    className={cn(
                                        "w-10 h-10 rounded-full text-xs font-bold flex items-center justify-center transition-all",
                                        selectedDays.includes(day)
                                            ? "bg-tg-button text-white shadow-md scale-105"
                                            : "bg-tg-secondary text-tg-hint hover:bg-tg-secondary/80"
                                    )}
                                >
                                    {day.charAt(0)}
                                </button>
                            ))}
                        </div>

                        {/* Time Selector */}
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-tg-hint" size={18} />
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full bg-tg-secondary text-tg-text pl-10 p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-tg-button/50"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-tg-button text-white font-semibold active:opacity-90 transition-opacity mt-4"
                    >
                        {loading ? 'Creating...' : 'Create Group'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminCreateGroupModal;
