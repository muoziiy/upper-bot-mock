import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { AdminSection } from './components/AdminSection';
import { AdminListItem } from './components/AdminListItem';
import { useAdminData } from '../../hooks/useAdminData';

interface Teacher {
    id: string;
    first_name: string;
    onboarding_first_name?: string;
    surname: string;
    subjects?: string[];
    groups_count?: number;
}

const AdminTeachers: React.FC = () => {
    const navigate = useNavigate();
    const { teachers: rawTeachers, loading } = useAdminData();
    const teachers = rawTeachers as Teacher[];
    const [searchQuery, setSearchQuery] = useState('');

    // Filter teachers based on search
    const filteredTeachers = teachers.filter(teacher => {
        const fullName = `${teacher.onboarding_first_name || teacher.first_name} ${teacher.surname}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
    });

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] pb-20">
            {/* Search Header */}
            <div className="bg-[#F2F2F7] dark:bg-[#000000] sticky top-0 z-20 px-4 py-2 backdrop-blur-md bg-opacity-90">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93]" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search teachers..."
                        className="w-full bg-[#E3E3E8] dark:bg-[#1C1C1E] text-black dark:text-white pl-9 pr-4 py-2 rounded-[10px] border-none outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-[#8E8E93]"
                    />
                </div>
            </div>

            {/* Teacher List */}
            <div className="pt-2">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : filteredTeachers.length > 0 ? (
                    <AdminSection>
                        {filteredTeachers.map((teacher, idx) => (
                            <AdminListItem
                                key={teacher.id}
                                icon="👨‍🏫"
                                iconColor="bg-orange-500"
                                title={`${teacher.onboarding_first_name || teacher.first_name} ${teacher.surname}`}
                                // subtitle removed
                                value={
                                    teacher.groups_count !== undefined ? (
                                        <span className="text-sm text-[#8E8E93]">
                                            {teacher.groups_count} {teacher.groups_count === 1 ? 'group' : 'groups'}
                                        </span>
                                    ) : null
                                }
                                onClick={() => navigate(`/admin/teachers/${teacher.id}`)}
                                isLast={idx === filteredTeachers.length - 1}
                                showChevron
                            />
                        ))}
                    </AdminSection>
                ) : (
                    <div className="text-center py-12 text-[#8E8E93]">
                        No teachers found
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTeachers;
