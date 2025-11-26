import React, { useEffect, useState } from 'react';
import { useTelegram } from '../../context/TelegramContext';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ParentAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    child: any;
}

const ParentAttendanceModal: React.FC<ParentAttendanceModalProps> = ({ isOpen, onClose, child }) => {
    const { t } = useTranslation();
    const { webApp } = useTelegram();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [showSubjectSelector, setShowSubjectSelector] = useState(false);

    useEffect(() => {
        if (isOpen && webApp) {
            webApp.BackButton.show();
            webApp.BackButton.onClick(onClose);

            return () => {
                webApp.BackButton.hide();
                webApp.BackButton.offClick(onClose);
            };
        }
    }, [isOpen, webApp, onClose]);

    useEffect(() => {
        if (child?.subjects && child.subjects.length > 0 && !selectedSubject) {
            setSelectedSubject(child.subjects[0].name);
        }
    }, [child, selectedSubject]);

    // Mock attendance data
    const mockAttendance = {
        '2024-11-01': 'present',
        '2024-11-03': 'present',
        '2024-11-05': 'absent',
        '2024-11-08': 'present',
        '2024-11-10': 'late',
        '2024-11-12': 'present',
        '2024-11-15': 'present',
        '2024-11-17': 'absent',
        '2024-11-19': 'present',
        '2024-11-22': 'present',
        '2024-11-24': 'late',
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek };
    };

    const getAttendanceStatus = (day: number) => {
        const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return mockAttendance[dateStr as keyof typeof mockAttendance];
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present': return 'bg-green-500';
            case 'absent': return 'bg-red-500';
            case 'late': return 'bg-yellow-500';
            default: return 'bg-tg-secondary';
        }
    };

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: startingDayOfWeek }, (_, i) => i);

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    // Calculate stats
    const presentDays = Object.values(mockAttendance).filter(s => s === 'present').length;
    const absentDays = Object.values(mockAttendance).filter(s => s === 'absent').length;
    const lateDays = Object.values(mockAttendance).filter(s => s === 'late').length;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 500 }}
                        className="fixed inset-x-0 bottom-0 bg-tg-bg rounded-t-3xl z-[60] max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-tg-bg border-b border-tg-hint/10 px-4 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-tg-text">{t('profile.attendance')}</h2>
                                <p className="text-sm text-tg-hint">
                                    {child.first_name} {child.last_name}
                                </p>
                            </div>
                        </div>

                        <div className="p-4 space-y-6">
                            {/* Subject Selector - Custom Dropdown */}
                            {child?.subjects && child.subjects.length > 0 && (
                                <div className="relative z-20">
                                    <label className="text-xs font-medium text-tg-hint uppercase mb-2 block">
                                        {t('parent.subject')}
                                    </label>
                                    <button
                                        onClick={() => setShowSubjectSelector(!showSubjectSelector)}
                                        className="w-full bg-tg-secondary/50 rounded-xl p-3 flex items-center justify-between hover:bg-tg-secondary/70 active:bg-tg-secondary/80 transition-colors border border-tg-hint/10"
                                    >
                                        <span className="text-tg-text font-medium">{selectedSubject}</span>
                                        <ChevronDown
                                            size={20}
                                            className={`text-tg-hint transition-transform ${showSubjectSelector ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    {/* Dropdown */}
                                    <AnimatePresence>
                                        {showSubjectSelector && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full left-0 right-0 mt-2 bg-tg-bg rounded-xl shadow-lg border border-tg-hint/10 overflow-hidden z-30"
                                            >
                                                {child.subjects.map((subject: any, idx: number) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => {
                                                            setSelectedSubject(subject.name);
                                                            setShowSubjectSelector(false);
                                                        }}
                                                        className={`w-full p-3 text-left transition-colors ${selectedSubject === subject.name
                                                            ? 'bg-tg-button/10 text-tg-button font-medium'
                                                            : 'hover:bg-tg-secondary/50 text-tg-text'
                                                            }`}
                                                    >
                                                        {subject.name}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-green-500/10 rounded-xl p-3 text-center">
                                    <p className="text-2xl font-bold text-green-500">{presentDays}</p>
                                    <p className="text-xs text-tg-hint">{t('status.present')}</p>
                                </div>
                                <div className="bg-red-500/10 rounded-xl p-3 text-center">
                                    <p className="text-2xl font-bold text-red-500">{absentDays}</p>
                                    <p className="text-xs text-tg-hint">{t('status.absent')}</p>
                                </div>
                                <div className="bg-yellow-500/10 rounded-xl p-3 text-center">
                                    <p className="text-2xl font-bold text-yellow-500">{lateDays}</p>
                                    <p className="text-xs text-tg-hint">{t('status.late')}</p>
                                </div>
                            </div>

                            {/* Calendar */}
                            <div>
                                {/* Month Navigation */}
                                <div className="flex items-center justify-between mb-4">
                                    <button
                                        onClick={prevMonth}
                                        className="p-2 hover:bg-tg-secondary/50 rounded-full transition-colors"
                                    >
                                        <ChevronLeft size={20} className="text-tg-hint" />
                                    </button>
                                    <h3 className="text-lg font-semibold text-tg-text">
                                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </h3>
                                    <button
                                        onClick={nextMonth}
                                        className="p-2 hover:bg-tg-secondary/50 rounded-full transition-colors"
                                    >
                                        <ChevronRight size={20} className="text-tg-hint" />
                                    </button>
                                </div>

                                {/* Calendar Grid */}
                                <div className="bg-tg-secondary/50 rounded-xl p-3">
                                    {/* Weekday Headers */}
                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                                            <div key={idx} className="text-center text-xs font-medium text-tg-hint py-1">
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Days Grid */}
                                    <div className="grid grid-cols-7 gap-1">
                                        {emptyDays.map((_, idx) => (
                                            <div key={`empty-${idx}`} className="aspect-square" />
                                        ))}
                                        {days.map((day) => {
                                            const status = getAttendanceStatus(day);
                                            return (
                                                <div
                                                    key={day}
                                                    className={`
                                                        aspect-square rounded-lg flex items-center justify-center text-sm font-medium
                                                        ${status ? `${getStatusColor(status)} text-white` : 'bg-tg-bg text-tg-text'}
                                                    `}
                                                >
                                                    {day}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ParentAttendanceModal;
