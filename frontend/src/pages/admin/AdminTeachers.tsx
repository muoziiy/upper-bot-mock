import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Section } from '../../components/ui/Section';
import { ListItem } from '../../components/ui/ListItem';
import { useAdminData } from '../../hooks/useAdminData';

interface Teacher {
    id: string;
    first_name: string;
    surname: string;
    subjects?: string[];
    groups_count?: number;
}

const AdminTeachers: React.FC = () => {
    const { teachers: rawTeachers, loading } = useAdminData();
    const teachers = rawTeachers as Teacher[];
    const [searchQuery, setSearchQuery] = useState('');

    // Filter teachers based on search
    const filteredTeachers = teachers.filter(teacher => {
        const fullName = `${teacher.first_name} ${teacher.surname}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
    });

    return (
        <div className="min-h-screen bg-tg-secondary pb-20">
            {/* Search Header */}
            <div className="bg-tg-secondary sticky top-0 z-20 px-4 py-2 backdrop-blur-md bg-opacity-90">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tg-hint" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search teachers..."
                        className="w-full bg-gray-200 dark:bg-black/20 text-black dark:text-white pl-9 pr-4 py-2 rounded-xl border-none outline-none focus:ring-2 focus:ring-tg-button/50 transition-all placeholder:text-tg-hint"
                    />
                </div>
            </div>

            {/* Teacher List */}
            <div className="pt-2">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tg-button"></div>
                    </div>
                ) : filteredTeachers.length > 0 ? (
                    <Section>
                        {filteredTeachers.map((teacher, idx) => (
                            <ListItem
                                key={teacher.id}
                                icon="👨‍🏫"
                                title={`${teacher.first_name} ${teacher.surname}`}
                                subtitle={teacher.subjects?.join(', ') || 'No subjects'}
                                rightElement={
                                    teacher.groups_count !== undefined ? (
                                        <span className="text-sm text-tg-hint">
                                            {teacher.groups_count} {teacher.groups_count === 1 ? 'group' : 'groups'}
                                        </span>
                                    ) : null
                                }
                                isLast={idx === filteredTeachers.length - 1}
                                showChevron
                            />
                        ))}
                    </Section>
                ) : (
                    <div className="text-center py-12 text-tg-hint">
                        No teachers found
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTeachers;
