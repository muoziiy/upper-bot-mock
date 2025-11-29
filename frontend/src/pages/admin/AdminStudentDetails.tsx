import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import { Section } from '../../components/ui/Section';
import { CreditCard, Users, Calendar, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import AdminPaymentModal from './components/AdminPaymentModal';
import AdminGroupManagementModal from './components/AdminGroupManagementModal';
import AdminAttendanceModal from './components/AdminAttendanceModal';

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
    }[];
    payment_status?: 'paid' | 'unpaid' | 'overdue';
}

const AdminStudentDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { webApp } = useTelegram();
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);

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
    }, [id]);

    const fetchStudentDetails = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/students/${id}`);
            if (res.ok) {
                const data = await res.json();
                setStudent(data);
            } else {
                console.error('Failed to fetch student details');
            }
        } catch (e) {
            console.error('Failed to fetch student details', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-tg-secondary flex items-center justify-center text-tg-hint">Loading...</div>;
    }

    if (!student) {
        return <div className="min-h-screen bg-tg-secondary flex items-center justify-center text-tg-hint">Student not found</div>;
    }

    const handleModalClose = () => {
        setShowPaymentModal(false);
        setShowGroupModal(false);
        setShowAttendanceModal(false);
    };

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

                {/* Group Info */}
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-tg-hint uppercase ml-2">Group Info</h3>
                    <Section>
                        {student.groups.length > 0 ? (
                            student.groups.map((group, idx) => (
                                <div key={group.id} className={cn("p-4 bg-tg-bg flex flex-col gap-1", idx !== student.groups.length - 1 && "border-b border-tg-hint/10")}>
                                    <div className="flex justify-between items-start">
                                        <span className="font-semibold text-tg-text">{group.name}</span>
                                        <span className="text-sm font-medium text-tg-text">{group.price.toLocaleString()} UZS</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-tg-hint">
                                        <span>{group.teacher_name || 'No Teacher'}</span>
                                    </div>
                                    {group.joined_at && (
                                        <div className="flex items-center gap-1.5 text-xs text-tg-hint mt-1">
                                            <Clock size={12} />
                                            <span>Joined: {new Date(group.joined_at).toLocaleDateString()}</span>
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

                {/* Actions */}
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-tg-hint uppercase ml-2">Actions</h3>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            className="flex flex-col items-center justify-center gap-2 p-4 bg-tg-bg rounded-xl shadow-sm border border-tg-hint/10 active:scale-95 transition-transform"
                        >
                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                                <CreditCard size={20} />
                            </div>
                            <span className="text-xs font-medium text-tg-text">Payments</span>
                        </button>
                        <button
                            onClick={() => setShowGroupModal(true)}
                            className="flex flex-col items-center justify-center gap-2 p-4 bg-tg-bg rounded-xl shadow-sm border border-tg-hint/10 active:scale-95 transition-transform"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                                <Users size={20} />
                            </div>
                            <span className="text-xs font-medium text-tg-text">Groups</span>
                        </button>
                        <button
                            onClick={() => setShowAttendanceModal(true)}
                            className="flex flex-col items-center justify-center gap-2 p-4 bg-tg-bg rounded-xl shadow-sm border border-tg-hint/10 active:scale-95 transition-transform"
                        >
                            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600">
                                <Calendar size={20} />
                            </div>
                            <span className="text-xs font-medium text-tg-text">Attendance</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AdminPaymentModal
                isOpen={showPaymentModal}
                onClose={handleModalClose}
                studentId={student.id}
                studentName={`${student.first_name} ${student.surname}`}
                groups={student.groups}
            />
            <AdminGroupManagementModal
                isOpen={showGroupModal}
                onClose={handleModalClose}
                studentId={student.id}
                studentName={`${student.first_name} ${student.surname}`}
                currentGroups={student.groups}
                onUpdate={fetchStudentDetails}
            />
            <AdminAttendanceModal
                isOpen={showAttendanceModal}
                onClose={handleModalClose}
                studentId={student.id}
                studentName={`${student.first_name} ${student.surname}`}
            />
        </div>
    );
};

export default AdminStudentDetails;
