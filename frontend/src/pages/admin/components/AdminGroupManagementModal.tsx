import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegram } from '../../../context/TelegramContext';
import { Plus, ChevronLeft } from 'lucide-react';
import { mockService } from '../../../services/mockData';

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
    studentName: string; // Kept in interface to avoid breaking parent, but unused
    currentGroups: { id: string; name: string; price?: number }[];
    onUpdate: () => void;
}

const AdminGroupManagementModal: React.FC<AdminGroupManagementModalProps> = ({
    isOpen,
    onClose,
    studentId,
    // studentName, // Unused
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
            const data = await mockService.getAdminGroups();
            // Filter out groups the student is already in
            const filtered = data.filter((g: Group) => !currentGroups.some(cg => cg.id === g.id));
            setAvailableGroups(filtered);
        } catch (e) {
            console.error('Failed to fetch groups', e);
        }
    };

    const handleAddGroup = async () => {
        if (!selectedGroupToAdd) return;

        setLoading(true);
        try {
            await mockService.updateStudentGroups(studentId, {
                groupId: selectedGroupToAdd.id,
                action: 'add',
                joinedAt: joinDate
            });

            webApp?.showPopup({
                title: 'Success',
                message: 'Group added successfully.',
                buttons: [{ type: 'ok' }]
            });
            onUpdate();
            setSelectedGroupToAdd(null);
            setIsAdding(false);
        } catch (e) {
            webApp?.showAlert('Failed to add group');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveGroup = async (groupId: string) => {
        setLoading(true);
        try {
            await mockService.updateStudentGroups(studentId, {
                groupId,
                action: 'remove'
            });

            webApp?.showPopup({
                title: 'Success',
                message: 'Group removed successfully.',
                buttons: [{ type: 'ok' }]
            });
            onUpdate();
        } catch (e) {
            webApp?.showAlert('Failed to remove group');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] bg-[#F2F2F7] dark:bg-[#000000] flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 bg-[#F2F2F7] dark:bg-[#000000] flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            if (selectedGroupToAdd) setSelectedGroupToAdd(null);
                            else if (isAdding) setIsAdding(false);
                            else onClose();
                        }}
                        className="text-blue-500 flex items-center gap-1 p-2 -ml-2"
                    >
                        <ChevronLeft size={24} />
                    </button>
                </div>
                <h2 className="text-lg font-semibold text-black dark:text-white absolute left-1/2 -translate-x-1/2">
                    {selectedGroupToAdd ? 'Join Date' : (isAdding ? 'Add Group' : 'Manage Groups')}
                </h2>
                <div className="w-16"></div> {/* Spacer for centering */}
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
                            <div className="bg-white dark:bg-[#1C1C1E] rounded-xl overflow-hidden">
                                <div className="p-4 border-b border-[#C6C6C8] dark:border-[#38383A]">
                                    <span className="text-sm text-[#8E8E93] block mb-1">Group</span>
                                    <span className="text-lg font-medium text-black dark:text-white">{selectedGroupToAdd.name}</span>
                                </div>
                                <div className="p-4">
                                    <span className="text-sm text-[#8E8E93] block mb-1">Price</span>
                                    <span className="text-lg font-medium text-black dark:text-white">
                                        {selectedGroupToAdd.price ? `${selectedGroupToAdd.price.toLocaleString()} UZS` : 'Free'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#8E8E93] ml-4 uppercase">Join Date</label>
                                <div className="bg-white dark:bg-[#1C1C1E] rounded-xl overflow-hidden px-4 py-2">
                                    <input
                                        type="date"
                                        value={joinDate}
                                        onChange={(e) => setJoinDate(e.target.value)}
                                        className="w-full bg-transparent text-black dark:text-white p-2 text-lg outline-none"
                                    />
                                </div>
                                <p className="text-xs text-[#8E8E93] ml-4">
                                    Payments will be calculated starting from this date.
                                </p>
                            </div>

                            <button
                                onClick={handleAddGroup}
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl bg-blue-500 text-white font-semibold active:scale-[0.98] transition-all"
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
                            className="space-y-4"
                        >
                            <div className="bg-white dark:bg-[#1C1C1E] rounded-xl overflow-hidden">
                                {availableGroups.length > 0 ? (
                                    availableGroups.map((group, index) => (
                                        <div
                                            key={group.id}
                                            className={`flex items-center justify-between p-4 active:bg-[#E5E5EA] dark:active:bg-[#2C2C2E] transition-colors cursor-pointer ${index !== availableGroups.length - 1 ? 'border-b border-[#C6C6C8] dark:border-[#38383A]' : ''
                                                }`}
                                            onClick={() => setSelectedGroupToAdd(group)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0">
                                                    <Plus size={16} strokeWidth={3} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-black dark:text-white text-base">{group.name}</span>
                                                    <span className="text-xs text-[#8E8E93]">
                                                        {group.price ? `${group.price.toLocaleString()} UZS` : 'Free'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-[#8E8E93]">
                                        No available groups to add.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            {/* Current Groups List */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[#8E8E93] ml-4 uppercase">Current Groups</label>
                                <div className="bg-white dark:bg-[#1C1C1E] rounded-xl overflow-hidden">
                                    {currentGroups.length > 0 ? (
                                        currentGroups.map((group, index) => (
                                            <div
                                                key={group.id}
                                                className={`flex items-center justify-between p-4 ${index !== currentGroups.length - 1 ? 'border-b border-[#C6C6C8] dark:border-[#38383A]' : ''
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleRemoveGroup(group.id)}
                                                        disabled={loading}
                                                        className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0 active:scale-90 transition-transform"
                                                    >
                                                        <div className="w-3 h-0.5 bg-white rounded-full"></div> {/* Minus icon */}
                                                    </button>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-black dark:text-white text-base">{group.name}</span>
                                                        <span className="text-xs text-[#8E8E93]">
                                                            {group.price ? `${group.price.toLocaleString()} UZS` : 'Free'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-[#8E8E93]">
                                            No groups assigned.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Add Button */}
                            <div className="bg-white dark:bg-[#1C1C1E] rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setIsAdding(true)}
                                    className="w-full p-4 flex items-center gap-3 active:bg-[#E5E5EA] dark:active:bg-[#2C2C2E] transition-colors"
                                >
                                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0">
                                        <Plus size={16} strokeWidth={3} />
                                    </div>
                                    <span className="font-medium text-black dark:text-white text-base">Add Group</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminGroupManagementModal;
