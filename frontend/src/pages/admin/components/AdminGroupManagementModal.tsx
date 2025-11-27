import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { useTelegram } from '../../../context/TelegramContext';

interface Group {
    id: string;
    name: string;
}

interface AdminGroupManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    studentName: string;
    currentGroups: string[];
    onUpdate: () => void;
}

const AdminGroupManagementModal: React.FC<AdminGroupManagementModalProps> = ({
    isOpen,
    onClose,
    studentId,
    studentName,
    currentGroups,
    onUpdate
}) => {
    const { webApp } = useTelegram();
    const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchGroups();
        }
    }, [isOpen]);

    const fetchGroups = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/groups`); // Assuming endpoint
            if (res.ok) {
                const data = await res.json();
                setAvailableGroups(data);
            }
        } catch (e) {
            console.error('Failed to fetch groups', e);
        }
    };

    const handleToggleGroup = async (groupId: string, action: 'add' | 'remove') => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/students/${studentId}/groups`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupId, action })
            });

            if (res.ok) {
                webApp?.showPopup({
                    title: 'Success',
                    message: `Group ${action === 'add' ? 'added' : 'removed'} successfully.`,
                    buttons: [{ type: 'ok' }]
                });
                onUpdate();
            }
        } catch (e) {
            webApp?.showAlert('Failed to update groups');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="bg-tg-bg w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-xl max-h-[80vh] flex flex-col"
            >
                <div className="flex items-center justify-between p-4 border-b border-tg-hint/10">
                    <h2 className="text-lg font-semibold text-tg-text">Manage Groups</h2>
                    <button onClick={onClose} className="p-2 hover:bg-tg-hint/10 rounded-full">
                        <X size={20} className="text-tg-hint" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto">
                    <p className="text-sm text-tg-hint mb-4">Select groups for {studentName}</p>

                    <div className="space-y-2">
                        {availableGroups.map((group) => {
                            const isAssigned = currentGroups.includes(group.name);
                            return (
                                <div key={group.id} className="flex items-center justify-between p-3 bg-tg-secondary rounded-xl border border-tg-hint/10">
                                    <span className="font-medium text-tg-text">{group.name}</span>
                                    <button
                                        onClick={() => handleToggleGroup(group.id, isAssigned ? 'remove' : 'add')}
                                        disabled={loading}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                            isAssigned
                                                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                                                : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                        )}
                                    >
                                        {isAssigned ? 'Remove' : 'Add'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminGroupManagementModal;
