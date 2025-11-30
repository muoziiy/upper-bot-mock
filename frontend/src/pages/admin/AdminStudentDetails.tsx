import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import { Section } from '../../components/ui/Section';
import { ListItem } from '../../components/ui/ListItem';
import { User, Phone, BookOpen, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';
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
        };
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
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showGroupManagement, setShowGroupManagement] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<any>(null);

    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());

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
        <div className="page-content pt-4 pb-20">
            <h1 className="text-2xl font-bold mb-4 px-4 text-tg-text">Student Details</h1>

            {/* Profile Header */}
            <div className="flex flex-col items-center mb-6 pt-2">
                <div className="w-24 h-24 bg-tg-secondary rounded-full flex items-center justify-center mb-3 shadow-sm">
                    <User size={48} className="text-tg-hint" />
                </div>
                <h2 className="text-2xl font-bold text-tg-text text-center leading-tight">
                    {student.onboarding_first_name || student.first_name} {student.surname}
                </h2>
                <p className="text-tg-hint text-base">@{student.username || 'No username'}</p>
            </div>

            {/* Personal Info Section */}
            <Section title="Personal Info">
                <ListItem
                    title="Phone Number"
                    subtitle={student.phone_number || 'Not provided'}
                    icon={<Phone size={20} className="text-tg-button" />}
                    onClick={() => {
                        if (student.phone_number) {
                            window.open(`tel:${student.phone_number}`);
                        }
                    }}
                />
                <ListItem
                    title="Student ID"
                    value={`#${student.student_id_display || student.student_id || 'N/A'}`}
                    icon={<User size={20} className="text-tg-button" />}
                />
            </Section>

            {/* Finance Section */}
            <Section title="Finance">
                <ListItem
                    title="Payment History"
                    subtitle="View all transactions"
                    icon={<CreditCard size={20} className="text-green-500" />}
                    onClick={() => setShowPaymentModal(true)}
                    showChevron
                />
            </Section>

            {/* Groups Section */}
            <Section title="Groups" action={<button onClick={() => setShowGroupManagement(true)} className="text-tg-button text-sm font-medium">Manage</button>}>
                {student.groups && student.groups.length > 0 ? (
                    student.groups.map((group: any) => (
                        <div key={group.id} onClick={() => handleGroupClick(group)} className="active:scale-[0.99] transition-transform">
                            <ListItem
                                title={group.name}
                                subtitle={`${group.payment_status === 'paid' ? '✅ Paid' : '⚠️ Overdue'} • ${group.lessons_remaining !== undefined ? `${group.lessons_remaining} lessons left` : `Due: ${group.next_due_date ? new Date(group.next_due_date).toLocaleDateString() : 'N/A'}`}`}
                                icon={<BookOpen size={20} className="text-tg-button" />}
                                rightElement={
                                    <div className="text-xs text-tg-hint">
                                        {group.teacher?.onboarding_first_name || group.teacher?.first_name || 'No Teacher'}
                                    </div>
                                }
                                showChevron
                            />
                        </div>
                    ))
                ) : (
                    <div className="p-4 text-center text-tg-hint">No groups assigned</div>
                )}
            </Section>

            {/* Attendance Section */}
            <Section title="Attendance">
                <div className="p-4">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={prevMonth} className="p-2 hover:bg-tg-secondary rounded-full text-tg-text">
                            <ChevronLeft size={20} />
                        </button>
                        <h3 className="text-lg font-semibold text-tg-text">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button onClick={nextMonth} className="p-2 hover:bg-tg-secondary rounded-full text-tg-text">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className="text-xs font-medium text-tg-hint py-1">{day}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {blanks.map(i => <div key={`blank-${i}`} className="aspect-square" />)}
                        {days.map(day => {
                            const status = getAttendanceStatus(day);
                            let bgClass = "bg-tg-secondary text-tg-text";
                            if (status === 'present') bgClass = "bg-green-500/20 text-green-500 font-bold";
                            if (status === 'absent') bgClass = "bg-red-500/20 text-red-500 font-bold";
                            if (status === 'late') bgClass = "bg-orange-500/20 text-orange-500 font-bold";

                            return (
                                <div key={day} className={`aspect-square flex items-center justify-center rounded-lg text-sm ${bgClass}`}>
                                    {day}
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex justify-center gap-4 mt-4 text-xs text-tg-hint">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Present</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Absent</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Late</div>
                    </div>
                </div>
            </Section>

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
