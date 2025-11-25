import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, ChevronRight, MoreVertical } from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';

interface GroupDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    group: any; // Using any for now, should be typed properly
}

const GroupDetailsModal: React.FC<GroupDetailsModalProps> = ({ isOpen, onClose, group }) => {
    const { webApp } = useTelegram();
    // const { t } = useTranslation(); // Unused

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
                    className="fixed inset-0 z-[60] bg-tg-bg"
                >
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="h-full overflow-y-auto bg-tg-bg"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-tg-bg/95 backdrop-blur-xl border-b border-tg-hint/10 px-4 py-4 z-10 flex items-center justify-between">
                            <h1 className="text-xl font-bold text-tg-text">{group.name}</h1>
                            <button className="p-2 -mr-2 text-tg-hint">
                                <MoreVertical size={20} />
                            </button>
                        </div>

                        <div className="p-4 space-y-6">
                            {/* Group Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-tg-secondary p-4 rounded-xl">
                                    <div className="flex items-center gap-2 text-tg-hint mb-1">
                                        <Users size={16} />
                                        <span className="text-xs uppercase font-medium">Students</span>
                                    </div>
                                    <p className="text-2xl font-bold text-tg-text">{group.student_count}</p>
                                </div>
                                <div className="bg-tg-secondary p-4 rounded-xl">
                                    <div className="flex items-center gap-2 text-tg-hint mb-1">
                                        <Clock size={16} />
                                        <span className="text-xs uppercase font-medium">Next Class</span>
                                    </div>
                                    <p className="text-lg font-bold text-tg-text truncate">{group.next_class}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button className="flex-1 bg-tg-button text-tg-button-text py-3 rounded-xl font-medium text-sm">
                                    Message Group
                                </button>
                                <button className="flex-1 bg-tg-secondary text-tg-text py-3 rounded-xl font-medium text-sm">
                                    View Schedule
                                </button>
                            </div>

                            {/* Students List */}
                            <div>
                                <h3 className="text-sm font-medium text-tg-hint uppercase mb-3">Students</h3>
                                <div className="space-y-2">
                                    {students.map((student) => (
                                        <div key={student.id} className="bg-tg-secondary p-3 rounded-xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                    {student.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-tg-text">{student.name}</p>
                                                    <p className="text-xs text-tg-hint">Attendance: {student.attendance}</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={20} className="text-tg-hint" />
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
