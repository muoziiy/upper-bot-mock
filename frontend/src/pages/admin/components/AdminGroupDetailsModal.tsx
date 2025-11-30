import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegram } from '../../../context/TelegramContext';
import { Trash2, CreditCard, Calendar, Settings } from 'lucide-react';
import AdminPaymentModal from './AdminPaymentModal';

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
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/students/${studentId}/groups`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupId: group.id, action: 'update_date', joinedAt: joinDate })
            });

            if (res.ok) {
                webApp.showPopup({ title: 'Success', message: 'Join date updated', buttons: [{ type: 'ok' }] });
                onUpdate();
            } else {
                throw new Error('Failed');
            }
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
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/students/${studentId}/groups`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ groupId: group.id })
                    });

                    if (res.ok) {
                        webApp.showPopup({ title: 'Success', message: 'Group removed', buttons: [{ type: 'ok' }] });
                        onUpdate();
                        onClose();
                    } else {
                        throw new Error('Failed');
                    }
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
            <div className="fixed inset-0 z-[60] bg-tg-bg flex flex-col">
                {/* Header */}
                <div className="px-4 py-3 border-b border-tg-hint/10 flex items-center justify-between bg-tg-bg">
                    <h2 className="text-lg font-semibold text-tg-text">
                        {group.name}
                    </h2>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setShowPaymentModal(true)}
                            className="flex flex-col items-center justify-center p-4 bg-tg-secondary rounded-xl border border-tg-hint/10 active:scale-95 transition-transform"
                        >
                            <CreditCard className="text-tg-button mb-2" size={24} />
                            <span className="text-sm font-medium text-tg-text">Payment Info</span>
                        </button>
                        <button
                            onClick={handleRemoveGroup}
                            disabled={loading}
                            className="flex flex-col items-center justify-center p-4 bg-tg-secondary rounded-xl border border-tg-hint/10 active:scale-95 transition-transform"
                        >
                            <Trash2 className="text-red-500 mb-2" size={24} />
                            <span className="text-sm font-medium text-tg-text">Remove Group</span>
                        </button>
                    </div>

                    {/* Settings */}
                    <div className="space-y-4">
                        <h3 className="text-md font-semibold text-tg-text flex items-center gap-2">
                            <Settings size={18} /> Settings
                        </h3>

                        <div className="bg-tg-secondary p-4 rounded-xl border border-tg-hint/10 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-tg-hint ml-1">Join Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tg-hint" size={18} />
                                    <input
                                        type="date"
                                        value={joinDate}
                                        onChange={(e) => setJoinDate(e.target.value)}
                                        className="w-full bg-tg-bg text-tg-text pl-11 p-3 rounded-lg border-none outline-none focus:ring-2 focus:ring-tg-button/20"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleUpdateJoinDate}
                                disabled={loading}
                                className="w-full py-3 rounded-lg bg-tg-button text-white font-semibold text-sm active:scale-[0.98] transition-all"
                            >
                                Update Date
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Payment Modal */}
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
