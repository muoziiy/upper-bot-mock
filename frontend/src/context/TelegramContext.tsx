import React, { createContext, useContext, useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';

interface TelegramContextType {
    webApp: typeof WebApp;
    user: any;
    setUser: (user: any) => void;
    initData: string;
    startParam: string;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [startParam, setStartParam] = useState<string>('');

    useEffect(() => {
        WebApp.ready();
        if (WebApp.initDataUnsafe.user) {
            setUser(WebApp.initDataUnsafe.user);
        }
        if (WebApp.initDataUnsafe.start_param) {
            setStartParam(WebApp.initDataUnsafe.start_param);
        }
        // Expand to full height
        WebApp.expand();
    }, []);

    return (
        <TelegramContext.Provider value={{ webApp: WebApp, user, setUser, initData: WebApp.initData, startParam }}>
            {children}
        </TelegramContext.Provider>
    );
};

export const useTelegram = () => {
    const context = useContext(TelegramContext);
    if (context === undefined) {
        throw new Error('useTelegram must be used within a TelegramProvider');
    }
    return context;
};
