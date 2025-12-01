import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AdminSection } from './components/AdminSection';
import { AdminListItem } from './components/AdminListItem';
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

const AdminStudents: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);

    // Filter State
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all' as 'all' | 'paid' | 'unpaid' | 'overdue',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        subjectId: 'all'
    });

    // Modal State
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);

    const [error, setError] = useState<string | null>(null);

    // Fetch subjects
    const fetchSubjects = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/subjects/list`);
            if (res.ok) {
                const data = await res.json();
                setSubjects(data);
            }
        } catch (e) {
            console.error('Failed to fetch subjects', e);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    // Fetch students
    const fetchStudents = async () => {
        setLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams();
            if (searchQuery) queryParams.append('search', searchQuery);

            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/students?${queryParams.toString()}`);
            if (res.ok) {
                const data = await res.json();
                // Client-side filtering
                let filtered = data;

                // Status Filter
                if (filters.status !== 'all') {
                    if (filters.status === 'unpaid') {
                        filtered = filtered.filter((s: Student) => s.payment_status === 'unpaid' || s.payment_status === 'overdue');
                    } else {
                        filtered = filtered.filter((s: Student) => s.payment_status === filters.status);
                    }
                }

                // Subject Filter
                if (filters.subjectId !== 'all') {
                    filtered = filtered.filter((s: Student) =>
                        s.groups.some((g: any) => g.subject_id === filters.subjectId)
                    );
                }

                setStudents(filtered);

                // Update selectedStudent if it exists
                if (selectedStudent) {
                    const updatedSelected = filtered.find((s: Student) => s.id === selectedStudent.id);
                    if (updatedSelected) {
                        setSelectedStudent(updatedSelected);
                    }
                }
            } else {
                setError('Failed to fetch students');
            }
        } catch (e) {
            console.error('Failed to fetch students', e);
            setError('Error loading data');
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
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] pb-20">
            {/* Search Header */}
            <div className="bg-[#F2F2F7] dark:bg-[#000000] sticky top-0 z-20 px-4 py-2 backdrop-blur-md bg-opacity-90">
                <div className="relative flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93]" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search"
                            className="w-full bg-[#E3E3E8] dark:bg-[#1C1C1E] text-black dark:text-white pl-9 pr-4 py-2 rounded-[10px] border-none outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-[#8E8E93]"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilterModal(true)}
                        className={cn(
                            "p-2 rounded-[10px] transition-colors",
                            filters.status !== 'all' ? "bg-blue-500 text-white" : "bg-[#E3E3E8] dark:bg-[#1C1C1E] text-[#8E8E93]"
                        )}
                    >
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Student List */}
            <div className="pt-2">
                {error ? (
                    <div className="text-center py-10 text-red-500">
                        {error}
                        <button onClick={fetchStudents} className="block mx-auto mt-2 text-blue-500 text-sm">Retry</button>
                    </div>
                ) : loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : students.length > 0 ? (
                    <AdminSection>
                        {students.map((student, idx) => (
                            <AdminListItem
                                key={student.id}
                                icon={student.sex === 'female' ? '👩' : '👨'}
                                iconColor="bg-blue-500"
                                title={`${student.onboarding_first_name || student.first_name} ${student.surname}`}
                                // subtitle removed
                                value={<span className="text-sm text-[#8E8E93]">#{student.student_id}</span>}
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
                    </AdminSection>
                ) : (
                    <div className="text-center py-12 text-[#8E8E93]">
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
                    subjects={subjects}
                />
            )}
        </div>
    );
};

export default AdminStudents;
