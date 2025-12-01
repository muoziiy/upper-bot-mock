import React, { useState, useEffect } from 'react';
import { useTelegram } from '../../../context/TelegramContext';
import { Trash2, CreditCard, ChevronLeft } from 'lucide-react';
import AdminPaymentModal from './AdminPaymentModal';
import { mockService } from '../../../services/mockData';

interface Group {
    id: string;
    name: string;
    price: number;
    joined_at?: string;
}

interface AdminGroupDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    studentName: string;
    group: Group | null;
    onUpdate: () => void;
}

const AdminGroupDetailsModal: React.FC<AdminGroupDetailsModalProps> = ({
    isOpen,
    onClose,
    studentId,
    studentName,
    group,
    onUpdate
}) => {
    const { webApp } = useTelegram();
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [joinDate, setJoinDate] = useState('');

    // Initialize join date
    useEffect(() => {
        if (group?.joined_at) {
            setJoinDate(group.joined_at.split('T')[0]);
        }
    }, [group]);

    // Handle Native Back Button
    useEffect(() => {
        if (isOpen && !showPaymentModal) {
            webApp.BackButton.show();
            const handleBack = () => onClose();
            webApp.BackButton.onClick(handleBack);
            return () => {
                webApp.BackButton.offClick(handleBack);
                // Only hide if we are the top modal (simplified logic)
                if (!showPaymentModal) webApp.BackButton.hide();
            };
        }
    }, [isOpen, showPaymentModal, onClose, webApp]);

    const handleUpdateJoinDate = async () => {
        if (!group || !joinDate) return;
        setLoading(true);
        try {
            await mockService.updateStudentGroups(studentId, {
                groupId: group.id,
                action: 'update_date',
                joinedAt: joinDate
            });
            webApp.showPopup({ title: 'Success', message: 'Join date updated', buttons: [{ type: 'ok' }] });
            onUpdate();
        } catch (e) {
            webApp.showAlert('Failed to update join date');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveGroup = async () => {
        if (!group) return;
        webApp.showConfirm(`Are you sure you want to remove ${studentName} from ${group.name}?`, async (confirm) => {
            if (confirm) {
                setLoading(true);
                try {
                    await mockService.updateStudentGroups(studentId, {
                        groupId: group.id,
                        action: 'remove'
                    });
                    webApp.showPopup({ title: 'Success', message: 'Group removed', buttons: [{ type: 'ok' }] });
                    onUpdate();
                    onClose();
                } catch (e) {
                    webApp.showAlert('Failed to remove group');
                } finally {
                    setLoading(false);
                }
            }
        });
    };
    if (!isOpen || !group) return null;

    return (
        <>
            <div className="fixed inset-0 z-[60] bg-[#F2F2F7] dark:bg-[#000000] flex flex-col">
                {/* Header */}
                <div className="px-4 py-3 bg-[#F2F2F7] dark:bg-[#000000] flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="text-blue-500 flex items-center gap-1 p-2 -ml-2"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    </div>
                    <h2 className="text-lg font-semibold text-black dark:text-white absolute left-1/2 -translate-x-1/2">
                        {group.name}
                    </h2>
                    <div className="w-16"></div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-[#1C1C1E] rounded-xl active:scale-95 transition-transform shadow-sm"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                                <CreditCard className="text-blue-500" size={24} />
                            </div>
                            <span className="text-sm font-medium text-black dark:text-white">Payment Info</span>
                        </button>
                        <button
                            onClick={handleRemoveGroup}
                            disabled={loading}
                            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-[#1C1C1E] rounded-xl active:scale-95 transition-transform shadow-sm"
                        >
                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
                                <Trash2 className="text-red-500" size={24} />
                            </div>
                            <span className="text-sm font-medium text-red-500">Remove Group</span>
                        </button>
                    </div>

                    {/* Settings */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[#8E8E93] ml-4 uppercase">Settings</label>
                        <div className="bg-white dark:bg-[#1C1C1E] rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-[#C6C6C8] dark:border-[#38383A]">
                                <span className="text-sm text-[#8E8E93] block mb-1">Join Date</span>
                                <input
                                    type="date"
                                    value={joinDate}
                                    onChange={(e) => setJoinDate(e.target.value)}
                                    className="w-full bg-transparent text-black dark:text-white text-lg outline-none"
                                />
                            </div>
                            <button
                                onClick={handleUpdateJoinDate}
                                disabled={loading}
                                className="w-full p-4 text-center text-blue-500 font-medium active:bg-[#E5E5EA] dark:active:bg-[#2C2C2E] transition-colors"
                            >
                                {loading ? 'Updating...' : 'Update Date'}
                            </button>
                        </div>
                        <p className="text-xs text-[#8E8E93] ml-4">
                            Payments will be calculated starting from this date.
                        </p>
                    </div>

                </div>
            </div>

            <AdminPaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                studentId={studentId}
                studentName={studentName}
                groups={[group]} // Only pass this group
                defaultGroupId={group.id}
            />
        </>
    );
};

export default AdminGroupDetailsModal;
