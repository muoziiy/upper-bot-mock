import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegram } from '../../../context/TelegramContext';
import { Plus, Trash2 } from 'lucide-react';

interface Group {
    id: string;
    name: string;
    price?: number;
    teacher_id?: string;
}

interface AdminGroupManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    studentName: string;
    currentGroups: { id: string; name: string; price?: number }[];
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
    const [isAdding, setIsAdding] = useState(false);
    const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);
    const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(false);

    const [selectedGroupToAdd, setSelectedGroupToAdd] = useState<Group | null>(null);

    // Handle Native Back Button
    useEffect(() => {
        if (isOpen) {
            webApp.BackButton.show();
            const handleBack = () => {
                if (selectedGroupToAdd) {
                    setSelectedGroupToAdd(null);
                } else if (isAdding) {
                    setIsAdding(false);
                } else {
                    onClose();
                }
            };
            webApp.BackButton.onClick(handleBack);
            return () => {
                webApp.BackButton.offClick(handleBack);
                // Don't hide if we are in a stacked modal context, but here we can't know for sure.
                // However, since we are the top modal, hiding is usually correct when closing.
                if (!isAdding && !selectedGroupToAdd) webApp.BackButton.hide();
            };
        }
    }, [isOpen, isAdding, selectedGroupToAdd, onClose, webApp]);

    // Fetch available groups when adding
    useEffect(() => {
        if (isAdding) {
            fetchGroups();
        }
    }, [isAdding]);

    const fetchGroups = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/groups/list`);
            if (res.ok) {
                const data = await res.json();
                // Filter out groups the student is already in
                const filtered = data.filter((g: Group) => !currentGroups.some(cg => cg.id === g.id));
                setAvailableGroups(filtered);
            }
        } catch (e) {
            console.error('Failed to fetch groups', e);
        }
    };

    const handleAddGroup = async () => {
        if (!selectedGroupToAdd) return;

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/students/${studentId}/groups`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupId: selectedGroupToAdd.id, action: 'add', joinedAt: joinDate })
            });

            if (res.ok) {
                webApp?.showPopup({
                    title: 'Success',
                    message: 'Group added successfully.',
                    buttons: [{ type: 'ok' }]
                });
                onUpdate();
                setSelectedGroupToAdd(null);
                setIsAdding(false);
            } else {
                throw new Error('Failed to add group');
            }
        } catch (e) {
            webApp?.showAlert('Failed to add group');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveGroup = async (groupId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/students/${studentId}/groups`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupId, action: 'remove' })
            });

            if (res.ok) {
                webApp?.showPopup({
                    title: 'Success',
                    message: 'Group removed successfully.',
                    buttons: [{ type: 'ok' }]
                });
                onUpdate();
            } else {
                throw new Error('Failed to remove group');
            }
        } catch (e) {
            webApp?.showAlert('Failed to remove group');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-tg-bg flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-tg-hint/10 flex items-center justify-between bg-tg-bg">
                <h2 className="text-lg font-semibold text-tg-text">
                    {selectedGroupToAdd ? 'Configure Join Date' : (isAdding ? 'Add Group' : `Groups - ${studentName}`)}
                </h2>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                <AnimatePresence mode="wait">
                    {selectedGroupToAdd ? (
                        <motion.div
                            key="confirm"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="bg-tg-secondary p-4 rounded-xl border border-tg-hint/10">
                                <span className="text-sm text-tg-hint block mb-1">Selected Group</span>
                                <span className="text-lg font-bold text-tg-text">{selectedGroupToAdd.name}</span>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-tg-hint ml-1">Join Date</label>
                                <input
                                    type="date"
                                    value={joinDate}
                                    onChange={(e) => setJoinDate(e.target.value)}
                                    className="w-full bg-tg-secondary text-tg-text p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-tg-button/20"
                                />
                                <p className="text-xs text-tg-hint ml-1">
                                    Payments will be calculated from this date.
                                </p>
                            </div>

                            <button
                                onClick={handleAddGroup}
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl bg-tg-button text-white font-semibold active:scale-[0.98] transition-all shadow-lg shadow-tg-button/20"
                            >
                                {loading ? 'Adding...' : 'Confirm & Add'}
                            </button>
                        </motion.div>
                    ) : isAdding ? (
                        <motion.div
                            key="adding"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-2"
                        >
                            <p className="text-sm text-tg-hint mb-2">Select a group to add:</p>
                            {availableGroups.length > 0 ? (
                                availableGroups.map((group) => (
                                    <button
                                        key={group.id}
                                        onClick={() => setSelectedGroupToAdd(group)}
                                        disabled={loading}
                                        className="w-full flex items-center justify-between p-4 bg-tg-secondary rounded-xl active:bg-tg-secondary/80 transition-colors"
                                    >
                                        <div className="text-left">
                                            <span className="font-semibold text-tg-text block">{group.name}</span>
                                            <span className="text-xs text-tg-hint">
                                                {group.price ? `${group.price.toLocaleString()} UZS` : 'Free'}
                                            </span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-tg-button/10 flex items-center justify-center text-tg-button">
                                            <Plus size={18} />
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <p className="text-center text-tg-hint py-8">No available groups to add.</p>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            {/* Add Button */}
                            <button
                                onClick={() => setIsAdding(true)}
                                className="w-full py-3 rounded-xl bg-tg-button text-white font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                            >
                                <Plus size={20} />
                                Add Group
                            </button>

                            {/* Current Groups List */}
                            <div className="space-y-2">
                                {currentGroups.length > 0 ? (
                                    currentGroups.map((group) => (
                                        <div key={group.id} className="flex items-center justify-between p-4 bg-tg-secondary rounded-xl border border-tg-hint/10">
                                            <div>
                                                <span className="font-semibold text-tg-text block">{group.name}</span>
                                                <span className="text-xs text-tg-hint">
                                                    {group.price ? `${group.price.toLocaleString()} UZS` : 'Free'}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveGroup(group.id)}
                                                disabled={loading}
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-tg-hint">No groups assigned yet.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminGroupManagementModal;
