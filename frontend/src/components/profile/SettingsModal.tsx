import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTelegram } from '../../context/TelegramContext';
import { Section } from '../ui/Section';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { User, Bell, Shield, Globe, LogOut, ChevronRight, Check } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Language = 'en' | 'ru' | 'uz';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { webApp, user } = useTelegram();
    const [language, setLanguage] = useState<Language>('en');
    const [activeSubPage, setActiveSubPage] = useState<'main' | 'language' | 'account'>('main');

    // Handle Back Button
    useEffect(() => {
        if (isOpen) {
            webApp.BackButton.show();

            const handleBack = () => {
                if (activeSubPage !== 'main') {
                    setActiveSubPage('main');
                } else {
                    onClose();
                }
            };

            webApp.BackButton.onClick(handleBack);

            return () => {
                webApp.BackButton.offClick(handleBack);
                if (!isOpen) {
                    webApp.BackButton.hide();
                }
            };
        } else {
            webApp.BackButton.hide();
        }
    }, [isOpen, activeSubPage, onClose, webApp]);

    const languages: { code: Language; name: string; native: string }[] = [
        { code: 'en', name: 'English', native: 'English' },
        { code: 'ru', name: 'Russian', native: 'Русский' },
        { code: 'uz', name: 'Uzbek', native: 'O\'zbek' },
    ];

    const pageVariants = {
        initial: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0
        }),
        animate: {
            x: 0,
            opacity: 1,
            transition: {
                x: { stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
            }
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 100 : -100,
            opacity: 0,
            transition: {
                x: { stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
            }
        })
    };

    const [direction, setDirection] = useState(0);

    const navigateTo = (page: 'main' | 'language' | 'account') => {
        setDirection(1);
        setActiveSubPage(page);
    };

    const navigateBack = () => {
        setDirection(-1);
        setActiveSubPage('main');
    };

    const renderMainSettings = () => (
        <motion.div
            key="main"
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6 absolute w-full left-0 px-4"
        >
            <Section title="Account">
                <div className="space-y-2">
                    <Card
                        className="flex items-center justify-between p-3 cursor-pointer active:opacity-70 transition-opacity"
                        onClick={() => navigateTo('account')}
                    >
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-tg-button" />
                            <span>Edit Profile</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-tg-hint/50" />
                    </Card>
                    <Card className="flex items-center justify-between p-3 cursor-pointer active:opacity-70 transition-opacity">
                        <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-tg-button" />
                            <span>Notifications</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-tg-hint/50" />
                    </Card>
                    <Card className="flex items-center justify-between p-3 cursor-pointer active:opacity-70 transition-opacity">
                        <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-tg-button" />
                            <span>Privacy & Security</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-tg-hint/50" />
                    </Card>
                    <Card
                        className="flex items-center justify-between p-3 cursor-pointer active:opacity-70 transition-opacity"
                        onClick={() => navigateTo('language')}
                    >
                        <div className="flex items-center gap-3">
                            <Globe className="h-5 w-5 text-tg-button" />
                            <div className="flex flex-col">
                                <span>Language</span>
                                <span className="text-xs text-tg-hint">{languages.find(l => l.code === language)?.name}</span>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-tg-hint/50" />
                    </Card>
                </div>
            </Section>

            <Section title="App Info">
                <Card className="p-3">
                    <p className="text-sm text-tg-hint">Version 1.0.0</p>
                    <p className="text-xs text-tg-hint mt-1">Education Center Bot</p>
                </Card>
            </Section>

            <div className="mt-8">
                <Button variant="destructive" className="w-full flex items-center justify-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Log Out
                </Button>
            </div>
        </motion.div>
    );

    const renderLanguageSettings = () => (
        <motion.div
            key="language"
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-4 absolute w-full left-0 px-4"
        >
            <Section title="Choose Language">
                <div className="space-y-2">
                    {languages.map((lang) => (
                        <Card
                            key={lang.code}
                            className="flex items-center justify-between p-4 cursor-pointer active:opacity-70 transition-opacity"
                            onClick={() => setLanguage(lang.code)}
                        >
                            <div className="flex flex-col">
                                <span className="font-medium">{lang.name}</span>
                                <span className="text-xs text-tg-hint">{lang.native}</span>
                            </div>
                            {language === lang.code && (
                                <Check className="h-5 w-5 text-tg-button" />
                            )}
                        </Card>
                    ))}
                </div>
            </Section>
        </motion.div>
    );

    const renderAccountSettings = () => (
        <motion.div
            key="account"
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-4 absolute w-full left-0 px-4"
        >
            <Section title="Personal Information">
                <div className="space-y-3">
                    <div className="space-y-1">
                        <label className="text-xs text-tg-hint ml-4 uppercase">First Name</label>
                        <Card className="p-3">
                            {user?.first_name || 'User'}
                        </Card>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-tg-hint ml-4 uppercase">Last Name</label>
                        <Card className="p-3">
                            {user?.last_name || 'Not set'}
                        </Card>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-tg-hint ml-4 uppercase">Username</label>
                        <Card className="p-3">
                            @{user?.username || 'username'}
                        </Card>
                    </div>
                </div>
            </Section>
            <p className="text-xs text-tg-hint px-6 text-center">
                To change your personal details, please edit your Telegram profile.
            </p>
        </motion.div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
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
                        <div className="w-full h-1.5 bg-tg-hint/20 rounded-full w-12 mx-auto mt-3 mb-2" />

                        <header className="mb-2 flex items-center justify-center relative h-12 shrink-0">
                            {activeSubPage !== 'main' && (
                                <button
                                    onClick={navigateBack}
                                    className="absolute left-4 text-tg-button flex items-center gap-1"
                                >
                                    <ChevronRight className="h-6 w-6 rotate-180" />
                                    Back
                                </button>
                            )}
                            <h1 className="text-lg font-semibold">
                                {activeSubPage === 'main' && 'Settings'}
                                {activeSubPage === 'language' && 'Language'}
                                {activeSubPage === 'account' && 'Edit Profile'}
                            </h1>
                            {activeSubPage !== 'main' && (
                                <div className="absolute right-4 w-16" /> /* Spacer for centering */
                            )}
                        </header>

                        <div className="flex-1 overflow-y-auto relative">
                            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                                {activeSubPage === 'main' && renderMainSettings()}
                                {activeSubPage === 'language' && renderLanguageSettings()}
                                {activeSubPage === 'account' && renderAccountSettings()}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SettingsModal;
