import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../../context/TelegramContext';
import { AdminSection } from './components/AdminSection';
import { AdminListItem } from './components/AdminListItem';
import { Send, Clock, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BroadcastHistory {
    id: string;
    message: string;
    target_type: string;
    recipient_count: number;
    created_at: string;
    sender?: {
        first_name: string;
        surname: string;
    };
}

const AdminBroadcast: React.FC = () => {
    const { webApp } = useTelegram();
    const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
    const [message, setMessage] = useState('');
    const [targetType, setTargetType] = useState<'all_students' | 'all_teachers' | 'all_admins' | 'group'>('all_students');
    const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduledDate, setScheduledDate] = useState('');
    const [groups, setGroups] = useState<any[]>([]);
    const [history, setHistory] = useState<BroadcastHistory[]>([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        webApp.BackButton.show();
        const handleBack = () => navigate(-1);
        webApp.BackButton.onClick(handleBack);
        return () => {
            webApp.BackButton.offClick(handleBack);
            webApp.BackButton.hide();
        };
    }, [webApp, navigate]);

    useEffect(() => {
        fetchGroups();
        fetchHistory();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/groups/list`);
            if (res.ok) {
                const data = await res.json();
                setGroups(data);
            }
        } catch (e) {
            console.error('Failed to fetch groups', e);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/broadcast/history`);
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (e) {
            console.error('Failed to fetch history', e);
        }
    };

    const handleGroupToggle = (groupId: string) => {
        setSelectedGroupIds(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    const handleSend = async () => {
        if (!message.trim()) return;
        if (targetType === 'group' && selectedGroupIds.length === 0) return;
        if (isScheduled && !scheduledDate) return;

        setLoading(true);
        try {
            const payload: any = {
                message,
                sender_id: webApp.initDataUnsafe?.user?.id
            };

            if (targetType === 'group') {
                payload.group_ids = selectedGroupIds;
            } else if (targetType === 'all_students') {
                payload.group_ids = ['all'];
            } else if (targetType === 'all_teachers') {
                payload.group_ids = ['all_teachers'];
            } else if (targetType === 'all_admins') {
                payload.group_ids = ['all_admins'];
            }

            if (isScheduled) {
                payload.scheduled_at = new Date(scheduledDate).toISOString();
            }

            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/broadcast`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                if (data.message === 'Broadcast scheduled') {
                    webApp.showAlert('Broadcast scheduled successfully!');
                } else {
                    webApp.showAlert(`Broadcast sent to ${data.sent} recipients!`);
                }
                setMessage('');
                setSelectedGroupIds([]);
                setIsScheduled(false);
                setScheduledDate('');
                fetchHistory();
                setActiveTab('history');
            } else {
                webApp.showAlert('Failed to send broadcast');
            }
        } catch (e) {
            console.error('Failed to send broadcast', e);
            webApp.showAlert('Error sending broadcast');
        } finally {
            setLoading(false);
        }
    };

    const Toggle = ({ checked }: { checked: boolean }) => (
        <div className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-green-500' : 'bg-[#E9E9EA] dark:bg-[#39393D]'} relative`}>
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] pb-20 pt-4">
            <h1 className="text-3xl font-bold mb-6 px-4 text-black dark:text-white">Broadcasting</h1>

            {/* Tabs */}
            <div className="px-4 mb-6">
                <div className="bg-[#E3E3E8] dark:bg-[#1C1C1E] p-1 rounded-[10px] flex">
                    <button
                        onClick={() => setActiveTab('compose')}
                        className={cn(
                            "flex-1 py-1.5 text-[13px] font-medium rounded-[7px] transition-all",
                            activeTab === 'compose' ? "bg-white dark:bg-[#636366] text-black dark:text-white shadow-sm" : "text-[#8E8E93]"
                        )}
                    >
                        Compose
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={cn(
                            "flex-1 py-1.5 text-[13px] font-medium rounded-[7px] transition-all",
                            activeTab === 'history' ? "bg-white dark:bg-[#636366] text-black dark:text-white shadow-sm" : "text-[#8E8E93]"
                        )}
                    >
                        History
                    </button>
                </div>
            </div>

            {activeTab === 'compose' ? (
                <div className="space-y-6">
                    {/* Target Selection */}
                    <AdminSection title="Target Audience">
                        <AdminListItem
                            title="All Students"
                            icon="👥"
                            iconColor="bg-blue-500"
                            rightElement={targetType === 'all_students' ? <Check className="text-blue-500" size={20} /> : null}
                            onClick={() => setTargetType('all_students')}
                        />
                        <AdminListItem
                            title="All Teachers"
                            icon="👨‍🏫"
                            iconColor="bg-orange-500"
                            rightElement={targetType === 'all_teachers' ? <Check className="text-blue-500" size={20} /> : null}
                            onClick={() => setTargetType('all_teachers')}
                        />
                        <AdminListItem
                            title="All Admins"
                            icon="🛡️"
                            iconColor="bg-red-500"
                            rightElement={targetType === 'all_admins' ? <Check className="text-blue-500" size={20} /> : null}
                            onClick={() => setTargetType('all_admins')}
                        />
                        <AdminListItem
                            title="Specific Groups"
                            icon="📚"
                            iconColor="bg-purple-500"
                            rightElement={targetType === 'group' ? <Check className="text-blue-500" size={20} /> : null}
                            onClick={() => setTargetType('group')}
                            isLast={targetType !== 'group'}
                        />
                    </AdminSection>

                    {targetType === 'group' && (
                        <AdminSection title="Select Groups">
                            <div className="max-h-60 overflow-y-auto">
                                {groups.map((g, idx) => (
                                    <AdminListItem
                                        key={g.id}
                                        title={g.name}
                                        icon="👥"
                                        iconColor="bg-gray-400"
                                        rightElement={
                                            <div className={cn(
                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                                                selectedGroupIds.includes(g.id) ? "border-blue-500 bg-blue-500" : "border-[#C7C7CC] dark:border-[#48484A]"
                                            )}>
                                                {selectedGroupIds.includes(g.id) && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                        }
                                        onClick={() => handleGroupToggle(g.id)}
                                        isLast={idx === groups.length - 1}
                                    />
                                ))}
                            </div>
                        </AdminSection>
                    )}

                    {/* Scheduling */}
                    <AdminSection title="Schedule">
                        <AdminListItem
                            title="Schedule for later"
                            icon="📅"
                            iconColor="bg-green-500"
                            rightElement={<Toggle checked={isScheduled} />}
                            onClick={() => setIsScheduled(!isScheduled)}
                            isLast={!isScheduled}
                        />
                        {isScheduled && (
                            <div className="p-4 bg-white dark:bg-[#1C1C1E]">
                                <input
                                    type="datetime-local"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    className="w-full p-3 rounded-[10px] bg-[#E3E3E8] dark:bg-[#2C2C2E] text-black dark:text-white border-none outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>
                        )}
                    </AdminSection>

                    {/* Message Input */}
                    <AdminSection title="Message">
                        <div className="p-4 bg-white dark:bg-[#1C1C1E]">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your broadcast message here..."
                                className="w-full h-32 bg-[#E3E3E8] dark:bg-[#2C2C2E] text-black dark:text-white p-3 rounded-[10px] resize-none border-none outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-[#8E8E93]"
                            />
                            <div className="mt-2 text-xs text-[#8E8E93] flex gap-4">
                                <span><b>*bold*</b></span>
                                <span><i>_italic_</i></span>
                                <span><span className="font-mono">`monospace`</span></span>
                            </div>
                        </div>
                    </AdminSection>

                    {/* Send Button */}
                    <div className="px-4">
                        <button
                            onClick={handleSend}
                            disabled={loading || !message.trim() || (targetType === 'group' && selectedGroupIds.length === 0) || (isScheduled && !scheduledDate)}
                            className="w-full bg-blue-500 text-white py-3.5 rounded-[10px] font-semibold shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isScheduled ? <Clock size={20} /> : <Send size={20} />}
                                    <span>{isScheduled ? 'Schedule Broadcast' : 'Send Broadcast'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="px-4 space-y-4">
                    {history.length > 0 ? (
                        history.map(item => (
                            <div key={item.id} className="bg-white dark:bg-[#1C1C1E] p-4 rounded-[10px] shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-medium px-2 py-1 rounded-md bg-[#E3E3E8] dark:bg-[#2C2C2E] text-[#8E8E93] uppercase">
                                        {item.target_type.replace('_', ' ')}
                                    </span>
                                    <span className="text-xs text-[#8E8E93] flex items-center gap-1">
                                        <Clock size={12} />
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-black dark:text-white text-sm mb-3 whitespace-pre-wrap">{item.message}</p>
                                <div className="flex justify-between items-center text-xs text-[#8E8E93] border-t border-[#C6C6C8] dark:border-[#38383A] pt-2">
                                    <span>Sent by: {item.sender ? `${item.sender.first_name} ${item.sender.surname}` : 'Unknown'}</span>
                                    <span>Recipients: {item.recipient_count}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-[#8E8E93]">
                            No broadcast history found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminBroadcast;
