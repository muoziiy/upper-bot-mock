import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Globe, User } from 'lucide-react';
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

    // Handle native back button
    // Handle native back button visibility
    useEffect(() => {
        if (isOpen) {
            webApp.BackButton.show();
        } else {
            webApp.BackButton.hide();
        }

        return () => {
            if (!isOpen) {
                webApp.BackButton.hide();
            }
        };
    }, [isOpen, webApp]);

    // Handle native back button click
    useEffect(() => {
        if (!isOpen) return;

        const handleBack = () => {
            if (activePage !== 'main') {
                setDirection(-1);
                setActivePage('main');
            } else {
                onClose();
            }
        };

        webApp.BackButton.onClick(handleBack);

        return () => {
            webApp.BackButton.offClick(handleBack);
        };
    }, [isOpen, activePage, onClose, webApp]);

    // Reset to main page when modal opens
    useEffect(() => {
        if (isOpen) {
            setActivePage('main');
        }
    }, [isOpen]);

    const navigateTo = (page: 'main' | 'language' | 'account') => {
        setDirection(page === 'main' ? -1 : 1);
        setActivePage(page);
    };

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
        setDirection(-1);
        setActivePage('main');
    };

    const pageVariants = {
        initial: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0
        }),
        animate: {
            x: 0,
            opacity: 1,
            transition: {
                type: 'spring' as const,
                stiffness: 300,
                damping: 30
            }
        },
        exit: (direction: number) => ({
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 300,
                damping: 30
            }
        })
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/30"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="absolute inset-0 bg-tg-secondary flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-center p-4 border-b border-tg-secondary/50 bg-tg-bg/50">
                        <h2 className="text-lg font-semibold text-tg-text">
                            {activePage === 'main' ? t('settings.title') :
                                activePage === 'language' ? t('settings.language') : t('settings.account')}
                        </h2>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden relative">
                        <AnimatePresence initial={false} custom={direction} mode="popLayout">
                            {activePage === 'main' && (
                                <motion.div
                                    key="main"
                                    custom={direction}
                                    variants={pageVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    className="absolute inset-0 overflow-y-auto px-4 py-6 space-y-4"
                                >
                                    {/* Language Section */}
                                    <div>
                                        <p className="text-xs text-tg-hint uppercase font-medium mb-2 px-4">
                                            {t('settings.preferences')}
                                        </p>
                                        <div className="bg-tg-bg rounded-xl overflow-hidden shadow-sm">
                                            <button
                                                onClick={() => navigateTo('language')}
                                                className="w-full flex items-center justify-between p-4 hover:bg-tg-secondary/30 active:bg-tg-secondary/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-tg-button/10 p-2 rounded-lg">
                                                        <Globe size={20} className="text-tg-button" />
                                                    </div>
                                                    <span className="text-tg-text font-medium">{t('settings.language')}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-tg-hint text-sm uppercase">{i18n.language}</span>
                                                    <ChevronRight size={20} className="text-tg-hint" />
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Account Section */}
                                    <div>
                                        <p className="text-xs text-tg-hint uppercase font-medium mb-2 px-4">
                                            {t('settings.account')}
                                        </p>
                                        <div className="bg-tg-bg rounded-xl overflow-hidden shadow-sm">
                                            <button
                                                onClick={() => navigateTo('account')}
                                                className="w-full flex items-center justify-between p-4 hover:bg-tg-secondary/30 active:bg-tg-secondary/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-tg-accent/10 p-2 rounded-lg">
                                                        <User size={20} className="text-tg-accent" />
                                                    </div>
                                                    <span className="text-tg-text font-medium">{t('settings.account_info')}</span>
                                                </div>
                                                <ChevronRight size={20} className="text-tg-hint" />
                                            </button>
                                        </div>
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
                                    className="absolute inset-0 overflow-y-auto px-4 py-6 space-y-2"
                                >
                                    {[
                                        { code: 'en', name: 'English', flag: '🇬🇧' },
                                        { code: 'ru', name: 'Русский', flag: '🇷🇺' },
                                        { code: 'uz', name: 'O\'zbek', flag: '🇺🇿' }
                                    ].map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => changeLanguage(lang.code)}
                                            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all shadow-sm ${i18n.language === lang.code
                                                ? 'bg-tg-button text-tg-button-text'
                                                : 'bg-tg-bg text-tg-text hover:bg-tg-secondary/30 active:bg-tg-secondary/50'
                                                }`}
                                        >
                                            <span className="font-medium flex items-center gap-3">
                                                <span className="text-2xl">{lang.flag}</span>
                                                <span>{lang.name}</span>
                                            </span>
                                            {i18n.language === lang.code && (
                                                <div className="w-2 h-2 rounded-full bg-tg-button-text" />
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
                                    className="absolute inset-0 overflow-y-auto px-4 py-6"
                                >
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs text-tg-hint ml-4 uppercase font-medium">
                                                {t('settings.first_name')}
                                            </label>
                                            <div className="bg-tg-bg p-4 rounded-xl text-tg-text shadow-sm">
                                                {user?.first_name || 'User'}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-tg-hint ml-4 uppercase font-medium">
                                                {t('settings.last_name')}
                                            </label>
                                            <div className="bg-tg-bg p-4 rounded-xl text-tg-text shadow-sm">
                                                {user?.last_name || 'Not set'}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-tg-hint ml-4 uppercase font-medium">
                                                {t('settings.username')}
                                            </label>
                                            <div className="bg-tg-bg p-4 rounded-xl text-tg-text shadow-sm">
                                                @{user?.username || 'username'}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-tg-hint text-center mt-6 px-4 leading-relaxed">
                                        {t('settings.edit_profile_note')}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SettingsModal;
