import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useTelegram } from './TelegramContext';
import type { JourneyData } from '../types/journey.types';

interface DashboardData {
    user: {
        id: string;
        first_name: string;
        last_name?: string;
        role: string;
    };
    streak: {
        current_streak: number;
        longest_streak: number;
        total_active_days: number;
    };
    total_stats: {
        total_study_minutes: number;
        total_tests: number;
        total_questions: number;
    };
    average_score: number;
    upcoming_exams: any[];
}

interface LeaderboardData {
    leaderboard: any[];
    user_rank: any;
}

interface AchievementsData {
    achievements: any;
    stats: {
        total: number;
        unlocked: number;
        total_points: number;
    };
}

interface PaymentRecord {
    id: string;
    date: string;
    amount: number;
    status: 'paid' | 'pending' | 'overdue';
    description: string;
}

interface AttendanceRecord {
    id: string;
    date: string;
    status: 'present' | 'absent' | 'late';
    subject: string;
}

interface AppDataContextType {
    dashboardData: DashboardData | null;
    leaderboardData: LeaderboardData | null;
    achievementsData: AchievementsData | null;
    journeyData: JourneyData | null;
    paymentHistory: PaymentRecord[];
    attendanceHistory: AttendanceRecord[];
    loading: boolean;
    error: string | null;
    refreshData: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const useAppData = () => {
    const context = useContext(AppDataContext);
    if (!context) {
        throw new Error('useAppData must be used within AppDataProvider');
    }
    return context;
};

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useTelegram();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
    const [achievementsData, setAchievementsData] = useState<AchievementsData | null>(null);
    const [journeyData, setJourneyData] = useState<JourneyData | null>(null);

    // Mock Data for History
    const [paymentHistory] = useState<PaymentRecord[]>([
        { id: '1', date: '2023-11-01', amount: 150000, status: 'paid', description: 'Monthly Tuition - November' },
        { id: '2', date: '2023-10-01', amount: 150000, status: 'paid', description: 'Monthly Tuition - October' },
        { id: '3', date: '2023-09-01', amount: 150000, status: 'paid', description: 'Monthly Tuition - September' },
    ]);

    const [attendanceHistory] = useState<AttendanceRecord[]>([
        { id: '1', date: '2023-11-20', status: 'present', subject: 'Mathematics' },
        { id: '2', date: '2023-11-18', status: 'present', subject: 'Physics' },
        { id: '3', date: '2023-11-15', status: 'absent', subject: 'Mathematics' },
        { id: '4', date: '2023-11-13', status: 'late', subject: 'English' },
        { id: '5', date: '2023-11-10', status: 'present', subject: 'Physics' },
    ]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAllData = async () => {
        if (!user?.id) return;

        setLoading(true);
        setError(null);

        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const headers = { 'x-user-id': user.id.toString() };

            const [dashboardRes, leaderboardRes, achievementsRes, journeyRes] = await Promise.all([
                fetch(`${apiUrl}/students/dashboard`, { headers }),
                fetch(`${apiUrl}/leaderboard?category=global&period=all-time&limit=50`, { headers }),
                fetch(`${apiUrl}/students/achievements`, { headers }),
                fetch(`${apiUrl}/students/journey`, { headers }),
            ]);

            if (dashboardRes.ok) {
                const data = await dashboardRes.json();
                setDashboardData(data);
            }

            if (leaderboardRes.ok) {
                const data = await leaderboardRes.json();
                setLeaderboardData(data);
            }

            if (achievementsRes.ok) {
                const data = await achievementsRes.json();
                setAchievementsData(data);
            }

            if (journeyRes.ok) {
                const data = await journeyRes.json();
                setJourneyData(data);
            }
        } catch (err) {
            console.error('Failed to fetch app data:', err);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [user]);

    const value: AppDataContextType = {
        dashboardData,
        leaderboardData,
        achievementsData,
        journeyData,
        paymentHistory,
        attendanceHistory,
        loading,
        error,
        refreshData: fetchAllData,
    };

    return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};
