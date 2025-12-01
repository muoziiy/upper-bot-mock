import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import { AdminSection } from './components/AdminSection';
import { AdminListItem } from './components/AdminListItem';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AdminPaymentModal from './components/AdminPaymentModal';
import AdminGroupManagementModal from './components/AdminGroupManagementModal';
import AdminGroupDetailsModal from './components/AdminGroupDetailsModal';

interface Student {
    id: string;
    student_id: string;
    student_id_display?: string;
    first_name: string;
    onboarding_first_name?: string;
    surname: string;
    age: number;
    sex: 'male' | 'female' | null;
    phone_number?: string;
    username?: string;
    groups: {
        id: string;
        name: string;
        price: number;
        teacher?: {
            first_name: string;
            onboarding_first_name?: string;
            surname: string;
        };
        schedule?: Record<string, string[]>;
        joined_at?: string;
        payment_status?: 'paid' | 'overdue' | 'unpaid';
        lessons_remaining?: number;
        next_due_date?: string;
    }[];
    payment_status?: 'paid' | 'unpaid' | 'overdue';
}

interface AttendanceRecord {
    id: string;
    date: string;
    status: 'present' | 'absent' | 'late';
    group_name?: string;
}

const AdminStudentDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { webApp } = useTelegram();
    const [student, setStudent] = useState<Student | null>(null);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showGroupManagement, setShowGroupManagement] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<any>(null);

    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    useEffect(() => {
        if (webApp) {
            webApp.BackButton.show();
            const handleBack = () => {
                if (showPaymentModal || showGroupModal || showGroupManagement) {
                    setShowPaymentModal(false);
                    setShowGroupModal(false);
                    setShowGroupManagement(false);
                } else {
                    navigate('/admin/students');
                }
            };
            webApp.BackButton.onClick(handleBack);
            return () => {
                webApp.BackButton.offClick(handleBack);
            };
        }
    }, [webApp, navigate, showPaymentModal, showGroupModal, showGroupManagement]);

    useEffect(() => {
        fetchStudentDetails();
        fetchAttendance();
        fetchPayments();
    }, [id]);

    const fetchStudentDetails = async () => {
        if (!id) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/students/${id}`);
            if (res.ok) {
                const data = await res.json();
                setStudent(data);
            }
        } catch (e) {
            console.error('Failed to fetch student details', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendance = async () => {
        if (!id) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/students/${id}/attendance`);
            if (res.ok) {
                const data = await res.json();
                setAttendance(data);
            }
        } catch (e) {
            console.error('Failed to fetch attendance', e);
        }
    };

    const fetchPayments = async () => {
        if (!id) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/students/${id}/payments`);
            if (res.ok) {
                const data = await res.json();
                setPayments(data);
            }
        } catch (e) {
            console.error('Failed to fetch payments', e);
        }
    };

    const handleGroupClick = (group: any) => {
        setSelectedGroup(group);
        setShowGroupModal(true);
    };

    // Calendar Logic
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
        return { daysInMonth, firstDayOfMonth };
    };

    const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    const getAttendanceStatus = (day: number) => {
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
        const record = attendance.find(a => a.date.startsWith(dateStr));
        return record ? record.status : null;
    };

    const hasLesson = (day: number) => {
        if (!student?.groups) return false;
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

        return student.groups.some(g =>
            g.schedule && g.schedule[dayName] && g.schedule[dayName].length > 0
        );
    };

    const getLessonDetails = (date: Date) => {
        if (!student?.groups) return [];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

        const lessons: { groupName: string, time: string }[] = [];
        student.groups.forEach(g => {
            if (g.schedule && g.schedule[dayName]) {
                g.schedule[dayName].forEach(time => {
                    lessons.push({ groupName: g.name, time });
                });
            }
        });
        return lessons;
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDate(null);
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDate(null);
    };

    const handleDayClick = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        if (selectedDate && selectedDate.getTime() === date.getTime()) {
            setSelectedDate(null);
        } else {
            setSelectedDate(date);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] flex items-center justify-center text-[#8E8E93]">Loading...</div>;
    }

    if (!student) {
        return <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] flex items-center justify-center text-[#8E8E93]">Student not found</div>;
    }

    return (
        <div className="page-content pt-4 pb-20 bg-[#F2F2F7] dark:bg-[#000000] min-h-screen">
            <h1 className="text-3xl font-bold mb-4 px-4 text-black dark:text-white">Student Details</h1>

            {/* Profile Header */}
            <div className="flex flex-col items-center mb-6 pt-2">
                <div className="w-24 h-24 bg-[#E3E3E8] dark:bg-[#1C1C1E] rounded-full flex items-center justify-center mb-3 shadow-sm text-4xl">
                    🎓
                </div>
                <h2 className="text-2xl font-bold text-black dark:text-white text-center leading-tight">
                    {student.onboarding_first_name || student.first_name} {student.surname}
                </h2>
                <p className="text-[#8E8E93] text-base">@{student.username || 'No username'}</p>
            </div>

            {/* Personal Info Section */}
            <AdminSection title="Personal Info">
                <AdminListItem
                    title="Phone Number"
                    value={student.phone_number || 'Not provided'}
                    icon="📞"
                    iconColor="bg-green-500"
                    onClick={() => {
                        if (student.phone_number) {
                            window.open(`tel:${student.phone_number}`);
                        }
                    }}
                />
                <AdminListItem
                    title="Student ID"
                    value={`#${student.student_id_display || student.student_id || 'N/A'}`}
                    icon="🆔"
                    iconColor="bg-blue-500"
                    isLast
                />
            </AdminSection>

            {/* Finance Section */}
            <AdminSection title="Finance">
                {payments.length > 0 ? (
                    payments.slice(0, 3).map((payment, index) => (
                        <AdminListItem
                            key={payment.id}
                            title={`${parseInt(payment.amount).toLocaleString()} UZS`}
                            subtitle={`${new Date(payment.date).toLocaleDateString()} • ${payment.target}`}
                            icon="💰"
                            iconColor="bg-green-500"
                            isLast={index === Math.min(payments.length, 3) - 1 && payments.length <= 3}
                        />
                    ))
                ) : (
                    <div className="p-4 text-center text-[#8E8E93] bg-white dark:bg-[#1C1C1E]">No payments found</div>
                )}
                <AdminListItem
                    title="View All History"
                    icon="💳"
                    iconColor="bg-blue-500"
                    onClick={() => setShowPaymentModal(true)}
                    showChevron
                    isLast
                />
            </AdminSection>

            {/* Groups Section */}
            <AdminSection title="Groups" footer="Tap a group to view details">
                {student.groups && student.groups.length > 0 ? (
                    student.groups.map((group: any, index: number) => (
                        <AdminListItem
                            key={group.id}
                            title={group.name}
                            // subtitle removed
                            value={
                                <div className="flex flex-col items-end">
                                    <span className={group.payment_status === 'paid' ? 'text-green-500' : 'text-red-500'}>
                                        {group.payment_status === 'paid' ? 'Paid' : 'Overdue'}
                                    </span>
                                    <span className="text-xs text-[#8E8E93]">
                                        {group.teacher?.onboarding_first_name || group.teacher?.first_name || 'No Teacher'}
                                    </span>
                                </div>
                            }
                            icon="📚"
                            iconColor="bg-orange-500"
                            onClick={() => handleGroupClick(group)}
                            showChevron
                            isLast={index === student.groups.length - 1}
                        />
                    ))
                ) : (
                    <div className="p-4 text-center text-[#8E8E93] bg-white dark:bg-[#1C1C1E]">No groups assigned</div>
                )}
                <div className="p-2 bg-transparent">
                    <button
                        onClick={() => setShowGroupManagement(true)}
                        className="w-full py-2 text-blue-500 font-medium text-sm"
                    >
                        Manage Groups
                    </button>
                </div>
            </AdminSection>

            {/* Attendance Section */}
            <AdminSection title="Attendance">
                <div className="p-4 bg-white dark:bg-[#1C1C1E]">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={prevMonth} className="p-2 hover:bg-[#E3E3E8] dark:hover:bg-[#2C2C2E] rounded-full text-black dark:text-white">
                            <ChevronLeft size={20} />
                        </button>
                        <h3 className="text-lg font-semibold text-black dark:text-white">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button onClick={nextMonth} className="p-2 hover:bg-[#E3E3E8] dark:hover:bg-[#2C2C2E] rounded-full text-black dark:text-white">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className="text-xs font-medium text-[#8E8E93] py-1">{day}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {blanks.map(i => <div key={`blank-${i}`} className="aspect-square" />)}
                        {days.map(day => {
                            const status = getAttendanceStatus(day);
                            const isLessonDay = hasLesson(day);
                            const isSelected = selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth();

                            let bgClass = "bg-transparent text-black dark:text-white";

                            if (status === 'present') bgClass = "bg-green-500/20 text-green-500 font-bold";
                            else if (status === 'absent') bgClass = "bg-red-500/20 text-red-500 font-bold";
                            else if (status === 'late') bgClass = "bg-orange-500/20 text-orange-500 font-bold";
                            else if (isLessonDay) bgClass = "bg-blue-500/10 text-blue-500 font-medium"; // Light theme color for lessons

                            if (isSelected) {
                                bgClass += " ring-2 ring-blue-500";
                            }

                            return (
                                <button
                                    key={day}
                                    onClick={() => handleDayClick(day)}
                                    className={`aspect-square flex items-center justify-center rounded-lg text-sm transition-all ${bgClass}`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex justify-center gap-4 mt-4 text-xs text-[#8E8E93]">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Present</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Absent</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500/50"></div> Lesson</div>
                    </div>
                </div>

                {/* Selected Day Lesson Details */}
                {selectedDate && (
                    <div className="border-t border-[#C6C6C8] dark:border-[#38383A] bg-white dark:bg-[#1C1C1E] p-4 animate-in slide-in-from-top-2 duration-200">
                        <h4 className="text-sm font-semibold text-black dark:text-white mb-2">
                            {selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h4>
                        {getLessonDetails(selectedDate).length > 0 ? (
                            <div className="space-y-2">
                                {getLessonDetails(selectedDate).map((lesson, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                        <span className="text-black dark:text-white">{lesson.groupName}</span>
                                        <span className="text-[#8E8E93]">{lesson.time}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-[#8E8E93]">No lessons scheduled for this day.</p>
                        )}
                    </div>
                )}
            </AdminSection>

            {/* Attendance Explanation */}
            <div className="px-4 mt-2 mb-6">
                <p className="text-xs text-[#8E8E93] leading-relaxed text-center">
                    Based on education centre settings
                </p>
            </div>

            {/* Modals */}
            <AdminGroupManagementModal
                isOpen={showGroupManagement}
                onClose={() => setShowGroupManagement(false)}
                studentId={id!}
                studentName={student.first_name}
                currentGroups={student.groups || []}
                onUpdate={fetchStudentDetails}
            />

            <AdminGroupDetailsModal
                isOpen={showGroupModal}
                onClose={() => setShowGroupModal(false)}
                studentId={id!}
                studentName={student.first_name}
                group={selectedGroup}
                onUpdate={fetchStudentDetails}
            />

            <AdminPaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                studentId={id!}
                studentName={student.first_name}
                groups={student.groups || []}
            />
        </div>
    );
};

export default AdminStudentDetails;
