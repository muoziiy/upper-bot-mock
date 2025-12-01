import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegram } from '../../context/TelegramContext';
import { useTranslation } from 'react-i18next';
import Lottie from 'lottie-react';
import duckSuccess from '../../assets/animations/duck_success.json';
import { AdminSection } from '../../pages/admin/components/AdminSection';
import { AdminListItem } from '../../pages/admin/components/AdminListItem';
import { mockService } from '../../services/mockData';

interface AttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    groups: { id: string; name: string; student_count: number }[];
}

interface Student {
    id: string;
    name: string;
    isPresent: boolean;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ isOpen, onClose, groups }) => {
    const { webApp } = useTelegram();
    const { t } = useTranslation();
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState<Student[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);

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

    useEffect(() => {
        // Mock student data when group is selected
        if (selectedGroupId) {
            const selectedGroup = groups.find(g => g.id === selectedGroupId);
            const mockStudents: Student[] = Array.from({ length: selectedGroup?.student_count || 0 }, (_, i) => ({
                id: `student-${i + 1}`,
                name: `Student ${i + 1}`,
                isPresent: true
            }));
            setStudents(mockStudents);
        } else {
            setStudents([]);
        }
    }, [selectedGroupId, groups]);

    const toggleAttendance = (studentId: string) => {
        setStudents(students.map(s =>
            s.id === studentId ? { ...s, isPresent: !s.isPresent } : s
        ));
        webApp.HapticFeedback.impactOccurred('light');
    };

    const handleSave = async () => {
        console.log('Save attendance:', { selectedGroupId, selectedDate, students });

        const response = await mockService.saveAttendance({
            groupId: selectedGroupId,
            date: selectedDate,
            students: students
        });

        if (response.success) {
            webApp.HapticFeedback.notificationOccurred('success');
            setShowSuccess(true);

            // Close after animation
            setTimeout(() => {
                setShowSuccess(false);
                onClose();
                setSelectedGroupId('');
                setStudents([]);
            }, 2000);
        } else {
            webApp.HapticFeedback.notificationOccurred('error');
            alert('Failed to save attendance');
        }
    };

    const presentCount = students.filter(s => s.isPresent).length;
    const absentCount = students.length - presentCount;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] bg-[#F2F2F7] dark:bg-[#000000]"
                >
                    {showSuccess ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="w-48 h-48">
                                <Lottie animationData={duckSuccess} loop={false} />
                            </div>
                            <h2 className="text-xl font-bold mt-4 text-black dark:text-white">{t('teacher.attendance_marked')}</h2>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            transition={{ type: 'spring', damping: 32, stiffness: 380 }}
                            className="h-full overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-[#F2F2F7]/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl border-b border-[#C6C6C8] dark:border-[#38383A] px-4 py-3 flex items-center justify-between z-10">
                                <button onClick={onClose} className="text-blue-500 text-[17px]">
                                    Cancel
                                </button>
                                <h1 className="text-[17px] font-semibold text-black dark:text-white">{t('teacher.mark_attendance')}</h1>
                                <button
                                    onClick={handleSave}
                                    disabled={students.length === 0}
                                    className={`text-[17px] font-semibold ${students.length > 0 ? 'text-blue-500' : 'text-gray-400'}`}
                                >
                                    Save
                                </button>
                            </div>

                            <div className="pt-6 pb-28">
                                {/* Date Selector */}
                                <AdminSection title={t('teacher.select_date')}>
                                    <div className="px-4 py-3 bg-white dark:bg-[#1C1C1E]">
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className="w-full bg-transparent text-[17px] text-black dark:text-white focus:outline-none"
                                        />
                                    </div>
                                </AdminSection>

                                {/* Group Selector */}
                                <AdminSection title={t('teacher.select_group')}>
                                    <div className="px-4 py-3 bg-white dark:bg-[#1C1C1E]">
                                        <select
                                            value={selectedGroupId}
                                            onChange={(e) => setSelectedGroupId(e.target.value)}
                                            className="w-full bg-transparent text-[17px] text-black dark:text-white focus:outline-none"
                                        >
                                            <option value="">Select a group...</option>
                                            {groups.map((group) => (
                                                <option key={group.id} value={group.id}>
                                                    {group.name} ({group.student_count} students)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </AdminSection>

                                {/* Summary */}
                                {students.length > 0 && (
                                    <AdminSection>
                                        <div className="flex items-center justify-between px-2 py-1">
                                            <div className="flex flex-col items-center gap-1 flex-1">
                                                <span className="text-2xl font-bold text-green-500">{presentCount}</span>
                                                <span className="text-[10px] text-[#8E8E93] uppercase font-medium">{t('teacher.present')}</span>
                                            </div>
                                            <div className="w-[0.5px] h-10 bg-[#C6C6C8] dark:bg-[#38383A]" />
                                            <div className="flex flex-col items-center gap-1 flex-1">
                                                <span className="text-2xl font-bold text-red-500">{absentCount}</span>
                                                <span className="text-[10px] text-[#8E8E93] uppercase font-medium">{t('teacher.absent')}</span>
                                            </div>
                                        </div>
                                    </AdminSection>
                                )}

                                {/* Student List */}
                                {students.length > 0 && (
                                    <AdminSection title="Students">
                                        {students.map((student, index) => (
                                            <AdminListItem
                                                key={student.id}
                                                title={student.name}
                                                icon={student.isPresent ? '✅' : '❌'}
                                                iconColor={student.isPresent ? 'bg-green-500' : 'bg-red-500'}
                                                onClick={() => toggleAttendance(student.id)}
                                                isLast={index === students.length - 1}
                                            />
                                        ))}
                                    </AdminSection>
                                )}

                                {/* No Group Selected */}
                                {!selectedGroupId && (
                                    <div className="text-center py-12 text-[#8E8E93]">
                                        Please select a group to mark attendance
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AttendanceModal;
