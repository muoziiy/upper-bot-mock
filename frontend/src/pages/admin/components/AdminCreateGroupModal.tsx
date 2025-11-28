import React, { useState, useEffect } from 'react';
import { Clock, User, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

    // Custom Select State
    const [isTeacherSelectOpen, setIsTeacherSelectOpen] = useState(false);

    // Schedule State
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [time, setTime] = useState('14:00');

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Handle Native Back Button
    useEffect(() => {
        if (isOpen && webApp) {
            webApp.BackButton.show();
            const handleBack = () => {
                onClose();
            };
            webApp.BackButton.onClick(handleBack);
            return () => {
                webApp.BackButton.offClick(handleBack);
                // Don't hide here if we are going back to a page that needs it, 
                // but usually modals are on top of pages. 
                // If the underlying page (AdminGroups) needs it, it should re-mount or handle it.
                // However, AdminGroups is a main tab, so it likely doesn't need a back button.
                webApp.BackButton.hide();
            };
        }
    }, [isOpen, webApp, onClose]);

    useEffect(() => {
        if (isOpen) {
            fetchTeachers();
            // Reset form
            setName('');
            setPrice('');
            setTeacherId('');
            setSelectedDays([]);
            setTime('14:00');
        }
    }, [isOpen]);

    const fetchTeachers = async () => {
        try {
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

    const selectedTeacher = teachers.find(t => t.id === teacherId);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-tg-bg flex flex-col h-[100dvh]">
            {/* Header */}
            <div className="px-4 py-3 border-b border-tg-hint/10 flex items-center justify-center relative bg-tg-bg z-10">
                <h2 className="text-lg font-semibold text-tg-text">Create Group</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Name */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-tg-hint ml-1">Group Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. IELTS Foundation"
                        className="w-full bg-tg-secondary text-tg-text p-3.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-tg-button/50 transition-all placeholder:text-tg-hint/50"
                    />
                </div>

                {/* Price */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-tg-hint ml-1">Price (UZS)</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0"
                        className="w-full bg-tg-secondary text-tg-text p-3.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-tg-button/50 transition-all placeholder:text-tg-hint/50"
                    />
                </div>

                {/* Teacher Custom Select */}
                <div className="space-y-2 relative">
                    <label className="text-sm font-medium text-tg-hint ml-1">Teacher</label>
                    <button
                        onClick={() => setIsTeacherSelectOpen(!isTeacherSelectOpen)}
                        className="w-full bg-tg-secondary text-tg-text p-3.5 rounded-xl flex items-center justify-between active:scale-[0.99] transition-transform"
                    >
                        <div className="flex items-center gap-2">
                            <User size={18} className="text-tg-hint" />
                            <span className={!selectedTeacher ? "text-tg-hint" : ""}>
                                {selectedTeacher ? `${selectedTeacher.first_name} ${selectedTeacher.surname}` : "Select Teacher"}
                            </span>
                        </div>
                        <ChevronDown size={18} className={cn("text-tg-hint transition-transform", isTeacherSelectOpen ? "rotate-180" : "")} />
                    </button>

                    {/* Dropdown */}
                    <AnimatePresence>
                        {isTeacherSelectOpen && (
                            <>
                                <div className="fixed inset-0 z-20" onClick={() => setIsTeacherSelectOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-tg-bg border border-tg-hint/10 rounded-xl shadow-xl z-30 max-h-60 overflow-y-auto"
                                >
                                    {teachers.length > 0 ? (
                                        teachers.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => {
                                                    setTeacherId(t.id);
                                                    setIsTeacherSelectOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-tg-secondary/50 flex items-center justify-between border-b border-tg-hint/5 last:border-none"
                                            >
                                                <span>{t.first_name} {t.surname}</span>
                                                {teacherId === t.id && <Check size={16} className="text-tg-button" />}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-tg-hint text-sm">No teachers found</div>
                                    )}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* Schedule */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-tg-hint ml-1">Schedule</label>

                    {/* Custom Week Selector */}
                    <div className="flex justify-between gap-1">
                        {weekDays.map(day => (
                            <button
                                key={day}
                                onClick={() => handleDayToggle(day)}
                                className={cn(
                                    "w-10 h-10 rounded-full text-xs font-bold flex items-center justify-center transition-all",
                                    selectedDays.includes(day)
                                        ? "bg-tg-button text-white shadow-lg shadow-tg-button/30 scale-105"
                                        : "bg-tg-secondary text-tg-hint hover:bg-tg-secondary/80"
                                )}
                            >
                                {day.charAt(0)}
                            </button>
                        ))}
                    </div>

                    {/* Time Selector */}
                    <div className="relative">
                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tg-hint" size={18} />
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full bg-tg-secondary text-tg-text pl-11 p-3.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-tg-button/50"
                        />
                    </div>
                </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 border-t border-tg-hint/10 bg-tg-bg pb-8">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-tg-button text-white font-semibold active:scale-[0.98] transition-all shadow-lg shadow-tg-button/20 disabled:opacity-70 disabled:scale-100"
                >
                    {loading ? 'Creating...' : 'Create Group'}
                </button>
            </div>
        </div>
    );
};

export default AdminCreateGroupModal;
