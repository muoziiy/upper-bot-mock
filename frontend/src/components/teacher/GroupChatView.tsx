import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowLeft } from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';

interface Message {
    id: string;
    sender: string;
    text: string;
    time: string;
    is_me: boolean;
}

interface GroupChatViewProps {
    group: any;
    onBack: () => void;
    messages: Message[];
}

const GroupChatView: React.FC<GroupChatViewProps> = ({ group, onBack, messages: initialMessages }) => {
    const { webApp } = useTelegram();
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        webApp.BackButton.show();
        webApp.BackButton.onClick(onBack);
        return () => {
            webApp.BackButton.offClick(onBack);
        };
    }, [webApp, onBack]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!newMessage.trim()) return;

        const msg: Message = {
            id: Date.now().toString(),
            sender: 'You',
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            is_me: true
        };

        setMessages([...messages, msg]);
        setNewMessage('');
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[70] bg-tg-bg flex flex-col"
        >
            {/* Header */}
            <div className="bg-tg-secondary/95 backdrop-blur-xl border-b border-tg-secondary/50 px-4 py-3 flex items-center gap-3 z-10">
                <button onClick={onBack} className="text-tg-button">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-tg-text">{group.name}</h1>
                    <p className="text-xs text-tg-hint">{group.student_count} members</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex flex-col ${msg.is_me ? 'items-end' : 'items-start'}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-2xl ${msg.is_me
                                ? 'bg-tg-button text-tg-button-text rounded-tr-none'
                                : 'bg-tg-secondary text-tg-text rounded-tl-none'
                                }`}
                        >
                            {!msg.is_me && (
                                <p className="text-xs font-bold mb-1 opacity-70">{msg.sender}</p>
                            )}
                            <p className="text-sm">{msg.text}</p>
                            <p className={`text-[10px] mt-1 text-right ${msg.is_me ? 'text-white/70' : 'text-tg-hint'}`}>
                                {msg.time}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-tg-secondary border-t border-tg-hint/10">
                <div className="px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/10">
                    <p className="text-[10px] text-yellow-600 text-center leading-tight">
                        ⚠️ Note: Messages are sent via Telegram bot to all group members and cannot be undone.
                    </p>
                </div>
                <div className="p-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            className="flex-1 bg-tg-bg text-tg-text px-4 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-tg-button/50 placeholder-tg-hint"
                        />
                        <button
                            onClick={handleSend}
                            className="w-10 h-10 rounded-full bg-tg-button text-tg-button-text flex items-center justify-center hover:opacity-90 transition-opacity"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default GroupChatView;
