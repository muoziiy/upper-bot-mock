import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegram } from '../../context/TelegramContext';
import { useAppData } from '../../context/AppDataContext';
import { mockService } from '../../services/mockData';
import GroupChatView from './GroupChatView';
import GroupScheduleView from './GroupScheduleView';
import { AdminSection } from '../../pages/admin/components/AdminSection';
import { AdminListItem } from '../../pages/admin/components/AdminListItem';

interface GroupDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    group: any; // Using any for now, should be typed properly
}

const GroupDetailsModal: React.FC<GroupDetailsModalProps> = ({ isOpen, onClose, group }) => {
    const { webApp } = useTelegram();

    const [activeView, setActiveView] = useState<'details' | 'chat' | 'schedule'>('details');
    const { teacherData } = useAppData();

    useEffect(() => {
        if (isOpen && activeView === 'details') {
            webApp.BackButton.show();
            webApp.BackButton.onClick(onClose);
        } else if (!isOpen) {
            webApp.BackButton.hide();
            webApp.BackButton.offClick(onClose);
        }

        return () => {
            webApp.BackButton.offClick(onClose);
        };
    }, [isOpen, activeView, onClose, webApp]);

    if (!group) return null;

    const [students, setStudents] = useState<any[]>([]);

    useEffect(() => {
        const fetchStudents = async () => {
            if (group?.id) {
                const data = await mockService.getGroupStudents(group.id);
                setStudents(data);
            }
        };
        fetchStudents();
    }, [group]);

    // Get messages for this group
    const groupMessages = teacherData?.messages?.find(m => m.group_id === group.id)?.messages || [];

    // Get schedule for this group
    const groupSchedule = teacherData?.schedule?.filter(s => s.group === group.name) || [];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-[#F2F2F7] dark:bg-[#000000]"
                    >
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="h-full overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-[#F2F2F7]/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl border-b border-[#C6C6C8] dark:border-[#38383A] px-4 py-3 flex items-center justify-between z-10">
                                <button onClick={onClose} className="text-blue-500 text-[17px]">
                                    Back
                                </button>
                                <h1 className="text-[17px] font-semibold text-black dark:text-white">{group.name}</h1>
                                <button className="text-blue-500 text-[17px]">
                                    Edit
                                </button>
                            </div>

                            <div className="pt-6 pb-24">
                                {/* Group Stats */}
                                <AdminSection>
                                    <div className="flex items-center justify-between px-2 py-1">
                                        <div className="flex flex-col items-center gap-1 flex-1">
                                            <span className="text-2xl font-bold text-blue-500">{group.student_count}</span>
                                            <span className="text-[10px] text-[#8E8E93] uppercase font-medium">Students</span>
                                        </div>
                                        <div className="w-[0.5px] h-10 bg-[#C6C6C8] dark:bg-[#38383A]" />
                                        <div className="flex flex-col items-center gap-1 flex-1">
                                            <span className="text-lg font-bold text-purple-500 truncate max-w-[120px]">{group.next_class || 'No class'}</span>
                                            <span className="text-[10px] text-[#8E8E93] uppercase font-medium">Next Class</span>
                                        </div>
                                    </div>
                                </AdminSection>

                                {/* Actions */}
                                <AdminSection>
                                    <AdminListItem
                                        title="Message Group"
                                        icon="💬"
                                        iconColor="bg-green-500"
                                        onClick={() => setActiveView('chat')}
                                    />
                                    <AdminListItem
                                        title="View Schedule"
                                        icon="📅"
                                        iconColor="bg-orange-500"
                                        onClick={() => setActiveView('schedule')}
                                        isLast
                                    />
                                </AdminSection>

                                {/* Students List */}
                                <AdminSection title="Students">
                                    {students.map((student, index) => (
                                        <AdminListItem
                                            key={student.id}
                                            title={student.name}
                                            subtitle={`Attendance: ${student.attendance}`}
                                            icon={student.name[0]}
                                            iconColor="bg-blue-500"
                                            value={student.performance}
                                            isLast={index === students.length - 1}
                                        />
                                    ))}
                                </AdminSection>
                            </div>
                        </motion.div>
                    </motion.div>

                    <AnimatePresence>
                        {activeView === 'chat' && (
                            <GroupChatView
                                key="chat"
                                group={group}
                                onBack={() => setActiveView('details')}
                                messages={groupMessages}
                            />
                        )}

                        {activeView === 'schedule' && (
                            <GroupScheduleView
                                key="schedule"
                                group={group}
                                onBack={() => setActiveView('details')}
                                schedule={groupSchedule}
                            />
                        )}
                    </AnimatePresence>
                </>
            )}
        </AnimatePresence>
    );
};

export default GroupDetailsModal;
