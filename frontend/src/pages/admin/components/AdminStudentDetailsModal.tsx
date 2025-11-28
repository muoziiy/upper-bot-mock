import React, { useEffect } from 'react';
import { useTelegram } from '../../../context/TelegramContext';
import { Section } from '../../../components/ui/Section';
import { ListItem } from '../../../components/ui/ListItem';
import { X, CreditCard, Users, Calendar, Clock } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface Student {
    id: string;
    student_id: string;
    first_name: string;
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

interface AdminStudentDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student;
    onAction: (action: 'payment' | 'groups' | 'attendance') => void;
}

const AdminStudentDetailsModal: React.FC<AdminStudentDetailsModalProps> = ({ isOpen, onClose, student, onAction }) => {
    const { webApp } = useTelegram();

    useEffect(() => {
        if (isOpen) {
            webApp.BackButton.show();
            webApp.BackButton.onClick(onClose);
            return () => {
                webApp.BackButton.offClick(onClose);
                webApp.BackButton.hide();
            };
        }
    }, [isOpen, onClose, webApp]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-tg-secondary overflow-y-auto pb-10 animate-in slide-in-from-bottom-10 fade-in duration-200">
            {/* Header */}
            <div className="bg-tg-bg sticky top-0 z-10 px-4 py-3 flex items-center justify-between border-b border-tg-hint/10">
                <h2 className="text-lg font-semibold text-tg-text">Student Details</h2>
                <button onClick={onClose} className="p-1 rounded-full bg-tg-secondary text-tg-hint hover:text-tg-text transition-colors">
                    <X size={20} />
                </button>
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
                        {student.first_name} {student.surname}
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
                            onClick={() => onAction('payment')}
                            className="flex flex-col items-center justify-center gap-2 p-4 bg-tg-bg rounded-xl shadow-sm border border-tg-hint/10 active:scale-95 transition-transform"
                        >
                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                                <CreditCard size={20} />
                            </div>
                            <span className="text-xs font-medium text-tg-text">Payments</span>
                        </button>
                        <button
                            onClick={() => onAction('groups')}
                            className="flex flex-col items-center justify-center gap-2 p-4 bg-tg-bg rounded-xl shadow-sm border border-tg-hint/10 active:scale-95 transition-transform"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                                <Users size={20} />
                            </div>
                            <span className="text-xs font-medium text-tg-text">Groups</span>
                        </button>
                        <button
                            onClick={() => onAction('attendance')}
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
        </div>
    );
};

export default AdminStudentDetailsModal;
