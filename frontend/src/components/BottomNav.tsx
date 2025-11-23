import React from 'react';
import { Home, Trophy, User, Map } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { name: 'Home', icon: Home, path: '/student' },
        { name: 'Journey', icon: Map, path: '/student/journey' },
        { name: 'Ranks', icon: Trophy, path: '/student/leaderboard' },
        { name: 'Profile', icon: User, path: '/student/profile' },
    ];

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50">
            <div className="relative flex items-center justify-between gap-1 rounded-full bg-tg-secondary/80 backdrop-blur-xl p-1.5 shadow-2xl border border-tg-hint/10">
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path;
                    return (
                        <button
                            key={tab.name}
                            onClick={() => navigate(tab.path)}
                            className={cn(
                                "relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 px-2 min-w-0 transition-colors duration-200",
                                isActive ? "text-tg-button-text" : "text-tg-hint"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeNavPill"
                                    className="absolute inset-0 bg-tg-button/90 backdrop-blur-sm rounded-full shadow-lg"
                                    transition={{
                                        type: "spring",
                                        stiffness: 380,
                                        damping: 32,
                                        mass: 0.6
                                    }}
                                />
                            )}

                            <div className="relative z-10 flex items-center gap-1 min-w-0">
                                <tab.icon size={18} strokeWidth={2.5} className="flex-shrink-0" />

                                <AnimatePresence mode="wait">
                                    {isActive && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: "auto" }}
                                            exit={{ opacity: 0, width: 0 }}
                                            transition={{ duration: 0.15 }}
                                            className="text-[11px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[55px]"
                                        >
                                            {tab.name}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
