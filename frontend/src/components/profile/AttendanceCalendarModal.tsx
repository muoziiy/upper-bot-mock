import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';
import { useTranslation } from 'react-i18next';

interface AttendanceRecord {
    date: string; // YYYY-MM-DD
    status: 'present' | 'absent' | 'late';
}

interface AttendanceCalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    subjectName: string;
    attendance: AttendanceRecord[];
}

const AttendanceCalendarModal: React.FC<AttendanceCalendarModalProps> = ({
    isOpen,
    onClose,
    subjectName,
    attendance
}) => {
    const { webApp } = useTelegram();
    const { t } = useTranslation();
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        if (isOpen) {
            webApp.BackButton.show();
            webApp.BackButton.onClick(onClose);
        } else {
            webApp.BackButton.hide();
        }

        return () => {
            webApp.BackButton.offClick(onClose);
        };
    }, [isOpen, onClose, webApp]);

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const changeMonth = (increment: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];

        // Empty cells for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10" />);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const record = attendance.find(a => a.date === dateStr);

            let bgClass = '';

            if (record) {
                if (record.status === 'present') {
                    bgClass = 'bg-green-500/20 text-green-500';
                } else if (record.status === 'absent') {
                    bgClass = 'bg-red-500/20 text-red-500';
                } else if (record.status === 'late') {
                    bgClass = 'bg-yellow-500/20 text-yellow-500';
                }
            }

            days.push(
                <div key={day} className="flex items-center justify-center h-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${bgClass} ${!record ? 'text-tg-text' : ''}`}>
                        {day}
                    </div>
                </div>
            );
        }

        return days;
    };

    const monthNames = [
        t('months.january'), t('months.february'), t('months.march'), t('months.april'),
        t('months.may'), t('months.june'), t('months.july'), t('months.august'),
        t('months.september'), t('months.october'), t('months.november'), t('months.december')
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-tg-bg"
                >
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        transition={{ type: 'spring', damping: 32, stiffness: 380 }}
                        className="h-full flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-tg-bg/95 backdrop-blur-xl border-b border-tg-hint/10 px-4 py-4 z-10 flex items-center justify-between">
                            <h1 className="text-xl font-bold text-tg-text">{t('profile.attendance')}</h1>
                            <div className="text-sm text-tg-hint">{subjectName}</div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {/* Calendar Controls */}
                            <div className="flex items-center justify-between mb-6 bg-tg-secondary p-2 rounded-xl">
                                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-tg-bg rounded-lg transition-colors text-tg-text">
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="font-semibold text-tg-text">
                                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                </span>
                                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-tg-bg rounded-lg transition-colors text-tg-text">
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            {/* Calendar Grid */}
                            <div className="bg-tg-secondary rounded-xl p-4">
                                {/* Weekdays */}
                                <div className="grid grid-cols-7 mb-2 text-center">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                        <div key={d} className="text-xs font-medium text-tg-hint uppercase py-2">
                                            {d}
                                        </div>
                                    ))}
                                </div>
                                {/* Days */}
                                <div className="grid grid-cols-7 gap-y-1">
                                    {renderCalendar()}
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="mt-6 grid grid-cols-3 gap-4">
                                <div className="flex items-center gap-2 justify-center">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="text-xs text-tg-hint">{t('status.present')}</span>
                                </div>
                                <div className="flex items-center gap-2 justify-center">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <span className="text-xs text-tg-hint">{t('status.absent')}</span>
                                </div>
                                <div className="flex items-center gap-2 justify-center">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <span className="text-xs text-tg-hint">{t('status.late')}</span>
                                </div>
                            </div>

                            {/* Explanation */}
                            <div className="mt-6 px-2">
                                <p className="text-xs text-tg-hint leading-relaxed text-center">
                                    <span className="font-semibold">How it works:</span>
                                    <br />
                                    Lesson Based: 1 credit deducted per Present/Late.
                                    <br />
                                    Monthly: Status based on payment date coverage.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AttendanceCalendarModal;
