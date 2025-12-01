import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import { AdminSection } from './components/AdminSection';
import { AdminListItem } from './components/AdminListItem';
import { Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface Group {
    id: string;
    name: string;
}

interface Student {
    id: string;
    first_name: string;
    surname: string;
    attendance_status?: 'present' | 'absent' | 'late';
}

const AdminAttendance: React.FC = () => {
    const { webApp } = useTelegram();
    const navigate = useNavigate();
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Group Selector State
    const [isGroupSelectOpen, setIsGroupSelectOpen] = useState(false);

    useEffect(() => {
        webApp.BackButton.show();
        webApp.BackButton.onClick(() => navigate(-1));
        return () => {
            webApp.BackButton.offClick(() => navigate(-1));
            webApp.BackButton.hide();
        };
    }, [webApp, navigate]);

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        if (selectedGroup) {
            fetchStudents(selectedGroup.id);
        }
    }, [selectedGroup, date]);

    const fetchGroups = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/groups`);
            if (res.ok) {
                const data = await res.json();
                setGroups(data);
            }
        } catch (e) {
            console.error('Failed to fetch groups', e);
        }
    };

    const fetchStudents = async (groupId: string) => {
        setLoading(true);
        try {
            // Fetch students in group
            const resStudents = await fetch(`${import.meta.env.VITE_API_URL}/admin/groups/${groupId}`);
            if (!resStudents.ok) throw new Error('Failed to fetch students');
            const groupData = await resStudents.json();

            // Fetch existing attendance for date
            // Note: We might need a specific endpoint for this, but for now let's assume we start fresh or need to fetch it.
            // Since we don't have a bulk fetch attendance for a group on a date endpoint yet, 
            // we will just list students and default to 'present' or empty.
            // Ideally we should fetch attendance if it exists.

            // For MVP, let's just list students.
            const mappedStudents = groupData.students.map((s: any) => ({
                id: s.id,
                first_name: s.first_name,
                surname: s.surname,
                attendance_status: 'present' // Default to present
            }));
            setStudents(mappedStudents);

        } catch (e) {
            console.error('Failed to fetch students', e);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = (studentId: string) => {
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                const newStatus = s.attendance_status === 'present' ? 'absent' : s.attendance_status === 'absent' ? 'late' : 'present';
                return { ...s, attendance_status: newStatus };
            }
            return s;
        }));
    };

    const handleSave = async () => {
        if (!selectedGroup) return;
        setSaving(true);
        try {
            // We need to send attendance for each student
            // The backend expects POST /attendance with { student_id, group_id, date, status }
            // We can loop through students. Ideally backend supports bulk insert.

            const promises = students.map(s =>
                fetch(`${import.meta.env.VITE_API_URL}/attendance`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        student_id: s.id,
                        group_id: selectedGroup.id,
                        date: date,
                        status: s.attendance_status
                    })
                })
            );

            await Promise.all(promises);
            webApp.showPopup({
                title: 'Success',
                message: 'Attendance saved successfully',
                buttons: [{ type: 'ok' }]
            });
            navigate(-1);

        } catch (e) {
            webApp.showAlert('Failed to save attendance');
        } finally {
            setSaving(false);
        }
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'present': return 'text-green-500';
            case 'absent': return 'text-red-500';
            case 'late': return 'text-orange-500';
            default: return 'text-gray-400';
        }
    };

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case 'present': return '✅';
            case 'absent': return '❌';
            case 'late': return '⏰';
            default: return '❓';
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] pt-4 pb-20">
            <h1 className="text-3xl font-bold mb-6 px-4 text-black dark:text-white">Attendance</h1>

            {/* Group Selector */}
            <div className="px-4 mb-6">
                <button
                    onClick={() => setIsGroupSelectOpen(true)}
                    className="w-full bg-white dark:bg-[#1C1C1E] p-4 rounded-[10px] flex items-center justify-between shadow-sm"
                >
                    <span className={selectedGroup ? "text-black dark:text-white font-medium" : "text-[#8E8E93]"}>
                        {selectedGroup ? selectedGroup.name : "Select Group"}
                    </span>
                    <ChevronDown className="text-[#8E8E93]" />
                </button>
            </div>

            {/* Date Picker */}
            {selectedGroup && (
                <div className="px-4 mb-6">
                    <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-[10px] flex items-center justify-between shadow-sm">
                        <span className="text-black dark:text-white font-medium">Date</span>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-transparent text-right text-blue-500 outline-none"
                        />
                    </div>
                </div>
            )}

            {/* Student List */}
            {selectedGroup && (
                <AdminSection title={`Students (${students.length})`}>
                    {loading ? (
                        <div className="p-4 text-center text-[#8E8E93]">Loading students...</div>
                    ) : students.length > 0 ? (
                        students.map((student, index) => (
                            <AdminListItem
                                key={student.id}
                                title={`${student.first_name} ${student.surname}`}
                                icon={getStatusIcon(student.attendance_status)}
                                iconColor="bg-transparent" // Emoji icon doesn't need bg
                                onClick={() => toggleStatus(student.id)}
                                rightElement={
                                    <span className={cn("text-sm font-medium capitalize", getStatusColor(student.attendance_status))}>
                                        {student.attendance_status}
                                    </span>
                                }
                                isLast={index === students.length - 1}
                            />
                        ))
                    ) : (
                        <div className="p-4 text-center text-[#8E8E93]">No students in this group.</div>
                    )}
                </AdminSection>
            )}

            {/* Save Button */}
            {selectedGroup && students.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#F2F2F7] dark:bg-[#000000] border-t border-[#C6C6C8] dark:border-[#38383A]">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-3.5 rounded-xl bg-blue-500 text-white font-semibold active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70"
                    >
                        {saving ? 'Saving...' : 'Save Attendance'}
                    </button>
                </div>
            )}

            {/* Group Selection Modal */}
            <AnimatePresence>
                {isGroupSelectOpen && (
                    <>
                        <div className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-sm" onClick={() => setIsGroupSelectOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            className="fixed bottom-0 left-0 right-0 z-[80] bg-[#F2F2F7] dark:bg-[#1C1C1E] rounded-t-2xl max-h-[70vh] flex flex-col"
                        >
                            <div className="px-4 py-3 border-b border-[#C6C6C8] dark:border-[#38383A] flex justify-between items-center">
                                <span className="text-[17px] font-semibold text-black dark:text-white">Select Group</span>
                                <button onClick={() => setIsGroupSelectOpen(false)} className="text-blue-500 font-medium">Done</button>
                            </div>
                            <div className="overflow-y-auto p-4">
                                <AdminSection>
                                    {groups.map((g, index) => (
                                        <AdminListItem
                                            key={g.id}
                                            title={g.name}
                                            onClick={() => {
                                                setSelectedGroup(g);
                                                setIsGroupSelectOpen(false);
                                            }}
                                            rightElement={selectedGroup?.id === g.id ? <Check size={20} className="text-blue-500" /> : null}
                                            isLast={index === groups.length - 1}
                                        />
                                    ))}
                                </AdminSection>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminAttendance;
