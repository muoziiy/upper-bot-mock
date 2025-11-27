import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import { Search } from 'lucide-react';

interface Student {
    id: string;
    student_id: string;
    first_name: string;
    surname: string;
    age: number;
    sex: string;
    groups: string[];
}

const AdminStudents: React.FC = () => {
    const { webApp } = useTelegram();
    const navigate = useNavigate();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Handle Native Back Button
    useEffect(() => {
        webApp?.BackButton.show();
        const handleBack = () => navigate(-1);
        webApp?.BackButton.onClick(handleBack);
        return () => {
            webApp?.BackButton.offClick(handleBack);
            webApp?.BackButton.hide();
        };
    }, [webApp, navigate]);

    // Fetch students with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStudents();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const query = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/students${query}`);
            if (res.ok) {
                const data = await res.json();
                setStudents(data);
            }
        } catch (e) {
            console.error('Failed to fetch students', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-tg-secondary">
            {/* Sticky Search Header */}
            <div className="sticky top-0 z-10 bg-tg-bg px-4 py-3 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tg-hint" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, surname or ID..."
                        className="w-full bg-tg-secondary text-tg-text pl-10 pr-4 py-2 rounded-xl border-none outline-none focus:ring-2 focus:ring-tg-button/50 transition-all placeholder:text-tg-hint"
                        autoFocus
                    />
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3 pb-20">
                {loading ? (
                    <div className="text-center text-tg-hint py-8">Loading students...</div>
                ) : students.length > 0 ? (
                    students.map((student) => (
                        <div key={student.id} className="bg-tg-bg p-4 rounded-xl shadow-sm border border-tg-hint/10">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-semibold text-tg-text text-lg">
                                        {student.first_name} {student.surname}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-tg-hint mt-1">
                                        <span className="bg-tg-secondary px-2 py-0.5 rounded text-xs font-mono">
                                            ID: {student.student_id || 'N/A'}
                                        </span>
                                        <span>•</span>
                                        <span>{student.age} y.o</span>
                                        <span>•</span>
                                        <span>{student.sex === 'male' ? 'Male' : 'Female'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Subjects / Groups */}
                            <div className="mt-3">
                                <p className="text-xs text-tg-hint mb-1 uppercase tracking-wider font-medium">Subjects</p>
                                <div className="flex flex-wrap gap-2">
                                    {student.groups.length > 0 ? (
                                        student.groups.map((group, idx) => (
                                            <span key={idx} className="bg-blue-500/10 text-blue-500 px-2 py-1 rounded-md text-xs font-medium">
                                                {group}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-tg-hint text-sm italic">No subjects assigned</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-3">🔍</div>
                        <p className="text-tg-hint">No students found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminStudents;
