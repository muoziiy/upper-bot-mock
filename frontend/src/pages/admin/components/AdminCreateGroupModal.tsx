import React, { useState, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { useTelegram } from '../../../context/TelegramContext';
import { AdminSection } from './AdminSection';
import { AdminListItem } from './AdminListItem';

interface Group {
    id: string;
    name: string;
    price: number;
    teacher_id: string | null;
    schedule: {
        days: string[];
        time: string;
    };
}

interface AdminCreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    group?: Group | null; // Optional group for editing
}

const AdminCreateGroupModal: React.FC<AdminCreateGroupModalProps> = ({ isOpen, onClose, onSuccess, group }) => {
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
                webApp.BackButton.hide();
            };
        }
    }, [isOpen, webApp, onClose]);

    useEffect(() => {
        if (isOpen) {
            fetchTeachers();
            if (group) {
                // Edit Mode
                setName(group.name);
                setPrice(group.price.toString());
                setTeacherId(group.teacher_id || '');
                setSelectedDays(group.schedule?.days || []);
                setTime(group.schedule?.time || '14:00');
            } else {
                // Create Mode
                setName('');
                setPrice('');
                setTeacherId('');
                setSelectedDays([]);
                setTime('14:00');
            }
        }
    }, [isOpen, group]);

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

    const formatPrice = (value: string) => {
        // Remove non-digits
        const number = value.replace(/\D/g, '');
        // Add spaces
        return number.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\s/g, '');
        if (!/^\d*$/.test(rawValue)) return;
        setPrice(rawValue);
    };

    const handleSubmit = async () => {
        if (!name || !price) {
            webApp?.showAlert('Please fill in Name and Price');
            return;
        }

        setLoading(true);
        try {
            const url = group
                ? `${import.meta.env.VITE_API_URL}/admin/groups/${group.id}`
                : `${import.meta.env.VITE_API_URL}/admin/groups`;

            const method = group ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
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
                    message: group ? 'Group updated successfully' : 'Group created successfully',
                    buttons: [{ type: 'ok' }]
                });
                onSuccess();
                onClose();
            } else {
                throw new Error('Failed to save group');
            }
        } catch (e) {
            webApp?.showAlert('Failed to save group');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!group) return;

        webApp?.showConfirm('Are you sure you want to delete this group?', async (confirm) => {
            if (confirm) {
                setLoading(true);
                try {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/groups/${group.id}`, {
                        method: 'DELETE'
                    });

                    if (res.ok) {
                        webApp?.showPopup({
                            title: 'Deleted',
                            message: 'Group deleted successfully',
                            buttons: [{ type: 'ok' }]
                        });
                        onSuccess();
                        onClose();
                    } else {
                        throw new Error('Failed to delete group');
                    }
                } catch (e) {
                    webApp?.showAlert('Failed to delete group');
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const selectedTeacher = teachers.find(t => t.id === teacherId);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-[#F2F2F7] dark:bg-[#000000] flex flex-col h-[100dvh]">
            {/* Header */}
            <div className="px-4 py-3 border-b border-tg-hint/10 flex items-center justify-between bg-[#F2F2F7] dark:bg-[#000000]">
                <h2 className="text-lg font-semibold text-black dark:text-white">{group ? 'Edit Group' : 'Create Group'}</h2>
                <button onClick={onClose} className="text-tg-button font-medium">
                    Cancel
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pt-4">
                <AdminSection title="Group Details">
                    {/* Name */}
                    <div className="px-4 py-3 bg-white dark:bg-[#1C1C1E] border-b border-[#C6C6C8] dark:border-[#38383A] flex items-center justify-between">
                        <span className="text-[17px] text-black dark:text-white">Name</span>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. IELTS Foundation"
                            className="bg-transparent text-right text-[17px] text-blue-500 outline-none placeholder:text-[#8E8E93]"
                        />
                    </div>

                    {/* Price */}
                    <div className="px-4 py-3 bg-white dark:bg-[#1C1C1E] border-b border-[#C6C6C8] dark:border-[#38383A] flex items-center justify-between">
                        <span className="text-[17px] text-black dark:text-white">Price</span>
                        <input
                            type="text"
                            value={formatPrice(price)}
                            onChange={handlePriceChange}
                            placeholder="0"
                            className="bg-transparent text-right text-[17px] text-blue-500 outline-none placeholder:text-[#8E8E93]"
                        />
                    </div>

                    {/* Teacher */}
                    <div className="px-4 py-3 bg-white dark:bg-[#1C1C1E] flex items-center justify-between" onClick={() => setIsTeacherSelectOpen(true)}>
                        <span className="text-[17px] text-black dark:text-white">Teacher</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[17px] text-[#8E8E93]">
                                {selectedTeacher ? `${selectedTeacher.first_name} ${selectedTeacher.surname}` : "Select"}
                            </span>
                            <ChevronDown size={16} className="text-[#8E8E93]" />
                        </div>
                    </div>
                </AdminSection>

                <AdminSection title="Schedule">
                    {/* Days */}
                    <div className="px-4 py-3 bg-white dark:bg-[#1C1C1E] border-b border-[#C6C6C8] dark:border-[#38383A]">
                        <div className="flex justify-between gap-1">
                            {weekDays.map(day => (
                                <button
                                    key={day}
                                    onClick={() => handleDayToggle(day)}
                                    className={cn(
                                        "w-9 h-9 rounded-full text-[15px] font-medium flex items-center justify-center transition-all",
                                        selectedDays.includes(day)
                                            ? "bg-blue-500 text-white"
                                            : "bg-[#E5E5EA] dark:bg-[#2C2C2E] text-black dark:text-white"
                                    )}
                                >
                                    {day.charAt(0)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time */}
                    <div className="px-4 py-3 bg-white dark:bg-[#1C1C1E] flex items-center justify-between">
                        <span className="text-[17px] text-black dark:text-white">Time</span>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="bg-transparent text-right text-[17px] text-blue-500 outline-none"
                        />
                    </div>
                </AdminSection>

                {group && (
                    <AdminSection>
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="w-full py-3 text-[17px] text-red-500 bg-white dark:bg-[#1C1C1E] active:bg-[#E5E5EA] dark:active:bg-[#2C2C2E] transition-colors"
                        >
                            Delete Group
                        </button>
                    </AdminSection>
                )}

                <div className="px-4 mt-6">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-blue-500 text-white font-semibold active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70"
                    >
                        {loading ? 'Saving...' : (group ? 'Save Changes' : 'Create Group')}
                    </button>
                </div>
            </div>

            {/* Teacher Selection Modal */}
            <AnimatePresence>
                {isTeacherSelectOpen && (
                    <>
                        <div className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-sm" onClick={() => setIsTeacherSelectOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            className="fixed bottom-0 left-0 right-0 z-[80] bg-[#F2F2F7] dark:bg-[#1C1C1E] rounded-t-2xl max-h-[70vh] flex flex-col"
                        >
                            <div className="px-4 py-3 border-b border-[#C6C6C8] dark:border-[#38383A] flex justify-between items-center">
                                <span className="text-[17px] font-semibold text-black dark:text-white">Select Teacher</span>
                                <button onClick={() => setIsTeacherSelectOpen(false)} className="text-blue-500 font-medium">Done</button>
                            </div>
                            <div className="overflow-y-auto p-4">
                                <AdminSection>
                                    {teachers.map((t, index) => (
                                        <AdminListItem
                                            key={t.id}
                                            title={`${t.first_name} ${t.surname}`}
                                            onClick={() => {
                                                setTeacherId(t.id);
                                                setIsTeacherSelectOpen(false);
                                            }}
                                            rightElement={teacherId === t.id ? <Check size={20} className="text-blue-500" /> : null}
                                            isLast={index === teachers.length - 1}
                                        />
                                    ))}
                                </AdminSection>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminCreateGroupModal;
