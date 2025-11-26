import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { useTelegram } from '../context/TelegramContext';
import { LogOut, RefreshCw } from 'lucide-react';
import StudentDashboard from './StudentDashboard';

const GuestDashboard: React.FC = () => {
    const { user } = useTelegram();
    const { refreshData } = useAppData();
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleExit = async () => {
        if (!confirm('You will exit Guest Mode and return to Onboarding. Continue?')) return;

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/onboarding/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?.id })
            });

            if (res.ok) {
                await refreshData();
                navigate('/');
            } else {
                alert('Failed to exit. Please try again.');
            }
        } catch (e) {
            console.error('Exit error', e);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setLoading(true);
        await refreshData();
        setLoading(false);
    };

    return (
        <div className="relative min-h-screen">
            {/* Guest Mode Banner */}
            <div className="sticky top-0 z-50 bg-yellow-500 text-white px-4 py-2 text-sm font-medium text-center shadow-md flex items-center justify-between">
                <span>👀 Guest Mode: Waiting for Approval</span>
                <div className="flex gap-2">
                    <button onClick={handleRefresh} disabled={loading} className="p-1 hover:bg-white/20 rounded">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={handleExit} disabled={loading} className="p-1 hover:bg-white/20 rounded">
                        <LogOut size={16} />
                    </button>
                </div>
            </div>

            {/* Render Student Dashboard as background/preview */}
            <div className="pointer-events-none opacity-60 filter blur-[1px] select-none h-[calc(100vh-40px)] overflow-hidden">
                <StudentDashboard />
            </div>

            {/* Overlay Content */}
            <div className="absolute inset-0 top-10 flex items-center justify-center p-6 z-40 pointer-events-none">
                <div className="bg-tg-bg/90 backdrop-blur-md rounded-2xl p-6 shadow-xl max-w-sm w-full text-center pointer-events-auto border border-tg-hint/10">
                    <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                        ⏳
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-tg-text">Approval Pending</h2>
                    <p className="text-tg-hint mb-6 text-sm">
                        You are currently in Guest Mode. An administrator has been notified and will review your request shortly.
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="w-full bg-tg-button text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                            Check Status
                        </button>
                        <button
                            onClick={handleExit}
                            disabled={loading}
                            className="w-full bg-red-500/10 text-red-500 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
                        >
                            <LogOut size={18} />
                            Exit Guest Mode
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuestDashboard;
