import React from 'react';
import { Home, Trophy, User, Map, Users, Plus, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useTelegram } from '../context/TelegramContext';
import { useAppData } from '../context/AppDataContext';
import { useTranslation } from 'react-i18next';

const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { webApp } = useTelegram();
    const { dashboardData } = useAppData();
    const { t } = useTranslation();

    const themeColor = webApp.themeParams?.button_color || '#3390ec';
    const role = dashboardData?.user.role || 'student';

    const studentTabs = [
        { name: t('nav.home'), icon: Home, path: '/student' },
        { name: t('nav.journey'), icon: Map, path: '/student/journey' },
        { name: t('nav.ranks'), icon: Trophy, path: '/student/leaderboard' },
        { name: t('nav.profile'), icon: User, path: '/student/profile' },
    ];

    const teacherTabs = [
        { name: t('nav.home'), icon: Home, path: '/teacher' },
        { name: t('nav.groups'), icon: Users, path: '/teacher/groups' },
        { name: t('nav.actions'), icon: Plus, path: '/teacher/actions' },
        { name: t('nav.profile'), icon: User, path: '/teacher/profile' },
    ];

    const adminTabs = [
        { name: t('nav.home'), icon: Home, path: '/admin' },
        { name: t('nav.actions'), icon: Settings, path: '/admin/actions' },
        { name: t('nav.profile'), icon: User, path: '/admin/profile' },
    ];

    const tabs = role === 'teacher' ? teacherTabs : (role === 'admin' || role === 'super_admin' ? adminTabs : studentTabs);

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50">
            <div className="relative flex items-center justify-between gap-1 rounded-full bg-tg-secondary/90 backdrop-blur-xl p-1.5 border border-white/5">
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path;
                    return (
                        <button
                            key={tab.name}
                            onClick={() => navigate(tab.path)}
                            className={cn(
                                "relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 px-2 min-w-0 transition-colors duration-200",
                                isActive ? "font-medium" : "text-tg-hint"
                            )}
                            style={isActive ? { color: themeColor } : {}}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeNavPill"
                                    className="absolute inset-0 backdrop-blur-xl rounded-full border border-white/10"
                                    style={{ backgroundColor: `${themeColor}33` }} // 20% opacity (approx 33 in hex)
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
