import React, { useState } from 'react';
import { X, Send, AlertTriangle, Lightbulb } from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
    supportInfo: {
        admin_profile_link?: string;
        admin_phone?: string;
        working_hours?: string;
        location_link?: string;
        location_text?: string;
    } | null;
}

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose, supportInfo }) => {
    const { user } = useTelegram();
    const [reportMode, setReportMode] = useState<'none' | 'problem' | 'suggestion'>('none');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!message.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/support/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user?.id, // Assuming user context has DB id, otherwise need to fetch or use telegram_id
                    type: reportMode,
                    message
                })
            });

            if (res.ok) {
                alert('Report sent successfully!');
                setReportMode('none');
                setMessage('');
                onClose();
            } else {
                alert('Failed to send report');
            }
        } catch (e) {
            console.error('Error sending report', e);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-[#F2F2F7] dark:bg-[#1C1C1E] w-full max-w-md rounded-[20px] overflow-hidden shadow-xl animate-slide-up">
                {/* Header */}
                <div className="bg-white dark:bg-[#2C2C2E] p-4 flex items-center justify-between border-b border-[#E5E5EA] dark:border-[#38383A]">
                    <h2 className="text-lg font-bold text-black dark:text-white">
                        {reportMode !== 'none' ? (reportMode === 'problem' ? 'Report a Problem' : 'Make a Suggestion') : 'Support & Info'}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full bg-[#E5E5EA] dark:bg-[#3A3A3C] text-[#8E8E93]">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {reportMode === 'none' ? (
                        <>
                            {/* Contact Info */}
                            <div className="bg-white dark:bg-[#2C2C2E] rounded-[14px] overflow-hidden">
                                {supportInfo?.admin_profile_link && (
                                    <a href={supportInfo.admin_profile_link} target="_blank" rel="noopener noreferrer" className="block p-3 border-b border-[#E5E5EA] dark:border-[#38383A] active:bg-[#E5E5EA] dark:active:bg-[#3A3A3C]">
                                        <div className="text-sm font-medium text-black dark:text-white">Contact Admin</div>
                                        <div className="text-xs text-[#8E8E93]">Telegram</div>
                                    </a>
                                )}
                                {supportInfo?.admin_phone && (
                                    <a href={`tel:${supportInfo.admin_phone}`} className="block p-3 border-b border-[#E5E5EA] dark:border-[#38383A] active:bg-[#E5E5EA] dark:active:bg-[#3A3A3C]">
                                        <div className="text-sm font-medium text-black dark:text-white">Call Support</div>
                                        <div className="text-xs text-[#8E8E93]">{supportInfo.admin_phone}</div>
                                    </a>
                                )}
                                {supportInfo?.working_hours && (
                                    <div className="p-3 border-b border-[#E5E5EA] dark:border-[#38383A]">
                                        <div className="text-sm font-medium text-black dark:text-white">Working Hours</div>
                                        <div className="text-xs text-[#8E8E93]">{supportInfo.working_hours}</div>
                                    </div>
                                )}
                                {supportInfo?.location_text && (
                                    <a href={supportInfo.location_link || '#'} target="_blank" rel="noopener noreferrer" className="block p-3 active:bg-[#E5E5EA] dark:active:bg-[#3A3A3C]">
                                        <div className="text-sm font-medium text-black dark:text-white">Location</div>
                                        <div className="text-xs text-[#8E8E93]">{supportInfo.location_text}</div>
                                    </a>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setReportMode('problem')}
                                    className="bg-red-500/10 active:bg-red-500/20 p-4 rounded-[14px] flex flex-col items-center justify-center gap-2 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <span className="text-sm font-medium text-red-500">Report Problem</span>
                                </button>
                                <button
                                    onClick={() => setReportMode('suggestion')}
                                    className="bg-blue-500/10 active:bg-blue-500/20 p-4 rounded-[14px] flex flex-col items-center justify-center gap-2 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                        <Lightbulb size={20} />
                                    </div>
                                    <span className="text-sm font-medium text-blue-500">Suggestion</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={reportMode === 'problem' ? "Describe the issue you're facing..." : "Share your idea..."}
                                className="w-full h-32 bg-white dark:bg-[#2C2C2E] text-black dark:text-white p-3 rounded-[14px] border-none resize-none focus:ring-2 focus:ring-blue-500/50 focus:outline-none placeholder:text-[#8E8E93]"
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setReportMode('none')}
                                    className="flex-1 py-3 bg-[#E5E5EA] dark:bg-[#3A3A3C] text-black dark:text-white rounded-[14px] font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !message.trim()}
                                    className="flex-1 py-3 bg-blue-500 text-white rounded-[14px] font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Sending...' : (
                                        <>
                                            <span>Send</span>
                                            <Send size={16} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupportModal;
