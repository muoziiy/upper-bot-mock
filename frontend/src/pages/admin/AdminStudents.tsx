import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import { Search, Filter, CreditCard, Users, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import AdminPaymentModal from './components/AdminPaymentModal';
import AdminFilterModal from './components/AdminFilterModal';
import AdminGroupManagementModal from './components/AdminGroupManagementModal';

// Interfaces
interface Student {
    id: string;
    student_id: string;
    first_name: string;
    surname: string;
    age: number;
    sex: 'male' | 'female' | null;
    groups: string[];
    payment_status?: 'paid' | 'unpaid' | 'overdue';
}

const AdminStudents: React.FC = () => {
    const { webApp } = useTelegram();
    const navigate = useNavigate();
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

    // Handle Native Back Button
    useEffect(() => {
        if (webApp) {
            webApp.BackButton.show();
            const handleBack = () => navigate(-1);
            webApp.BackButton.onClick(handleBack);
            return () => {
                webApp.BackButton.offClick(handleBack);
                webApp.BackButton.hide();
            };
        }
    }, [webApp, navigate]);

    // Fetch students
    const fetchStudents = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (searchQuery) queryParams.append('search', searchQuery);
            // Add other filters if backend supports them (future enhancement)

            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/students?${queryParams.toString()}`);
            if (res.ok) {
                const data = await res.json();
                // Client-side filtering for now (until backend supports it)
                let filtered = data;
                if (filters.status !== 'all') {
                    // This is a placeholder. Real filtering should happen on backend or based on fetched payment status
                    // For now, we just show all because payment_status isn't fully populated in the list yet
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
    }, [searchQuery, filters]); // Re-fetch when filters change

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

    const handleEditClick = (student: Student) => {
        // Future: Open edit modal
        console.log('Edit student:', student);
        webApp?.showAlert('Edit functionality coming soon');
    };

    return (
        <div className="min-h-screen bg-tg-secondary">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-tg-bg border-b border-tg-hint/10">
                <div className="px-4 py-3 space-y-3">
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

            {/* Student List */}
            <div className="p-4 space-y-3 pb-24">
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
                            className="bg-tg-bg p-4 rounded-2xl shadow-sm border border-tg-hint/5 relative overflow-hidden"
                        >
                            <div className="flex items-start gap-4">
                                {/* Emoji Avatar */}
                                <div className="w-12 h-12 rounded-full bg-tg-secondary flex items-center justify-center text-2xl flex-shrink-0">
                                    {getAvatarEmoji(student.sex)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-tg-text text-lg leading-tight truncate">
                                                {student.first_name} {student.surname}
                                            </h3>
                                            <p className="text-tg-hint text-xs font-mono mt-0.5">
                                                ID: {student.student_id}
                                            </p>
                                        </div>
                                        {/* Status Badge (Mock for now - real data needs backend update) */}
                                        {/* In future, this will reflect real payment status */}
                                    </div>

                                    {/* Groups */}
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                        {student.groups.length > 0 ? (
                                            student.groups.map((group, idx) => (
                                                <span key={idx} className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-md text-xs font-medium">
                                                    {group}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-tg-hint text-xs italic">No groups</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-tg-hint/10">
                                <button
                                    onClick={() => handleEditClick(student)}
                                    className="flex flex-col items-center gap-1 py-1 text-tg-button active:opacity-70"
                                >
                                    <Edit size={18} />
                                    <span className="text-[10px] font-medium">Edit Info</span>
                                </button>
                                <button
                                    onClick={() => handleGroupClick(student)}
                                    className="flex flex-col items-center gap-1 py-1 text-tg-button active:opacity-70"
                                >
                                    <Users size={18} />
                                    <span className="text-[10px] font-medium">Groups</span>
                                </button>
                                <button
                                    onClick={() => handlePaymentClick(student)}
                                    className="flex flex-col items-center gap-1 py-1 text-tg-button active:opacity-70"
                                >
                                    <CreditCard size={18} />
                                    <span className="text-[10px] font-medium">Payments</span>
                                </button>
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
            </AnimatePresence>
        </div>
    );
};

export default AdminStudents;
