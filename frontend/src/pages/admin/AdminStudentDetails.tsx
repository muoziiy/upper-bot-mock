import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import { Section } from '../../components/ui/Section';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import AdminPaymentModal from './components/AdminPaymentModal';
import AdminGroupManagementModal from './components/AdminGroupManagementModal';

interface Student {
    id: string;
    student_id: string;
    first_name: string;
    onboarding_first_name?: string;
    surname: string;
    age: number;
    sex: 'male' | 'female' | null;
    groups: {
        id: string;
        name: string;
        price: number;
        teacher_name?: string;
        joined_at?: string;
        payment_status?: 'paid' | 'overdue' | 'unpaid';
        status?: 'active' | 'overdue' | 'unpaid';
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
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        if (webApp) {
            webApp.BackButton.show();
            const handleBack = () => {
                if (showPaymentModal || showGroupModal) {
                    setShowPaymentModal(false);
                    setShowGroupModal(false);
                } else {
                    navigate('/admin/students');
                }
            };
            webApp.BackButton.onClick(handleBack);
            return () => {
                webApp.BackButton.offClick(handleBack);
            };
        }
    }, [webApp, navigate, showPaymentModal, showGroupModal]);

    useEffect(() => {
        fetchStudentDetails();
        fetchAttendance();
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

    const handleGroupClick = (groupId: string) => {
        setSelectedGroupId(groupId);
        setShowPaymentModal(true);
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

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    if (loading) {
        return <div className="min-h-screen bg-tg-secondary flex items-center justify-center text-tg-hint">Loading...</div>;
    }

    if (!student) {
        return <div className="min-h-screen bg-tg-secondary flex items-center justify-center text-tg-hint">Student not found</div>;
    }

    return (
        <div className="min-h-screen bg-tg-secondary pb-20 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="bg-tg-bg sticky top-0 z-10 px-4 py-3 flex items-center justify-center border-b border-tg-hint/10">
                <h2 className="text-lg font-semibold text-tg-text">Student Details</h2>
            </div>

            <div className="pt-4 px-4 space-y-6">
                {/* Profile Header */}
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-tg-bg flex items-center justify-center text-4xl mb-3 shadow-sm border border-tg-hint/10">
                            {student.sex === 'female' ? '👩' : '👨'}
                        </div>
                        {student.payment_status === 'overdue' && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md border-2 border-tg-secondary">
                                Overdue
                            </div>
                        )}
                        {student.payment_status === 'paid' && (
                            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md border-2 border-tg-secondary">
                                Paid
                            </div>
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-tg-text text-center">
                        {student.onboarding_first_name || student.first_name}
                    </h1>
                    <p className="text-tg-hint font-medium mt-1">ID: {student.student_id}</p>
                </div>

                {/* Groups Section */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-sm font-medium text-tg-hint uppercase">Groups</h3>
                        <button
                            onClick={() => setShowGroupModal(true)}
                            className="text-tg-button text-sm font-medium flex items-center gap-1"
                        >
                            <Plus size={16} /> Add
                        </button>
                    </div>
                    <Section>
                        {student.groups.length > 0 ? (
                            student.groups.map((group, idx) => (
                                <div
                                    key={group.id}
                                    className={cn(
                                        "bg-tg-bg p-4 flex justify-between items-center cursor-pointer active:bg-black/5 dark:active:bg-white/5 transition-colors",
                                        idx !== student.groups.length - 1 && "border-b border-tg-hint/10"
                                    )}
                                    onClick={() => handleGroupClick(group.id)}
                                >
                                    <div>
                                        <span className="font-semibold text-tg-text block">{group.name}</span>
                                        <span className="text-sm text-tg-hint">{group.teacher_name || 'No Teacher'}</span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-sm font-medium text-tg-text">{group.price.toLocaleString()} UZS</span>
                                        {/* Status Badge */}
                                        {group.payment_status === 'overdue' ? (
                                            <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-xs font-bold rounded-full border border-red-500/20">
                                                Overdue
                                            </span>
                                        ) : group.payment_status === 'paid' ? (
                                            <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-xs font-bold rounded-full border border-green-500/20">
                                                Paid
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 bg-gray-500/10 text-gray-500 text-xs font-bold rounded-full border border-gray-500/20">
                                                Unpaid
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-tg-hint">
                                No active groups
                            </div>
                        )}
                    </Section>
                </div>

                {/* Attendance Calendar Section */}
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-tg-hint uppercase ml-2">Attendance</h3>
                    <div className="bg-tg-bg rounded-2xl p-4 shadow-sm border border-tg-hint/10">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-4">
                            <button onClick={prevMonth} className="p-1 hover:bg-tg-secondary rounded-full text-tg-hint">
                                <ChevronLeft size={20} />
                            </button>
                            <span className="font-semibold text-tg-text">
                                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </span>
                            <button onClick={nextMonth} className="p-1 hover:bg-tg-secondary rounded-full text-tg-hint">
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                <div key={day} className="text-xs font-medium text-tg-hint py-1">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {blanks.map(i => <div key={`blank-${i}`} />)}
                            {days.map(day => {
                                const status = getAttendanceStatus(day);
                                return (
                                    <div
                                        key={day}
                                        className={cn(
                                            "aspect-square flex items-center justify-center text-sm rounded-lg",
                                            status === 'present' && "bg-green-500/20 text-green-600 font-bold",
                                            status === 'absent' && "bg-red-500/20 text-red-600 font-bold",
                                            status === 'late' && "bg-orange-500/20 text-orange-600 font-bold",
                                            !status && "text-tg-text hover:bg-tg-secondary/50"
                                        )}
                                    >
                                        {day}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="flex gap-4 justify-center mt-4 text-xs text-tg-hint">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div> Present
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div> Absent
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-orange-500"></div> Late
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AdminPaymentModal
                isOpen={showPaymentModal}
                onClose={() => {
                    setShowPaymentModal(false);
                    setSelectedGroupId(null);
                }}
                studentId={student.id}
                studentName={`${student.first_name} ${student.surname}`}
                groups={student.groups}
                defaultGroupId={selectedGroupId}
            />
            <AdminGroupManagementModal
                isOpen={showGroupModal}
                onClose={() => setShowGroupModal(false)}
                studentId={student.id}
                studentName={`${student.first_name} ${student.surname}`}
                currentGroups={student.groups}
                onUpdate={fetchStudentDetails}
            />
        </div>
    );
};

export default AdminStudentDetails;
