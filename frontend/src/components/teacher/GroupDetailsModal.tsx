import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, ChevronRight, MoreVertical, MessageCircle, Calendar } from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';

interface GroupDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    group: any; // Using any for now, should be typed properly
}

const GroupDetailsModal: React.FC<GroupDetailsModalProps> = ({ isOpen, onClose, group }) => {
    const { webApp } = useTelegram();

    useEffect(() => {
        if (isOpen) {
            webApp.BackButton.show();
            webApp.BackButton.onClick(onClose);
        } else {
            webApp.BackButton.hide();
            webApp.BackButton.offClick(onClose);
        }

        return () => {
            webApp.BackButton.offClick(onClose);
        };
    }, [isOpen, onClose, webApp]);

    if (!group) return null;

    // Mock students data
    const students = Array.from({ length: group.student_count || 10 }, (_, i) => ({
        id: i + 1,
        name: `Student ${i + 1}`,
        attendance: '95%',
        performance: 'A'
    }));

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] bg-tg-secondary"
                >
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="h-full overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-tg-bg/95 backdrop-blur-xl border-b border-tg-secondary/50 px-4 py-3 flex items-center justify-between z-10">
                            <div className="w-10" /> {/* Spacer */}
                            <h1 className="text-lg font-bold text-tg-text">{group.name}</h1>
                            <button className="w-10 flex justify-end text-tg-button">
                                <MoreVertical size={24} />
                            </button>
                        </div>

                        <div className="p-4 space-y-6 pb-24">
                            {/* Group Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-tg-bg p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2">
                                        <Users size={20} />
                                    </div>
                                    <p className="text-2xl font-bold text-tg-text">{group.student_count}</p>
                                    <p className="text-xs text-tg-hint uppercase font-medium">Students</p>
                                </div>
                                <div className="bg-tg-bg p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 mb-2">
                                        <Clock size={20} />
                                    </div>
                                    <p className="text-lg font-bold text-tg-text truncate w-full">{group.next_class || 'No class'}</p>
                                    <p className="text-xs text-tg-hint uppercase font-medium">Next Class</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="bg-tg-bg rounded-xl overflow-hidden">
                                <button className="w-full flex items-center gap-3 px-4 py-3 border-b border-tg-secondary/50 active:bg-tg-secondary/50 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                        <MessageCircle size={18} />
                                    </div>
                                    <span className="flex-1 text-left font-medium text-tg-text">Message Group</span>
                                    <ChevronRight size={20} className="text-tg-hint/50" />
                                </button>
                                <button className="w-full flex items-center gap-3 px-4 py-3 active:bg-tg-secondary/50 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                                        <Calendar size={18} />
                                    </div>
                                    <span className="flex-1 text-left font-medium text-tg-text">View Schedule</span>
                                    <ChevronRight size={20} className="text-tg-hint/50" />
                                </button>
                            </div>

                            {/* Students List */}
                            <div className="space-y-2">
                                <h3 className="text-xs font-medium text-tg-hint uppercase px-4">Students</h3>
                                <div className="bg-tg-bg rounded-xl overflow-hidden">
                                    {students.map((student, index) => (
                                        <div
                                            key={student.id}
                                            className={`flex items-center justify-between p-3 ${index !== students.length - 1 ? 'border-b border-tg-secondary/50' : ''
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-tg-button to-tg-button/70 flex items-center justify-center text-tg-button-text font-bold text-sm">
                                                    {student.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-tg-text text-sm">{student.name}</p>
                                                    <p className="text-xs text-tg-hint">Attendance: {student.attendance}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 text-xs font-bold">
                                                    {student.performance}
                                                </span>
                                                <ChevronRight size={20} className="text-tg-hint/30" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GroupDetailsModal;
