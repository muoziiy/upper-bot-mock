import React, { useEffect } from 'react';
import { useTelegram } from '../../context/TelegramContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface ParentAccountSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ParentAccountSettingsModal: React.FC<ParentAccountSettingsModalProps> = ({ isOpen, onClose }) => {
    const { t, i18n } = useTranslation();
    const { user, webApp } = useTelegram();

    useEffect(() => {
        if (isOpen && webApp) {
            webApp.BackButton.show();
            webApp.BackButton.onClick(onClose);

            return () => {
                webApp.BackButton.hide();
                webApp.BackButton.offClick(onClose);
            };
        }
    }, [isOpen, webApp, onClose]);

    const languages = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'ru', name: 'Русский', flag: '🇷🇺' },
        { code: 'uz', name: 'O\'zbekcha', flag: '🇺🇿' }
    ];

    const handleLanguageChange = (langCode: string) => {
        i18n.changeLanguage(langCode);
    };

    const handleLogout = () => {
        webApp?.showPopup({
            title: t('parent.logout_confirm'),
            message: t('parent.logout_message'),
            buttons: [
                { type: 'cancel' },
                { type: 'destructive', id: 'logout', text: t('parent.logout') }
            ]
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 500 }}
                        className="fixed inset-x-0 bottom-0 bg-tg-bg rounded-t-3xl z-[60] max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-tg-bg border-b border-tg-hint/10 px-4 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-tg-text">{t('settings.title')}</h2>
                        </div>

                        <div className="p-4 space-y-6">
                            {/* Language Section */}
                            <div>
                                <h3 className="text-sm font-medium text-tg-hint uppercase mb-3">
                                    {t('settings.language')}
                                </h3>
                                <div className="space-y-2">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => handleLanguageChange(lang.code)}
                                            className={`w-full p-4 rounded-xl flex items-center justify-between transition-colors ${i18n.language === lang.code
                                                ? 'bg-tg-button/10 border-2 border-tg-button'
                                                : 'bg-tg-secondary/50 border-2 border-transparent hover:bg-tg-secondary'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{lang.flag}</span>
                                                <span className="font-medium text-tg-text">{lang.name}</span>
                                            </div>
                                            {i18n.language === lang.code && (
                                                <div className="w-6 h-6 rounded-full bg-tg-button flex items-center justify-center">
                                                    <span className="text-white text-sm">✓</span>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Account Information */}
                            <div>
                                <h3 className="text-sm font-medium text-tg-hint uppercase mb-3">
                                    {t('settings.account_info')}
                                </h3>
                                <div className="bg-tg-secondary/50 rounded-xl p-4 space-y-3">
                                    <div>
                                        <p className="text-xs text-tg-hint mb-1">{t('settings.first_name')}</p>
                                        <p className="text-tg-text font-medium">{user?.first_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-tg-hint mb-1">{t('settings.last_name')}</p>
                                        <p className="text-tg-text font-medium">{user?.last_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-tg-hint mb-1">{t('settings.username')}</p>
                                        <p className="text-tg-text font-medium">@{user?.username || 'N/A'}</p>
                                    </div>
                                    <p className="text-xs text-tg-hint italic pt-2 border-t border-tg-hint/10">
                                        {t('settings.edit_profile_note')}
                                    </p>
                                </div>
                            </div>

                            {/* App Info */}
                            <div>
                                <h3 className="text-sm font-medium text-tg-hint uppercase mb-3">
                                    {t('parent.app')}
                                </h3>
                                <div className="bg-tg-secondary/50 rounded-xl p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-tg-hint">{t('parent.version')}</span>
                                        <span className="text-tg-text font-medium">1.0.0</span>
                                    </div>
                                </div>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="w-full bg-red-500/10 text-red-500 rounded-xl p-4 font-medium hover:bg-red-500/20 active:bg-red-500/30 transition-colors"
                            >
                                {t('parent.log_out')}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ParentAccountSettingsModal;
