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
        { name: 'Leaderboard', icon: Trophy, path: '/student/leaderboard' },
        { name: 'Profile', icon: User, path: '/student/profile' },
    ];

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50">
            <div className="flex items-center justify-between gap-1.5 rounded-full bg-tg-bg/95 p-1.5 shadow-lg backdrop-blur-md border border-tg-hint/5">
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path;
                    return (
                        <motion.button
                            key={tab.name}
                            onClick={() => navigate(tab.path)}
                            className={cn(
                                "relative flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 px-3 overflow-hidden",
                                isActive ? "text-tg-button-text" : "text-tg-hint"
                            )}
                            whileTap={{ scale: 0.92 }}
                            transition={{ duration: 0.1 }}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="navPill"
                                    className="absolute inset-0 bg-tg-button rounded-full"
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 30,
                                        mass: 0.8
                                    }}
                                />
                            )}

                            <motion.div
                                className="relative z-10 flex items-center gap-1.5"
                                animate={{
                                    scale: isActive ? 1 : 0.9,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 25
                                }}
                            >
                                <tab.icon size={18} strokeWidth={2.5} />

                                <AnimatePresence mode="wait">
                                    {isActive && (
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.8, width: 0 }}
                                            animate={{ opacity: 1, scale: 1, width: "auto" }}
                                            exit={{ opacity: 0, scale: 0.8, width: 0 }}
                                            transition={{
                                                duration: 0.2,
                                                ease: [0.4, 0.0, 0.2, 1]
                                            }}
                                            className="text-xs font-semibold whitespace-nowrap"
                                        >
                                            {tab.name}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
