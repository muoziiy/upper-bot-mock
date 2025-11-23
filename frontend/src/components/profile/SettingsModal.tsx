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

    const renderMainSettings = () => (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <Section title="Account">
                <div className="space-y-2">
                    <Card
                        className="flex items-center justify-between p-3 cursor-pointer active:scale-95 transition-transform"
                        onClick={() => setActiveSubPage('account')}
                    >
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-tg-hint" />
                            <span>Edit Profile</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-tg-hint" />
                    </Card>
                    <Card className="flex items-center justify-between p-3 cursor-pointer active:scale-95 transition-transform">
                        <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-tg-hint" />
                            <span>Notifications</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-tg-hint" />
                    </Card>
                    <Card className="flex items-center justify-between p-3 cursor-pointer active:scale-95 transition-transform">
                        <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-tg-hint" />
                            <span>Privacy & Security</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-tg-hint" />
                    </Card>
                    <Card
                        className="flex items-center justify-between p-3 cursor-pointer active:scale-95 transition-transform"
                        onClick={() => setActiveSubPage('language')}
                    >
                        <div className="flex items-center gap-3">
                            <Globe className="h-5 w-5 text-tg-hint" />
                            <div className="flex flex-col">
                                <span>Language</span>
                                <span className="text-xs text-tg-hint">{languages.find(l => l.code === language)?.name}</span>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-tg-hint" />
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
        >
            <Section title="Choose Language">
                <div className="space-y-2">
                    {languages.map((lang) => (
                        <Card
                            key={lang.code}
                            className="flex items-center justify-between p-4 cursor-pointer active:scale-95 transition-transform"
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
        >
            <Section title="Personal Information">
                <div className="space-y-3">
                    <div className="space-y-1">
                        <label className="text-xs text-tg-hint ml-1">First Name</label>
                        <Card className="p-3">
                            {user?.first_name || 'User'}
                        </Card>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-tg-hint ml-1">Last Name</label>
                        <Card className="p-3">
                            {user?.last_name || 'Not set'}
                        </Card>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-tg-hint ml-1">Username</label>
                        <Card className="p-3">
                            @{user?.username || 'username'}
                        </Card>
                    </div>
                </div>
            </Section>
            <p className="text-xs text-tg-hint px-2 text-center">
                To change your personal details, please edit your Telegram profile.
            </p>
        </motion.div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: '100%' }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-50 bg-tg-secondary overflow-y-auto"
                >
                    <div className="min-h-screen pb-24 pt-4 px-4 text-tg-text">
                        <header className="mb-6 flex items-center justify-center relative">
                            <h1 className="text-xl font-bold">
                                {activeSubPage === 'main' && 'Settings'}
                                {activeSubPage === 'language' && 'Language'}
                                {activeSubPage === 'account' && 'Edit Profile'}
                            </h1>
                        </header>

                        {activeSubPage === 'main' && renderMainSettings()}
                        {activeSubPage === 'language' && renderLanguageSettings()}
                        {activeSubPage === 'account' && renderAccountSettings()}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SettingsModal;
