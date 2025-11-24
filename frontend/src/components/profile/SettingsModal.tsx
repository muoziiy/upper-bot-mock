import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Globe, User } from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';
import { useTranslation } from 'react-i18next';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { user, webApp } = useTelegram();
    const [activePage, setActivePage] = useState<'main' | 'language' | 'account'>('main');
    const [direction, setDirection] = useState(0);
    const { t, i18n } = useTranslation();

    const navigateTo = (page: 'main' | 'language' | 'account') => {
        setDirection(page === 'main' ? -1 : 1);
        setActivePage(page);
        if (page !== 'main') {
            webApp.BackButton.show();
            webApp.BackButton.onClick(() => {
                setDirection(-1);
                setActivePage('main');
                webApp.BackButton.hide();
            });
        } else {
            webApp.BackButton.hide();
        }
    };

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
        setDirection(-1);
        setActivePage('main');
        webApp.BackButton.hide();
    };

    const pageVariants = {
        initial: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0
        }),
        animate: {
            x: 0,
            opacity: 1,
            transition: {
                x: { type: "spring" as const, stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
            }
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 100 : -100,
            opacity: 0,
            transition: {
                x: { type: "spring" as const, stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
            }
        })
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute bottom-0 left-0 right-0 h-[90vh] bg-tg-secondary rounded-t-[20px] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <div className="w-8">
                        {/* Native Back Button is used instead */}
                    </div>
                    <h2 className="text-lg font-semibold text-tg-text">
                        {activePage === 'main' ? t('settings.title') :
                            activePage === 'language' ? t('settings.language') : t('settings.account')}
                    </h2>
                    <button onClick={onClose} className="w-8 flex justify-end text-tg-hint">
                        <div className="bg-tg-button/10 rounded-full p-1">
                            <X size={20} />
                        </div>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto relative">
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                        {activePage === 'main' && (
                            <motion.div
                                key="main"
                                custom={direction}
                                variants={pageVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="space-y-6 absolute w-full left-0 px-4 py-4"
                            >
                                {/* Language Section */}
                                <div className="bg-tg-bg rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => navigateTo('language')}
                                        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-orange-500/10 p-2 rounded-lg text-orange-500">
                                                <Globe size={20} />
                                            </div>
                                            <span className="text-tg-text">{t('settings.language')}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-tg-hint text-sm uppercase">{i18n.language}</span>
                                            <ChevronRight size={20} className="text-tg-hint/50" />
                                        </div>
                                    </button>
                                </div>

                                {/* Account Section */}
                                <div className="bg-tg-bg rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => navigateTo('account')}
                                        className="w-full flex items-center justify-between p-4 border-b border-tg-secondary/50 hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500">
                                                <User size={20} />
                                            </div>
                                            <span className="text-tg-text">{t('settings.account')}</span>
                                        </div>
                                        <ChevronRight size={20} className="text-tg-hint/50" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {activePage === 'language' && (
                            <motion.div
                                key="language"
                                custom={direction}
                                variants={pageVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="space-y-2 absolute w-full left-0 px-4 py-4"
                            >
                                {[
                                    { code: 'en', name: 'English', flag: '🇬🇧' },
                                    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
                                    { code: 'uz', name: 'O\'zbek', flag: '🇺🇿' }
                                ].map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => changeLanguage(lang.code)}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${i18n.language === lang.code
                                            ? 'bg-tg-button text-tg-button-text shadow-md'
                                            : 'bg-tg-bg text-tg-text hover:bg-white/5'
                                            }`}
                                    >
                                        <span className="font-medium flex items-center gap-3">
                                            <span className="text-xl">{lang.flag}</span>
                                            {lang.name}
                                        </span>
                                        {i18n.language === lang.code && (
                                            <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                                        )}
                                    </button>
                                ))}
                            </motion.div>
                        )}

                        {activePage === 'account' && (
                            <motion.div
                                key="account"
                                custom={direction}
                                variants={pageVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="space-y-4 absolute w-full left-0 px-4 py-4"
                            >
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-xs text-tg-hint ml-4 uppercase">First Name</label>
                                        <div className="bg-tg-bg p-3 rounded-xl text-tg-text">
                                            {user?.first_name || 'User'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-tg-hint ml-4 uppercase">Last Name</label>
                                        <div className="bg-tg-bg p-3 rounded-xl text-tg-text">
                                            {user?.last_name || 'Not set'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-tg-hint ml-4 uppercase">Username</label>
                                        <div className="bg-tg-bg p-3 rounded-xl text-tg-text">
                                            @{user?.username || 'username'}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-tg-hint px-6 text-center mt-4">
                                    To change your personal details, please edit your Telegram profile.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SettingsModal;
