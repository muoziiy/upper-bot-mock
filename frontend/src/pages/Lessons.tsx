import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppData } from '../context/AppDataContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdminSection } from './admin/components/AdminSection';
import { AdminListItem } from './admin/components/AdminListItem';

const Lessons: React.FC = () => {
    const { t } = useTranslation();
    const { teacherData, loading } = useAppData();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center bg-[#F2F2F7] dark:bg-[#000000] text-black dark:text-white">Loading...</div>;
    }

    // Filter lessons for the selected date
    const lessons = teacherData?.schedule?.filter(lesson =>
        new Date(lesson.date).toDateString() === selectedDate.toDateString()
    ) || [];

    const daysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const generateCalendarDays = () => {
        const days = [];
        const totalDays = daysInMonth(currentDate);
        const firstDay = firstDayOfMonth(currentDate);

        // Previous month padding
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`prev-${i}`} className="h-10 w-10" />);
        }

        // Current month days
        for (let i = 1; i <= totalDays; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === new Date().toDateString();

            // Check if there are lessons on this day
            const hasLessons = teacherData?.schedule?.some(lesson =>
                new Date(lesson.date).toDateString() === date.toDateString()
            );

            days.push(
                <motion.button
                    key={i}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedDate(date)}
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors relative
                        ${isSelected ? 'bg-blue-500 text-white' : 'text-black dark:text-white hover:bg-[#E5E5EA] dark:hover:bg-[#2C2C2E]'}
                        ${isToday && !isSelected ? 'text-blue-500 font-bold' : ''}
                    `}
                >
                    {i}
                    {/* Dot indicator for days with lessons */}
                    {hasLessons && (
                        <div className={`absolute bottom-1.5 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
                    )}
                </motion.button>
            );
        }

        return days;
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] pb-24 pt-4 text-black dark:text-white">
            <header className="mb-6 px-4 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{t('nav.lessons')}</h1>
                    <p className="text-[#8E8E93] text-lg">{selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
            </header>

            {/* Calendar Widget */}
            <div className="mx-4 bg-white dark:bg-[#1C1C1E] rounded-xl p-4 mb-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={prevMonth} className="p-2 hover:bg-[#F2F2F7] dark:hover:bg-[#2C2C2E] rounded-full text-blue-500 transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h2 className="font-semibold text-lg text-black dark:text-white">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <button onClick={nextMonth} className="p-2 hover:bg-[#F2F2F7] dark:hover:bg-[#2C2C2E] rounded-full text-blue-500 transition-colors">
                        <ChevronRight size={24} />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i} className="text-xs font-semibold text-[#8E8E93] h-8 flex items-center justify-center uppercase">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1 place-items-center">
                    {generateCalendarDays()}
                </div>
            </div>

            {/* Lessons List */}
            <AdminSection title="Schedule">
                {lessons.length > 0 ? (
                    lessons.map((lesson, index) => (
                        <AdminListItem
                            key={lesson.id}
                            title={lesson.title}
                            subtitle={`${lesson.time} • ${lesson.location}`}
                            icon="📚"
                            iconColor="bg-blue-500"
                            value={lesson.group}
                            isLast={index === lessons.length - 1}
                        />
                    ))
                ) : (
                    <div className="p-4 text-center text-[#8E8E93] bg-white dark:bg-[#1C1C1E]">
                        No lessons scheduled for this day.
                    </div>
                )}
            </AdminSection>
        </div>
    );
};

export default Lessons;
