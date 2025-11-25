import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, MapPin, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Lessons: React.FC = () => {
    const { t } = useTranslation();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Mock data for lessons
    const lessons = [
        {
            id: 1,
            title: 'Mathematics - Algebra',
            group: 'Group A',
            time: '09:00 - 10:30',
            location: 'Room 101',
            date: new Date() // Today
        },
        {
            id: 2,
            title: 'Physics - Mechanics',
            group: 'Group B',
            time: '11:00 - 12:30',
            location: 'Lab 2',
            date: new Date() // Today
        }
    ];

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

            days.push(
                <motion.button
                    key={i}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedDate(date)}
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors relative
                        ${isSelected ? 'bg-tg-button text-tg-button-text' : 'text-tg-text hover:bg-tg-secondary'}
                        ${isToday && !isSelected ? 'border border-tg-button text-tg-button' : ''}
                    `}
                >
                    {i}
                    {/* Dot indicator for days with lessons (mock logic) */}
                    {i % 3 === 0 && (
                        <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-tg-button'}`} />
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
        <div className="min-h-screen bg-tg-bg pb-24 pt-4 text-tg-text px-4">
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{t('nav.lessons')}</h1>
                    <p className="text-tg-hint">{selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
            </header>

            {/* Calendar Widget */}
            <div className="bg-tg-secondary rounded-2xl p-4 mb-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={prevMonth} className="p-2 hover:bg-tg-bg rounded-full text-tg-hint hover:text-tg-text transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="font-semibold text-lg">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <button onClick={nextMonth} className="p-2 hover:bg-tg-bg rounded-full text-tg-hint hover:text-tg-text transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i} className="text-xs font-medium text-tg-hint h-8 flex items-center justify-center">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1 place-items-center">
                    {generateCalendarDays()}
                </div>
            </div>

            {/* Lessons List */}
            <div>
                <h3 className="text-sm font-medium text-tg-hint uppercase mb-3 px-1">
                    Schedule
                </h3>

                <div className="space-y-3">
                    {lessons.map((lesson) => (
                        <motion.div
                            key={lesson.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-tg-secondary p-4 rounded-xl border-l-4 border-tg-button shadow-sm"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-tg-text">{lesson.title}</h4>
                                <span className="text-xs font-medium bg-tg-bg px-2 py-1 rounded text-tg-hint">
                                    {lesson.group}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2 text-sm text-tg-hint">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-tg-button" />
                                    <span>{lesson.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-tg-button" />
                                    <span>{lesson.location}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Empty State */}
                    {lessons.length === 0 && (
                        <div className="text-center py-10 text-tg-hint">
                            <p>No lessons scheduled for this day.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Lessons;
