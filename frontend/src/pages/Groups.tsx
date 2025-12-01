import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import GroupDetailsModal from '../components/teacher/GroupDetailsModal';
import { AdminSection } from './admin/components/AdminSection';
import { AdminListItem } from './admin/components/AdminListItem';

const Groups: React.FC = () => {
    const { teacherData, loading } = useAppData();
    const { t } = useTranslation();
    const [selectedGroup, setSelectedGroup] = useState<any>(null);

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center bg-[#F2F2F7] dark:bg-[#000000] text-black dark:text-white">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] pb-24 pt-4 text-black dark:text-white">
            <GroupDetailsModal
                isOpen={!!selectedGroup}
                onClose={() => setSelectedGroup(null)}
                group={selectedGroup}
            />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <header className="mb-6 px-4">
                    <h1 className="text-3xl font-bold text-black dark:text-white">{t('teacher.my_groups')}</h1>
                    <p className="text-[#8E8E93] text-lg">{t('teacher.manage_classes')}</p>
                </header>

                <AdminSection title={t('teacher.active_groups')}>
                    {teacherData?.groups && teacherData.groups.length > 0 ? (
                        teacherData.groups.map((group, index) => (
                            <AdminListItem
                                key={group.id}
                                title={group.name}
                                subtitle={`${group.student_count} Students • ${group.next_class}`}
                                icon="👥"
                                iconColor="bg-blue-500"
                                onClick={() => setSelectedGroup(group)}
                                showChevron
                                isLast={index === teacherData.groups.length - 1}
                            />
                        ))
                    ) : (
                        <div className="p-4 text-center text-[#8E8E93] bg-white dark:bg-[#1C1C1E]">
                            {t('teacher.no_groups')}
                        </div>
                    )}
                </AdminSection>
            </motion.div>
        </div>
    );
};

export default Groups;
