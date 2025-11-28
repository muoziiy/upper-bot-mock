
import React, { useState, useEffect } from 'react';
import { Section } from '../../components/ui/Section';
import { ListItem } from '../../components/ui/ListItem';
import { Search, Plus } from 'lucide-react';
import AdminCreateGroupModal from './components/AdminCreateGroupModal';
import { useTelegram } from '../../context/TelegramContext';
import { useAdminData } from '../../hooks/useAdminData';

interface Group {
    id: string;
    name: string;
    price: number;
    teacher_id: string | null;
    teacher_name?: string;
    schedule: {
        days: string[];
        time: string;
    };
}

const AdminGroups: React.FC = () => {
    const { webApp } = useTelegram();
    const { groups, loading, refresh } = useAdminData();
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

    // Handle Native Back Button
    useEffect(() => {
        if (webApp) {
            webApp.BackButton.show();
            const handleBack = () => {
                window.history.back();
            };
            webApp.BackButton.onClick(handleBack);
            return () => {
                webApp.BackButton.offClick(handleBack);
                webApp.BackButton.hide();
            };
        }
    }, [webApp]);

    const handleCreate = () => {
        setSelectedGroup(null);
        setShowModal(true);
    };

    const handleEdit = (group: Group) => {
        setSelectedGroup(group);
        setShowModal(true);
    };

    const filteredGroups = groups.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-tg-secondary pt-4 pb-20">
            <h1 className="text-2xl font-bold mb-4 px-4 text-black dark:text-white">Manage Groups</h1>

            <div className="space-y-6">
                <div className="px-4 flex items-center gap-2 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tg-hint" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search groups..."
                            className="w-full bg-gray-200 dark:bg-black/20 text-black dark:text-white pl-9 pr-4 py-2 rounded-xl border-none outline-none focus:ring-2 focus:ring-tg-button/50 transition-all placeholder:text-tg-hint"
                        />
                    </div>
                    <button
                        onClick={handleCreate}
                        className="w-10 h-10 bg-tg-button text-white rounded-xl flex items-center justify-center shadow-lg shadow-tg-button/20 active:scale-95 transition-transform"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="text-center text-tg-hint py-8">Loading groups...</div>
                ) : filteredGroups.length > 0 ? (
                    <Section title="All Groups">
                        {filteredGroups.map((group, index) => (
                            <ListItem
                                key={group.id}
                                title={group.name}
                                subtitle={
                                    <div className="flex flex-col">
                                        <span>{group.teacher_name || 'No Teacher'}</span>
                                        <span className="text-xs opacity-70">{group.price ? `${group.price.toLocaleString()} UZS` : 'Free'}</span>
                                    </div>
                                }
                                icon="👥"
                                onClick={() => handleEdit(group)}
                                showChevron
                                isLast={index === filteredGroups.length - 1}
                            />
                        ))}
                    </Section>
                ) : (
                    <div className="text-center text-tg-hint py-8">No groups found</div>
                )}
            </div>

            <AdminCreateGroupModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={refresh}
                group={selectedGroup}
            />
        </div>
    );
};

export default AdminGroups;
