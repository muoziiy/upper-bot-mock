import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import { Section } from '../../components/ui/Section';
import { Clock, Plus, Trash2 } from 'lucide-react';
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
        status?: 'active' | 'overdue' | 'unpaid'; // From backend calculation
    }[];
    payment_status?: 'paid' | 'unpaid' | 'overdue';
}

interface PaymentRecord {
    id: string;
    amount: number;
    payment_date: string;
    status: 'completed' | 'pending';
    subject_name?: string;
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
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State (Keep for Add/Edit actions if needed, or replace with inline)
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);

    useEffect(() => {
        if (webApp) {
            webApp.BackButton.show();
            const handleBack = () => navigate('/admin/students');
            webApp.BackButton.onClick(handleBack);
            return () => {
                webApp.BackButton.offClick(handleBack);
            };
        }
    }, [webApp, navigate]);

    useEffect(() => {
        fetchStudentDetails();
        fetchPayments();
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

    const handleUpdateJoinedDate = async (groupId: string, date: string) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/students/${id}/groups`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupId, action: 'update_date', joinedAt: date })
            });
            if (res.ok) {
                fetchStudentDetails();
            }
        } catch (e) {
            console.error('Failed to update date', e);
        }
    };

    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

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
                                <div key={group.id} className={cn("bg-tg-bg flex flex-col", idx !== student.groups.length - 1 && "border-b border-tg-hint/10")}>
                                    {/* Group Header (Clickable) */}
                                    <div
                                        className="p-4 flex justify-between items-start cursor-pointer active:bg-black/5 dark:active:bg-white/5 transition-colors"
                                        onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
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

                                    {/* Expanded Details */}
                                    {expandedGroup === group.id && (
                                        <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2 duration-200">
                                            <div className="bg-tg-secondary/50 rounded-lg p-3 space-y-3">
                                                {/* Actions Row */}
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowPaymentModal(true); // TODO: Pre-select this group in modal
                                                        }}
                                                        className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-medium shadow-sm active:scale-95 transition-transform"
                                                    >
                                                        Add Payment
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveGroup(group.id);
                                                        }}
                                                        className="bg-red-500/10 text-red-500 px-3 rounded-lg active:bg-red-500/20 transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>

                                                {/* Joined Date Edit */}
                                                <div className="flex items-center justify-between bg-tg-bg p-2 rounded-md border border-tg-hint/10">
                                                    <div className="flex items-center gap-2 text-tg-hint text-sm">
                                                        <Clock size={14} />
                                                        <span>Joined:</span>
                                                    </div>
                                                    <input
                                                        type="date"
                                                        value={group.joined_at ? new Date(group.joined_at).toISOString().split('T')[0] : ''}
                                                        onChange={(e) => handleUpdateJoinedDate(group.id, e.target.value)}
                                                        className="bg-transparent text-tg-text text-sm font-medium outline-none text-right"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-tg-hint">
                                No active groups
                            </div>
                        )}
                    </Section>
                </div>

                {/* Attendance Section */}
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-tg-hint uppercase ml-2">Recent Attendance</h3>
                    <Section>
                        {attendance.length > 0 ? (
                            attendance.slice(0, 5).map((record, idx) => (
                                <div key={record.id} className={cn("p-4 bg-tg-bg flex justify-between items-center", idx !== attendance.length - 1 && "border-b border-tg-hint/10")}>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-tg-text">{record.group_name || 'Class'}</span>
                                        <span className="text-xs text-tg-hint">{new Date(record.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {record.status === 'present' && <span className="text-green-500 text-sm font-medium">Present</span>}
                                        {record.status === 'absent' && <span className="text-red-500 text-sm font-medium">Absent</span>}
                                        {record.status === 'late' && <span className="text-orange-500 text-sm font-medium">Late</span>}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-tg-hint">
                                No attendance records
                            </div>
                        )}
                    </Section>
                </div>
            </div>

            {/* Modals */}
            <AdminPaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                studentId={student.id}
                studentName={`${student.first_name} ${student.surname}`}
                groups={student.groups}
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
