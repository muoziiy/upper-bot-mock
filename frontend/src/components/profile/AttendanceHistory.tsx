import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AttendanceRecord {
    id: string;
    date: string;
    status: 'present' | 'absent' | 'late';
    subject: string;
}

interface AttendanceHistoryProps {
    attendance: AttendanceRecord[];
}

const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ attendance }) => {
    // Internal subject state removed in favor of parent filtering
    // const [selectedSubject, setSelectedSubject] = useState<string>('All');
    const [currentDate, setCurrentDate] = useState(new Date());

    // const subjects = useMemo(() => {
    //     const uniqueSubjects = Array.from(new Set(attendance.map(r => r.subject)));
    //     return ['All', ...uniqueSubjects];
    // }, [attendance]);

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay(); // 0 = Sunday
    };

    const changeMonth = (delta: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        // Adjust for Monday start (Telegram usually prefers Monday start in EU/CIS)
        // 0 (Sun) -> 6, 1 (Mon) -> 0, ...
        const startDay = firstDay === 0 ? 6 : firstDay - 1;

        const days = [];
        // Empty slots for previous month
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
        }

        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            // Find attendance for this day
            const records = attendance.filter(r => r.date === dateStr);

            let statusColor = 'bg-tg-bg';
            let textColor = 'text-tg-text';

            if (records.length > 0) {
                // Priority: Absent > Late > Present
                if (records.some(r => r.status === 'absent')) {
                    statusColor = 'bg-red-500/20';
                    textColor = 'text-red-500';
                } else if (records.some(r => r.status === 'late')) {
                    statusColor = 'bg-yellow-500/20';
                    textColor = 'text-yellow-500';
                } else {
                    statusColor = 'bg-green-500/20';
                    textColor = 'text-green-500';
                }
            }

            days.push(
                <div
                    key={day}
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${statusColor} ${textColor}`}
                >
                    {day}
                </div>
            );
        }

        return days;
    };

    return (
        <div className="space-y-4">
            {/* Subject Filter Removed - Controlled by Parent */}

            {/* Calendar Header */}
            <Card className="p-4">
                <div className="mb-4 flex items-center justify-between">
                    <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-tg-bg rounded-full">
                        <ChevronLeft className="h-5 w-5 text-tg-hint" />
                    </button>
                    <span className="font-bold">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={() => changeMonth(1)} className="p-1 hover:bg-tg-bg rounded-full">
                        <ChevronRight className="h-5 w-5 text-tg-hint" />
                    </button>
                </div>

                {/* Week Days Header */}
                <div className="mb-2 grid grid-cols-7 gap-1 text-center">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                        <span key={d} className="text-xs text-tg-hint">{d}</span>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 place-items-center">
                    {renderCalendar()}
                </div>

                {/* Legend */}
                <div className="mt-4 flex justify-center gap-4 text-xs text-tg-hint">
                    <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span>Present</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <span>Absent</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                        <span>Late</span>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AttendanceHistory;
