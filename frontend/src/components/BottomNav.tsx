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
        <div className="fixed bottom-4 left-4 right-4 z-50">
            <div className="flex items-center justify-between gap-2 rounded-full bg-tg-bg/95 p-2 shadow-lg backdrop-blur-sm">
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path;
                    return (
                        <button
                            key={tab.name}
                            onClick={() => navigate(tab.path)}
                            className={cn(
                                "flex flex-1 items-center justify-center gap-2 rounded-full py-3 px-4 transition-all duration-300",
                                isActive
                                    ? "bg-tg-button text-tg-button-text shadow-md"
                                    : "text-tg-hint hover:bg-tg-secondary/50"
                            )}
                        >
                            <tab.icon
                                size={20}
                                className={cn("transition-transform duration-300", isActive && "scale-110")}
                            />
                            {isActive && (
                                <span className="text-sm font-medium">
                                    {tab.name}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
