
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSection } from './components/AdminSection';
import { AdminListItem } from './components/AdminListItem';
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
    const navigate = useNavigate();

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
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] pt-4 pb-20">
            <h1 className="text-3xl font-bold mb-4 px-4 text-black dark:text-white">Manage Groups</h1>

            <div className="space-y-6">
                <div className="px-4 flex items-center gap-2 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93]" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search groups..."
                            className="w-full bg-[#E3E3E8] dark:bg-[#1C1C1E] text-black dark:text-white pl-9 pr-4 py-2 rounded-[10px] border-none outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-[#8E8E93]"
                        />
                    </div>
                    <button
                        onClick={handleCreate}
                        className="w-10 h-10 bg-blue-500 text-white rounded-[10px] flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="text-center text-[#8E8E93] py-8">Loading groups...</div>
                ) : filteredGroups.length > 0 ? (
                    <AdminSection title="All Groups">
                        {filteredGroups.map((group, index) => (
                            <AdminListItem
                                key={group.id}
                                title={group.name}
                                // subtitle removed
                                value={
                                    <span className="text-sm text-[#8E8E93]">
                                        {group.price ? `${group.price.toLocaleString()} UZS` : 'Free'}
                                    </span>
                                }
                                icon="👥"
                                iconColor="bg-blue-500"
                                onClick={() => handleEdit(group)}
                                showChevron
                                isLast={index === filteredGroups.length - 1}
                            />
                        ))}
                    </AdminSection>
                ) : (
                    <div className="text-center text-[#8E8E93] py-8">No groups found</div>
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
