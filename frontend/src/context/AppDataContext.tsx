import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useTelegram } from './TelegramContext';
import type { JourneyData } from '../types/journey.types';
import { mockService } from '../services/mockData';

interface DashboardData {
    user: {
        id: string;
        first_name: string;
        onboarding_first_name?: string;
        last_name?: string;
        role: string;
        student_id?: string;
        sex?: 'male' | 'female' | null;
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
    lessons: any[];
    homework: any[];
    subjects: any[];
    groups?: any[];
}

interface TeacherData {
    groups: {
        id: string;
        name: string;
        student_count: number;
        next_class: string;
    }[];
    stats: {
        total_students: number;
        active_groups: number;
        upcoming_exams_count: number;
    };
    schedule: {
        id: string;
        title: string;
        group: string;
        time: string;
        location: string;
        date: Date;
    }[];
    messages: {
        group_id: string;
        messages: {
            id: string;
            sender: string;
            text: string;
            time: string;
            is_me: boolean;
        }[];
    }[];
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
    student_name?: string; // For teacher view if needed
}

interface SalaryRecord {
    id: string;
    date: string;
    amount: number;
    status: 'paid' | 'pending';
    description: string;
}

interface AttendanceRecord {
    id: string;
    date: string;
    status: 'present' | 'absent' | 'late';
    subject: string;
}

interface ParentData {
    parent: {
        id: string;
        first_name: string;
        last_name?: string;
    };
    children: any[];
}

interface AdminRequest {
    id: string;
    user_id: string;
    status: 'pending' | 'approved' | 'declined';
    created_at: string;
    users?: {
        first_name: string;
        onboarding_first_name?: string;
        last_name?: string;
        username?: string;
        telegram_id?: string;
    };
}

interface AppDataContextType {
    dashboardData: DashboardData | null;
    teacherData: TeacherData | null;
    parentData: ParentData | null;
    leaderboardData: LeaderboardData | null;
    achievementsData: AchievementsData | null;
    journeyData: JourneyData | null;
    paymentHistory: PaymentRecord[];
    salaryHistory: SalaryRecord[];
    attendanceHistory: AttendanceRecord[];
    adminRequests: AdminRequest[];
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
    const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
    const [parentData, _setParentData] = useState<ParentData | null>(null);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
    const [achievementsData, setAchievementsData] = useState<AchievementsData | null>(null);
    const [journeyData, setJourneyData] = useState<JourneyData | null>(null);
    const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([]);

    // Mock Data for History
    const [paymentHistory] = useState<PaymentRecord[]>([
        { id: '1', date: '2023-11-01', amount: 150000, status: 'paid', description: 'Monthly Tuition - November' },
        { id: '2', date: '2023-10-01', amount: 150000, status: 'paid', description: 'Monthly Tuition - October' },
        { id: '3', date: '2023-09-01', amount: 150000, status: 'paid', description: 'Monthly Tuition - September' },
        { id: '3', date: '2023-09-01', amount: 150000, status: 'paid', description: 'Monthly Tuition - September' },
    ]);

    const [salaryHistory] = useState<SalaryRecord[]>([
        { id: '1', date: '2023-11-05', amount: 5000000, status: 'paid', description: 'Salary - October' },
        { id: '2', date: '2023-10-05', amount: 5000000, status: 'paid', description: 'Salary - September' },
        { id: '3', date: '2023-09-05', amount: 4800000, status: 'paid', description: 'Salary - August' },
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
        // If no user is logged in (e.g. initial load before role selection), we might want to wait or do nothing.
        // But for the Welcome Page to work, we might not need data yet.
        // However, once a user is set in TelegramContext, we should fetch data.

        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Simulate Login
            await mockService.login(user);

            // Determine role based on the user object (which comes from mockData via WelcomePage)
            // In our mock setup, the 'user' object from TelegramContext will already have the role if we set it from WelcomePage.
            // Or we can just fetch everything based on the role property.

            const role = user.role || 'student'; // Default to student if not specified

            // Fetch Dashboard Data
            if (role === 'student') {
                const studentData = await mockService.getStudentDashboard();
                setDashboardData(studentData as any);

                const journey = await mockService.getJourneyData();
                setJourneyData(journey as any);
            } else if (role === 'teacher') {
                const teacherInfo = await mockService.getTeacherData();
                setTeacherData(teacherInfo as any);
                // Also set basic dashboard data for user info
                setDashboardData({ user: user } as any);
            } else if (role === 'admin') {
                const adminInfo = await mockService.getAdminData();
                // We might need to map adminInfo to dashboardData or specific admin context
                setDashboardData({ user: user } as any);
                setAdminRequests(adminInfo.requests as any);
            } else if (role === 'parent') {
                setDashboardData({ user: user } as any);
                // Fetch parent data...
            }

            // Common Data
            setLeaderboardData({
                leaderboard: [
                    { rank: 1, score: 2850, users: { first_name: 'Sarah', last_name: 'J.' } },
                    { rank: 2, score: 2720, users: { first_name: 'Mike', last_name: 'T.' } },
                    { rank: 3, score: 2680, users: { first_name: 'Emma', last_name: 'W.' } },
                ],
                user_rank: { rank: 42, score: 1250 }
            });

            setAchievementsData({
                achievements: [],
                stats: { total: 10, unlocked: 3, total_points: 150 }
            });

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
        teacherData,
        parentData,
        leaderboardData,
        achievementsData,
        journeyData,
        paymentHistory,
        salaryHistory,
        attendanceHistory,
        adminRequests,
        loading,
        error,
        refreshData: fetchAllData,
    };

    return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};
