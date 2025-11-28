import React, { useState, useEffect } from 'react';
import { Search, Filter, CreditCard, Users, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import AdminPaymentModal from './components/AdminPaymentModal';
import AdminFilterModal from './components/AdminFilterModal';
import AdminGroupManagementModal from './components/AdminGroupManagementModal';
import AdminAttendanceModal from './components/AdminAttendanceModal';

// Interfaces
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

const AdminStudents: React.FC = () => {
    // const { webApp } = useTelegram();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter State
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all' as 'all' | 'paid' | 'unpaid' | 'overdue',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    // Modal State
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);

    // Fetch students
    const fetchStudents = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (searchQuery) queryParams.append('search', searchQuery);

            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/students?${queryParams.toString()}`);
            if (res.ok) {
                const data = await res.json();
                // Client-side filtering
                let filtered = data;
                if (filters.status !== 'all') {
                    if (filters.status === 'unpaid') {
                        filtered = filtered.filter((s: Student) => s.payment_status === 'unpaid' || s.payment_status === 'overdue');
                    } else {
                        filtered = filtered.filter((s: Student) => s.payment_status === filters.status);
                    }
                }
                setStudents(filtered);
            }
        } catch (e) {
            console.error('Failed to fetch students', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStudents();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, filters]);

    // Helper to get Emoji Avatar
    const getAvatarEmoji = (sex: string | null) => {
        if (sex === 'male') return '👨';
        if (sex === 'female') return '👩';
        return '🧑';
    };

    const handlePaymentClick = (student: Student) => {
        setSelectedStudent(student);
        setShowPaymentModal(true);
    };

    const handleGroupClick = (student: Student) => {
        setSelectedStudent(student);
        setShowGroupModal(true);
    };

    const handleAttendanceClick = (student: Student) => {
        setSelectedStudent(student);
        setShowAttendanceModal(true);
    };

    return (
        <div className="min-h-screen bg-white pb-32">
            {/* Student List */}
            <div className="p-4 space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                        <div className="w-8 h-8 border-2 border-tg-button border-t-transparent rounded-full animate-spin" />
                        <p className="text-tg-hint text-sm">Loading students...</p>
                    </div>
                ) : students.length > 0 ? (
                    students.map((student) => (
                        <motion.div
                            key={student.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-tg-bg p-4 rounded-2xl shadow-sm border border-tg-hint/5"
                        >
                            {/* Top Section: Avatar, Name/ID, Status */}
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-12 h-12 rounded-full bg-tg-secondary flex items-center justify-center text-2xl flex-shrink-0">
                                    {getAvatarEmoji(student.sex)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="font-semibold text-tg-text text-base leading-tight">
                                                {student.first_name} {student.surname}
                                            </h3>
                                            <p className="text-tg-hint text-xs font-mono mt-0.5">
                                                ID: {student.student_id}
                                            </p>
                                        </div>
                                        {student.payment_status === 'overdue' && (
                                            <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded-md text-xs font-bold whitespace-nowrap animate-pulse">
                                                🔴 OVERDUE
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Group Info Section */}
                            {student.groups.length > 0 && (
                                <div className="space-y-2 mb-3 pb-3 border-b border-tg-hint/10">
                                    <p className="text-xs font-semibold text-tg-hint uppercase tracking-wide">Group Info</p>
                                    {student.groups.map((group, idx) => (
                                        <div key={idx} className="bg-tg-secondary/50 p-2.5 rounded-lg space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold text-tg-text">📚 {group.name}</span>
                                                <span className="text-xs font-bold text-tg-button">
                                                    {group.price ? `${group.price.toLocaleString()} UZS` : 'Free'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-tg-hint">
                                                <span>👨‍🏫 {group.teacher_name || 'No teacher'}</span>
                                                <span>•</span>
                                                <span>📅 Joined: {group.joined_at ? new Date(group.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            <div>
                                <p className="text-xs font-semibold text-tg-hint uppercase tracking-wide mb-2">Actions</p>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => handleGroupClick(student)}
                                        className="flex flex-col items-center gap-1.5 py-2 px-2 rounded-xl bg-tg-secondary/50 text-tg-button active:opacity-70 transition-opacity"
                                    >
                                        <Users size={18} />
                                        <span className="text-[10px] font-medium">Groups</span>
                                    </button>
                                    <button
                                        onClick={() => handlePaymentClick(student)}
                                        className="flex flex-col items-center gap-1.5 py-2 px-2 rounded-xl bg-tg-secondary/50 text-tg-button active:opacity-70 transition-opacity"
                                    >
                                        <CreditCard size={18} />
                                        <span className="text-[10px] font-medium">Payments</span>
                                    </button>
                                    <button
                                        onClick={() => handleAttendanceClick(student)}
                                        className="flex flex-col items-center gap-1.5 py-2 px-2 rounded-xl bg-tg-secondary/50 text-tg-button active:opacity-70 transition-opacity"
                                    >
                                        <Edit size={18} />
                                        <span className="text-[10px] font-medium">Attendance</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-3">🔍</div>
                        <p className="text-tg-hint">No students found</p>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showPaymentModal && selectedStudent && (
                    <AdminPaymentModal
                        isOpen={showPaymentModal}
                        onClose={() => setShowPaymentModal(false)}
                        studentId={selectedStudent.id}
                        studentName={`${selectedStudent.first_name} ${selectedStudent.surname}`}
                        groups={selectedStudent.groups}
                    />
                )}
                {showFilterModal && (
                    <AdminFilterModal
                        isOpen={showFilterModal}
                        onClose={() => setShowFilterModal(false)}
                        filters={filters}
                        onApply={setFilters}
                    />
                )}
                {showGroupModal && selectedStudent && (
                    <AdminGroupManagementModal
                        isOpen={showGroupModal}
                        onClose={() => setShowGroupModal(false)}
                        studentId={selectedStudent.id}
                        studentName={`${selectedStudent.first_name} ${selectedStudent.surname}`}
                        currentGroups={selectedStudent.groups}
                        onUpdate={fetchStudents}
                    />
                )}
                {showAttendanceModal && selectedStudent && (
                    <AdminAttendanceModal
                        isOpen={showAttendanceModal}
                        onClose={() => setShowAttendanceModal(false)}
                        studentId={selectedStudent.id}
                        studentName={`${selectedStudent.first_name} ${selectedStudent.surname}`}
                    />
                )}
            </AnimatePresence>

            {/* Bottom Search & Filters - Fixed above navbar */}
            <div className="fixed bottom-16 left-4 right-4 z-20">
                <div className="relative rounded-2xl bg-tg-secondary/90 backdrop-blur-xl p-3 border border-white/5 shadow-lg">
                    <div className="space-y-3">
                        {/* Search Bar */}
                        <div className="relative flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tg-hint" size={20} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search students..."
                                    className="w-full bg-tg-secondary text-tg-text pl-10 pr-4 py-2.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-tg-button/50 transition-all placeholder:text-tg-hint/70"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilterModal(true)}
                                className={cn(
                                    "p-2.5 rounded-xl transition-colors",
                                    filters.status !== 'all' ? "bg-tg-button text-white" : "bg-tg-secondary text-tg-hint"
                                )}
                            >
                                <Filter size={20} />
                            </button>
                        </div>

                        {/* Active Filters Display */}
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            <button
                                onClick={() => setFilters({ ...filters, status: 'all' })}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                                    filters.status === 'all'
                                        ? "bg-tg-button text-white"
                                        : "bg-tg-secondary text-tg-hint hover:bg-tg-secondary/80"
                                )}
                            >
                                All
                            </button>
                            {filters.status !== 'all' && (
                                <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-tg-button text-white whitespace-nowrap capitalize">
                                    {filters.status}
                                </span>
                            )}
                            <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-tg-secondary text-tg-hint whitespace-nowrap border border-tg-hint/10">
                                {new Date(0, filters.month - 1).toLocaleString('default', { month: 'long' })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminStudents;
