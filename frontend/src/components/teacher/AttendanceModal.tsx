import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Check, X as XIcon } from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';
import { useTranslation } from 'react-i18next';

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

    const handleSave = () => {
        console.log('Save attendance:', { selectedGroupId, selectedDate, students });
        // TODO: Add API call to save attendance
        webApp.HapticFeedback.notificationOccurred('success');
        onClose();
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
                    className="fixed inset-0 z-50 bg-tg-bg"
                >
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        transition={{ type: 'spring', damping: 32, stiffness: 380 }}
                        className="h-full overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-tg-bg/95 backdrop-blur-xl border-b border-tg-hint/10 px-4 py-4 z-10">
                            <h1 className="text-xl font-bold text-tg-text">{t('teacher.mark_attendance')}</h1>
                        </div>

                        <div className="p-4 pb-28 space-y-4">
                            {/* Date Selector */}
                            <div>
                                <label className="block text-sm font-medium text-tg-hint mb-2">
                                    <Calendar size={16} className="inline mr-1" />
                                    {t('teacher.select_date')}
                                </label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full bg-tg-secondary text-tg-text px-4 py-3 rounded-xl border border-tg-hint/10 focus:border-tg-button focus:outline-none transition-colors"
                                />
                            </div>

                            {/* Group Selector */}
                            <div>
                                <label className="block text-sm font-medium text-tg-hint mb-2">
                                    <Users size={16} className="inline mr-1" />
                                    {t('teacher.select_group')}
                                </label>
                                <select
                                    value={selectedGroupId}
                                    onChange={(e) => setSelectedGroupId(e.target.value)}
                                    className="w-full bg-tg-secondary text-tg-text px-4 py-3 rounded-xl border border-tg-hint/10 focus:border-tg-button focus:outline-none transition-colors"
                                >
                                    <option value="">Select a group...</option>
                                    {groups.map((group) => (
                                        <option key={group.id} value={group.id}>
                                            {group.name} ({group.student_count} students)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Summary */}
                            {students.length > 0 && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
                                        <div className="text-2xl font-bold text-green-500">{presentCount}</div>
                                        <div className="text-xs text-tg-hint">{t('teacher.present')}</div>
                                    </div>
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                                        <div className="text-2xl font-bold text-red-500">{absentCount}</div>
                                        <div className="text-xs text-tg-hint">{t('teacher.absent')}</div>
                                    </div>
                                </div>
                            )}

                            {/* Student List */}
                            {students.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-tg-hint mb-3">Students</h3>
                                    {students.map((student) => (
                                        <motion.div
                                            key={student.id}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => toggleAttendance(student.id)}
                                            className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${student.isPresent
                                                ? 'bg-green-500/10 border-2 border-green-500/20'
                                                : 'bg-red-500/10 border-2 border-red-500/20'
                                                }`}
                                        >
                                            <span className="font-medium text-tg-text">{student.name}</span>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${student.isPresent ? 'bg-green-500' : 'bg-red-500'
                                                }`}>
                                                {student.isPresent ? (
                                                    <Check size={16} className="text-white" />
                                                ) : (
                                                    <XIcon size={16} className="text-white" />
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* No Group Selected */}
                            {!selectedGroupId && (
                                <div className="text-center py-12 text-tg-hint">
                                    Please select a group to mark attendance
                                </div>
                            )}

                            {/* Save Button - Fixed at bottom */}
                            {students.length > 0 && (
                                <div className="fixed bottom-4 left-4 right-4 flex gap-3 z-20">
                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.98 }}
                                        onClick={onClose}
                                        className="flex-1 bg-tg-secondary text-tg-text py-3 rounded-xl font-medium shadow-lg"
                                    >
                                        {t('teacher.cancel')}
                                    </motion.button>
                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSave}
                                        className="flex-1 bg-tg-button text-tg-button-text py-3 rounded-xl font-medium shadow-lg"
                                    >
                                        {t('teacher.save')}
                                    </motion.button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AttendanceModal;
