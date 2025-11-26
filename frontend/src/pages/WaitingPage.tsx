import React from 'react';
import { Clock } from 'lucide-react';

const WaitingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-tg-secondary flex flex-col items-center justify-center p-4 text-center">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 text-blue-500">
                <Clock size={40} />
            </div>
            <h1 className="text-2xl font-bold mb-3 text-tg-text">Request Pending</h1>
            <p className="text-tg-hint max-w-xs">
                Your request is currently being reviewed by our administrators. Please check back later or contact support if this takes too long.
            </p>
        </div>
    );
};

export default WaitingPage;
