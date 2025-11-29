import React, { useState, useEffect } from 'react';
import { useTelegram } from '../../context/TelegramContext';
import { Section } from '../../components/ui/Section';
import { Send, Clock, Users, BookOpen, User } from 'lucide-react';
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
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [groups, setGroups] = useState<any[]>([]);
    const [history, setHistory] = useState<BroadcastHistory[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        webApp.BackButton.show();
        webApp.BackButton.onClick(() => window.history.back());
        return () => {
            webApp.BackButton.offClick(() => window.history.back());
        };
    }, [webApp]);

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

    const handleSend = async () => {
        if (!message.trim()) return;
        if (targetType === 'group' && !selectedGroupId) return;

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/broadcast`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    target_type: targetType,
                    target_id: targetType === 'group' ? selectedGroupId : null,
                    sender_id: webApp.initDataUnsafe?.user?.id // Ideally handled by auth middleware
                })
            });

            if (res.ok) {
                const data = await res.json();
                webApp.showAlert(`Broadcast sent to ${data.count} recipients!`);
                setMessage('');
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

    return (
        <div className="min-h-screen bg-tg-secondary pb-20 pt-4">
            <h1 className="text-2xl font-bold mb-6 px-4 text-tg-text">Broadcasting</h1>

            {/* Tabs */}
            <div className="px-4 mb-6">
                <div className="bg-tg-bg p-1 rounded-xl flex">
                    <button
                        onClick={() => setActiveTab('compose')}
                        className={cn(
                            "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                            activeTab === 'compose' ? "bg-tg-button text-white shadow-sm" : "text-tg-hint hover:text-tg-text"
                        )}
                    >
                        Compose
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={cn(
                            "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                            activeTab === 'history' ? "bg-tg-button text-white shadow-sm" : "text-tg-hint hover:text-tg-text"
                        )}
                    >
                        History
                    </button>
                </div>
            </div>

            {activeTab === 'compose' ? (
                <div className="px-4 space-y-6">
                    {/* Target Selection */}
                    <Section title="Target Audience">
                        <div className="grid grid-cols-2 gap-3 p-4">
                            <button
                                onClick={() => setTargetType('all_students')}
                                className={cn(
                                    "p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                                    targetType === 'all_students' ? "border-tg-button bg-tg-button/5" : "border-transparent bg-tg-secondary"
                                )}
                            >
                                <Users className={targetType === 'all_students' ? "text-tg-button" : "text-tg-hint"} />
                                <span className="text-xs font-medium text-tg-text">All Students</span>
                            </button>
                            <button
                                onClick={() => setTargetType('all_teachers')}
                                className={cn(
                                    "p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                                    targetType === 'all_teachers' ? "border-tg-button bg-tg-button/5" : "border-transparent bg-tg-secondary"
                                )}
                            >
                                <User className={targetType === 'all_teachers' ? "text-tg-button" : "text-tg-hint"} />
                                <span className="text-xs font-medium text-tg-text">All Teachers</span>
                            </button>
                            <button
                                onClick={() => setTargetType('all_admins')}
                                className={cn(
                                    "p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                                    targetType === 'all_admins' ? "border-tg-button bg-tg-button/5" : "border-transparent bg-tg-secondary"
                                )}
                            >
                                <User className={targetType === 'all_admins' ? "text-tg-button" : "text-tg-hint"} />
                                <span className="text-xs font-medium text-tg-text">All Admins</span>
                            </button>
                            <button
                                onClick={() => setTargetType('group')}
                                className={cn(
                                    "p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                                    targetType === 'group' ? "border-tg-button bg-tg-button/5" : "border-transparent bg-tg-secondary"
                                )}
                            >
                                <BookOpen className={targetType === 'group' ? "text-tg-button" : "text-tg-hint"} />
                                <span className="text-xs font-medium text-tg-text">Specific Group</span>
                            </button>
                        </div>

                        {targetType === 'group' && (
                            <div className="px-4 pb-4">
                                <select
                                    value={selectedGroupId}
                                    onChange={(e) => setSelectedGroupId(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-tg-secondary text-tg-text border-none outline-none focus:ring-2 focus:ring-tg-button"
                                >
                                    <option value="">Select a group...</option>
                                    {groups.map(g => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </Section>

                    {/* Message Input */}
                    <Section title="Message">
                        <div className="p-4">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your broadcast message here..."
                                className="w-full h-32 bg-tg-secondary text-tg-text p-3 rounded-xl resize-none border-none outline-none focus:ring-2 focus:ring-tg-button placeholder:text-tg-hint"
                            />
                        </div>
                    </Section>

                    {/* Send Button */}
                    <button
                        onClick={handleSend}
                        disabled={loading || !message.trim() || (targetType === 'group' && !selectedGroupId)}
                        className="w-full bg-tg-button text-white py-4 rounded-xl font-semibold shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Send size={20} />
                                <span>Send Broadcast</span>
                            </>
                        )}
                    </button>
                </div>
            ) : (
                <div className="px-4 space-y-4">
                    {history.length > 0 ? (
                        history.map(item => (
                            <div key={item.id} className="bg-tg-bg p-4 rounded-xl shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-medium px-2 py-1 rounded-lg bg-tg-secondary text-tg-hint uppercase">
                                        {item.target_type.replace('_', ' ')}
                                    </span>
                                    <span className="text-xs text-tg-hint flex items-center gap-1">
                                        <Clock size={12} />
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-tg-text text-sm mb-3 whitespace-pre-wrap">{item.message}</p>
                                <div className="flex justify-between items-center text-xs text-tg-hint border-t border-tg-secondary/50 pt-2">
                                    <span>Sent by: {item.sender ? `${item.sender.first_name} ${item.sender.surname}` : 'Unknown'}</span>
                                    <span>Recipients: {item.recipient_count}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-tg-hint">
                            No broadcast history found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminBroadcast;
