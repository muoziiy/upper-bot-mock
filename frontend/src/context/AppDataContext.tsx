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

interface AppDataContextType {
    dashboardData: DashboardData | null;
    teacherData: TeacherData | null;
    leaderboardData: LeaderboardData | null;
    achievementsData: AchievementsData | null;
    journeyData: JourneyData | null;
    paymentHistory: PaymentRecord[];
    salaryHistory: SalaryRecord[];
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
    const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
    const [achievementsData, setAchievementsData] = useState<AchievementsData | null>(null);
    const [journeyData, setJourneyData] = useState<JourneyData | null>(null);

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
        if (!user?.id) return;

        setLoading(true);
        setError(null);

        try {
            const apiUrl = import.meta.env.VITE_API_URL;
            const headers = {
                'x-user-id': user.id.toString(),
                'Content-Type': 'application/json'
            };

            // Sync user data (Login)
            await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers,
                body: JSON.stringify(user)
            });

            const [dashboardRes, leaderboardRes, achievementsRes] = await Promise.all([
                fetch(`${apiUrl}/students/dashboard`, { headers }),
                fetch(`${apiUrl}/leaderboard?category=global&period=all-time&limit=50`, { headers }),
                fetch(`${apiUrl}/students/achievements`, { headers }),
                fetch(`${apiUrl}/students/journey`, { headers }),
            ]);

            if (dashboardRes.ok) {
                const data = await dashboardRes.json();
                setDashboardData(data);
            }

            // Mock Teacher Data (Injecting it always for now to support development)
            setTeacherData({
                groups: [
                    { id: 'g1', name: 'Mathematics 101', student_count: 24, next_class: 'Today, 14:00' },
                    { id: 'g2', name: 'Physics Advanced', student_count: 18, next_class: 'Tomorrow, 10:00' },
                    { id: 'g3', name: 'Geometry Basics', student_count: 30, next_class: 'Wed, 16:00' },
                ],
                stats: {
                    total_students: 72,
                    active_groups: 3,
                    upcoming_exams_count: 2,
                }
            });

            if (leaderboardRes.ok) {
                // const data = await leaderboardRes.json();
                // setLeaderboardData(data);
                setLeaderboardData({
                    leaderboard: [
                        { rank: 1, score: 2850, users: { first_name: 'Sarah', last_name: 'J.' } },
                        { rank: 2, score: 2720, users: { first_name: 'Mike', last_name: 'T.' } },
                        { rank: 3, score: 2680, users: { first_name: 'Emma', last_name: 'W.' } },
                    ],
                    user_rank: { rank: 42, score: 1250 }
                });
            } else {
                // Fallback mock data if fetch fails (or just always use it for now as requested)
                setLeaderboardData({
                    leaderboard: [
                        { rank: 1, score: 2850, users: { first_name: 'Sarah', last_name: 'J.' } },
                        { rank: 2, score: 2720, users: { first_name: 'Mike', last_name: 'T.' } },
                        { rank: 3, score: 2680, users: { first_name: 'Emma', last_name: 'W.' } },
                    ],
                    user_rank: { rank: 42, score: 1250 }
                });
            }

            if (achievementsRes.ok) {
                const data = await achievementsRes.json();
                setAchievementsData(data);
            }

            // Mock Journey Data
            setJourneyData({
                userLevel: {
                    user_id: user.id.toString(),
                    current_level: 'intermediate',
                    progress_percentage: 65,
                    level_started_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                curriculum: [],
                lessons: [
                    {
                        id: 'l1',
                        curriculum_id: 'c1',
                        title: 'Advanced Grammar Structures',
                        description: 'Master complex sentence structures and nuances.',
                        content: 'Lesson content here...',
                        duration_minutes: 45,
                        topics: ['Conditionals', 'Inversion', 'Subjunctive'],
                        order_index: 1,
                        is_active: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        status: 'completed',
                        progress: {
                            id: 'p1',
                            user_id: user.id.toString(),
                            lesson_id: 'l1',
                            is_completed: true,
                            completion_date: new Date().toISOString(),
                            time_spent_minutes: 50,
                            notes: 'Great lesson!',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }
                    },
                    {
                        id: 'l2',
                        curriculum_id: 'c1',
                        title: 'Business Communication',
                        description: 'Learn how to communicate effectively in a professional setting.',
                        content: 'Lesson content here...',
                        duration_minutes: 60,
                        topics: ['Emails', 'Meetings', 'Negotiations'],
                        order_index: 2,
                        is_active: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        status: 'unlocked',
                        progress: {
                            id: 'p2',
                            user_id: user.id.toString(),
                            lesson_id: 'l2',
                            is_completed: false,
                            completion_date: null,
                            time_spent_minutes: 15,
                            notes: null,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }
                    },
                    {
                        id: 'l3',
                        curriculum_id: 'c1',
                        title: 'Academic Writing',
                        description: 'Prepare for academic essays and reports.',
                        content: null,
                        duration_minutes: 90,
                        topics: ['Essay Structure', 'Citations', 'Analysis'],
                        order_index: 3,
                        is_active: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        status: 'coming'
                    }
                ],
                exams: {
                    upcoming: [
                        {
                            id: 'e1',
                            exam_id: 'ex1',
                            exam_type: 'online',
                            scheduled_date: '2023-12-01T10:00:00Z',
                            location: null,
                            meeting_link: 'https://zoom.us/j/123456789',
                            max_participants: 20,
                            current_participants: 15,
                            is_cancelled: false,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            exam: {
                                title: 'Mid-Term Grammar Assessment',
                                description: 'Comprehensive test on grammar topics covered so far.',
                                duration_minutes: 60
                            }
                        }
                    ],
                    old: [
                        {
                            id: 'e2',
                            exam_id: 'ex2',
                            exam_type: 'offline',
                            scheduled_date: '2023-10-15T14:00:00Z',
                            location: 'Room 304, Main Building',
                            meeting_link: null,
                            max_participants: 30,
                            current_participants: 28,
                            is_cancelled: false,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            exam: {
                                title: 'Placement Test',
                                description: 'Initial level assessment.',
                                duration_minutes: 90
                            }
                        }
                    ],
                    overall: [
                        {
                            id: 'e1',
                            exam_id: 'ex1',
                            exam_type: 'online',
                            scheduled_date: '2023-12-01T10:00:00Z',
                            location: null,
                            meeting_link: 'https://zoom.us/j/123456789',
                            max_participants: 20,
                            current_participants: 15,
                            is_cancelled: false,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            exam: {
                                title: 'Mid-Term Grammar Assessment',
                                description: 'Comprehensive test on grammar topics covered so far.',
                                duration_minutes: 60
                            }
                        },
                        {
                            id: 'e2',
                            exam_id: 'ex2',
                            exam_type: 'offline',
                            scheduled_date: '2023-10-15T14:00:00Z',
                            location: 'Room 304, Main Building',
                            meeting_link: null,
                            max_participants: 30,
                            current_participants: 28,
                            is_cancelled: false,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            exam: {
                                title: 'Placement Test',
                                description: 'Initial level assessment.',
                                duration_minutes: 90
                            }
                        }
                    ]
                }
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
        leaderboardData,
        achievementsData,
        journeyData,
        paymentHistory,
        salaryHistory,
        attendanceHistory,
        loading,
        error,
        refreshData: fetchAllData,
    };

    return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};
