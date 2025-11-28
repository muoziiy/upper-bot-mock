import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Section } from '../../components/ui/Section';
import { ListItem } from '../../components/ui/ListItem';
import AdminPaymentModal from './components/AdminPaymentModal';
import AdminFilterModal from './components/AdminFilterModal';
import AdminGroupManagementModal from './components/AdminGroupManagementModal';
import AdminAttendanceModal from './components/AdminAttendanceModal';
import AdminStudentDetailsModal from './components/AdminStudentDetailsModal';

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
    const [showDetailsModal, setShowDetailsModal] = useState(false);
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

                // Update selectedStudent if it exists
                if (selectedStudent) {
                    const updatedSelected = filtered.find((s: Student) => s.id === selectedStudent.id);
                    if (updatedSelected) {
                        setSelectedStudent(updatedSelected);
                    }
                }
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

    const navigate = useNavigate();

    const handleStudentClick = (student: Student) => {
        navigate(`/admin/students/${student.id}`);
    };

    const handleAction = (action: 'payment' | 'groups' | 'attendance') => {
        // Keep details modal open to prevent flash
        if (action === 'payment') setShowPaymentModal(true);
        if (action === 'groups') setShowGroupModal(true);
        if (action === 'attendance') setShowAttendanceModal(true);
    };

    return (
        <div className="min-h-screen bg-tg-secondary pb-20">
            {/* Search Header */}
            <div className="bg-tg-secondary sticky top-0 z-20 px-4 py-2 backdrop-blur-md bg-opacity-90">
                <div className="relative flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tg-hint" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search"
                            className="w-full bg-gray-200 dark:bg-black/20 text-black dark:text-white pl-9 pr-4 py-2 rounded-xl border-none outline-none focus:ring-2 focus:ring-tg-button/50 transition-all placeholder:text-tg-hint"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilterModal(true)}
                        className={cn(
                            "p-2 rounded-xl transition-colors",
                            filters.status !== 'all' ? "bg-tg-button text-white" : "bg-gray-200 dark:bg-black/20 text-tg-hint"
                        )}
                    >
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Student List */}
            <div className="pt-2">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tg-button"></div>
                    </div>
                ) : students.length > 0 ? (
                    <Section>
                        {students.map((student, idx) => (
                            <ListItem
                                key={student.id}
                                icon={student.sex === 'female' ? '👩' : '👨'}
                                title={`${student.first_name} ${student.surname}`}
                                subtitle={`ID: ${student.student_id}`}
                                rightElement={
                                    student.payment_status === 'overdue' ? (
                                        <span className="text-xs font-bold text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                                            Overdue
                                        </span>
                                    ) : null
                                }
                                onClick={() => handleStudentClick(student)}
                                isLast={idx === students.length - 1}
                                showChevron
                            />
                        ))}
                    </Section>
                ) : (
                    <div className="text-center py-12 text-tg-hint">
                        No students found
                    </div>
                )}
            </div>

            {/* Modals */}
            {selectedStudent && (
                <>
                    <AdminStudentDetailsModal
                        isOpen={showDetailsModal}
                        onClose={() => setShowDetailsModal(false)}
                        student={selectedStudent}
                        onAction={handleAction}
                    />
                    <AdminPaymentModal
                        isOpen={showPaymentModal}
                        onClose={() => setShowPaymentModal(false)}
                        studentId={selectedStudent.id}
                        studentName={`${selectedStudent.first_name} ${selectedStudent.surname}`}
                        groups={selectedStudent.groups}
                    />
                    <AdminGroupManagementModal
                        isOpen={showGroupModal}
                        onClose={() => setShowGroupModal(false)}
                        studentId={selectedStudent.id}
                        studentName={`${selectedStudent.first_name} ${selectedStudent.surname}`}
                        currentGroups={selectedStudent.groups}
                        onUpdate={fetchStudents}
                    />
                    <AdminAttendanceModal
                        isOpen={showAttendanceModal}
                        onClose={() => setShowAttendanceModal(false)}
                        studentId={selectedStudent.id}
                        studentName={`${selectedStudent.first_name} ${selectedStudent.surname}`}
                    />
                </>
            )}

            {showFilterModal && (
                <AdminFilterModal
                    isOpen={showFilterModal}
                    onClose={() => setShowFilterModal(false)}
                    filters={filters}
                    onApply={setFilters}
                />
            )}
        </div>
    );
};

export default AdminStudents;
