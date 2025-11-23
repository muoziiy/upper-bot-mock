import React from 'react';
import { Home, Trophy, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center justify-between gap-2 rounded-full bg-tg-bg/95 p-2 shadow-lg backdrop-blur-sm border border-tg-hint/10"
            >
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path;
                    return (
                        <motion.button
                            key={tab.name}
                            onClick={() => navigate(tab.path)}
                            className={cn(
                                "relative flex flex-1 items-center justify-center gap-2 rounded-full py-3 px-4 overflow-hidden",
                                isActive ? "text-tg-button-text" : "text-tg-hint"
                            )}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-tg-button rounded-full shadow-md"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}

                            <motion.div
                                className="relative z-10"
                                animate={{
                                    scale: isActive ? 1.1 : 1,
                                    rotate: isActive ? [0, -10, 10, 0] : 0
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                <tab.icon size={20} />
                            </motion.div>

                            <AnimatePresence mode="wait">
                                {isActive && (
                                    <motion.span
                                        key="label"
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "auto" }}
                                        exit={{ opacity: 0, width: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="relative z-10 text-sm font-medium whitespace-nowrap"
                                    >
                                        {tab.name}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    );
                })}
            </motion.div>
        </div>
    );
};

export default BottomNav;
