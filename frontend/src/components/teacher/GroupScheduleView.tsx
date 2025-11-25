import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, MapPin } from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';

interface ScheduleItem {
    id: string;
    title: string;
    time: string;
    location: string;
    date: Date;
}

interface GroupScheduleViewProps {
    group: any;
    onBack: () => void;
    schedule: ScheduleItem[];
}

const GroupScheduleView: React.FC<GroupScheduleViewProps> = ({ group, onBack, schedule }) => {
    const { webApp } = useTelegram();

    useEffect(() => {
        webApp.BackButton.show();
        webApp.BackButton.onClick(onBack);
        return () => {
            webApp.BackButton.offClick(onBack);
        };
    }, [webApp, onBack]);

    return (
        <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[70] bg-tg-bg flex flex-col"
        >
            {/* Header */}
            <div className="bg-tg-secondary/95 backdrop-blur-xl border-b border-tg-secondary/50 px-4 py-3 flex items-center gap-3 z-10">
                <button onClick={onBack} className="text-tg-button">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-tg-text">{group.name}</h1>
                    <p className="text-xs text-tg-hint">Schedule</p>
                </div>
            </div>

            {/* Schedule List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {schedule.length > 0 ? (
                    schedule.map((item) => (
                        <div
                            key={item.id}
                            className="bg-tg-secondary p-4 rounded-xl border-l-4 border-tg-button shadow-sm"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-tg-text">{item.title}</h4>
                                <span className="text-xs font-medium bg-tg-bg px-2 py-1 rounded text-tg-hint">
                                    {new Date(item.date).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2 text-sm text-tg-hint">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-tg-button" />
                                    <span>{item.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-tg-button" />
                                    <span>{item.location}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-tg-hint">
                        <p>No upcoming classes scheduled.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default GroupScheduleView;
