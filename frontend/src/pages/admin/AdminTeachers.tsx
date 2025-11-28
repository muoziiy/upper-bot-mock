import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface Teacher {
    id: string;
    first_name: string;
    surname: string;
    subjects?: string[];
    groups_count?: number;
}

const AdminTeachers: React.FC = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch teachers
    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/teachers`);
            if (res.ok) {
                const data = await res.json();
                setTeachers(data);
            }
        } catch (e) {
            console.error('Failed to fetch teachers', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTeachers();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Filter teachers based on search
    const filteredTeachers = teachers.filter(teacher => {
        const fullName = `${teacher.first_name} ${teacher.surname}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
    });

    const getAvatarEmoji = () => '👨‍🏫';

    return (
        <div className="min-h-screen bg-tg-secondary pb-32">
            {/* Teacher List */}
            <div className="p-4 space-y-3">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                        <div className="w-8 h-8 border-2 border-tg-button border-t-transparent rounded-full animate-spin" />
                        <p className="text-tg-hint text-sm">Loading teachers...</p>
                    </div>
                ) : filteredTeachers.length > 0 ? (
                    filteredTeachers.map((teacher) => (
                        <motion.div
                            key={teacher.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-tg-bg p-4 rounded-2xl shadow-sm border border-tg-hint/5"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-tg-secondary flex items-center justify-center text-2xl flex-shrink-0">
                                    {getAvatarEmoji()}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-tg-text text-lg leading-tight truncate">
                                        {teacher.first_name} {teacher.surname}
                                    </h3>
                                    {teacher.subjects && teacher.subjects.length > 0 && (
                                        <p className="text-tg-hint text-sm mt-1">
                                            {teacher.subjects.join(', ')}
                                        </p>
                                    )}
                                    {teacher.groups_count !== undefined && (
                                        <p className="text-tg-hint text-xs mt-1">
                                            {teacher.groups_count} {teacher.groups_count === 1 ? 'group' : 'groups'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-3">🔍</div>
                        <p className="text-tg-hint">No teachers found</p>
                    </div>
                )}
            </div>

            {/* Bottom Search Bar - Fixed above navbar */}
            <div className="fixed bottom-16 left-0 right-0 z-20 bg-tg-bg border-t border-tg-hint/10 shadow-lg">
                <div className="px-4 py-3">
                    <div className="relative flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tg-hint" size={20} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search teachers..."
                                className="w-full bg-tg-secondary text-tg-text pl-10 pr-4 py-2.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-tg-button/50 transition-all placeholder:text-tg-hint/70"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTeachers;
