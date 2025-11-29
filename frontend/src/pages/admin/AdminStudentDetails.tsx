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

    const handleRemoveGroup = async (groupId: string) => {
        if (!confirm('Are you sure you want to remove this student from the group?')) return;
        // Implement remove logic here
        console.log('Remove group', groupId);
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
                                <div key={group.id} className={cn("p-4 bg-tg-bg flex flex-col gap-2", idx !== student.groups.length - 1 && "border-b border-tg-hint/10")}>
                                    <div className="flex justify-between items-start">
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

                                    <div className="flex justify-between items-center mt-1">
                                        {group.joined_at && (
                                            <div className="flex items-center gap-1.5 text-xs text-tg-hint">
                                                <Clock size={12} />
                                                <span>Joined: {new Date(group.joined_at).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => handleRemoveGroup(group.id)}
                                            className="text-red-500 p-1 rounded-full hover:bg-red-500/10 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
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

                {/* Payments Section */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-sm font-medium text-tg-hint uppercase">Recent Payments</h3>
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            className="text-tg-button text-sm font-medium flex items-center gap-1"
                        >
                            <Plus size={16} /> Record
                        </button>
                    </div>
                    <Section>
                        {payments.length > 0 ? (
                            payments.slice(0, 5).map((payment, idx) => (
                                <div key={payment.id} className={cn("p-4 bg-tg-bg flex justify-between items-center", idx !== payments.length - 1 && "border-b border-tg-hint/10")}>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-tg-text">{payment.subject_name || 'Tuition'}</span>
                                        <span className="text-xs text-tg-hint">{new Date(payment.payment_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="font-semibold text-tg-text text-green-500">+{payment.amount.toLocaleString()}</span>
                                        <span className="text-xs text-tg-hint capitalize">{payment.status}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-tg-hint">
                                No payment history
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

            {/* Modals (Still used for Add actions) */}
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
