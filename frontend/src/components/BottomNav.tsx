import React from 'react';
import { Home, Trophy, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { name: 'Home', icon: Home, path: '/student' },
        { name: 'Leaderboard', icon: Trophy, path: '/student/leaderboard' },
        { name: 'Profile', icon: User, path: '/student/profile' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-tg-hint/10 bg-tg-bg pb-safe">
            <div className="flex justify-around">
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path;
                    return (
                        <button
                            key={tab.name}
                            onClick={() => navigate(tab.path)}
                            className="flex flex-1 flex-col items-center justify-center space-y-1 py-2"
                        >
                            <tab.icon
                                size={24}
                                className={cn(
                                    "transition-colors",
                                    isActive ? "text-tg-button" : "text-tg-hint"
                                )}
                            />
                            <span
                                className={cn(
                                    "text-[10px] font-medium transition-colors",
                                    isActive ? "text-tg-button" : "text-tg-hint"
                                )}
                            >
                                {tab.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
