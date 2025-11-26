import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useTelegram } from '../context/TelegramContext';
import { LogOut } from 'lucide-react';

const GuestDashboard: React.FC = () => {
    const { user } = useTelegram();
    const { refreshData } = useAppData();
    const [loading, setLoading] = useState(false);

    const handleExit = async () => {
        if (!confirm('Are you sure you want to exit Guest Mode? You will need to register again.')) return;

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/onboarding/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?.id })
            });

            if (res.ok) {
                await refreshData();
            } else {
                alert('Failed to exit. Please try again.');
            }
        } catch (e) {
            console.error('Exit error', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-tg-secondary relative flex flex-col items-center justify-center p-4">
            {/* Persistent Popup */}
            <div className="bg-tg-bg rounded-2xl p-6 shadow-lg max-w-sm w-full text-center z-10">
                <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                    ⏳
                </div>
                <h2 className="text-xl font-bold mb-2 text-tg-text">Waiting for Approval</h2>
                <p className="text-tg-hint mb-6">
                    Please wait while an administrator reviews your registration. You will be notified once approved.
                </p>

                <button
                    onClick={handleExit}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors mx-auto"
                >
                    <LogOut size={18} />
                    <span>{loading ? 'Exiting...' : 'Exit Guest Mode'}</span>
                </button>
            </div>

            {/* Blurred Background Content (Simulated) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none flex flex-col gap-4 p-4 overflow-hidden">
                <div className="h-32 bg-tg-bg rounded-xl w-full"></div>
                <div className="h-20 bg-tg-bg rounded-xl w-full"></div>
                <div className="h-40 bg-tg-bg rounded-xl w-full"></div>
            </div>
        </div>
    );
};

export default GuestDashboard;
