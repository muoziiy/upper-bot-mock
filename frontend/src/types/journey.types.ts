// ============================================
// JOURNEY TYPES - TypeScript Interfaces
// ============================================

export const UserLevel = {
    BEGINNER: 'beginner',
    ELEMENTARY: 'elementary',
    PRE_INTERMEDIATE: 'pre_intermediate',
    INTERMEDIATE: 'intermediate',
    UPPER_INTERMEDIATE: 'upper_intermediate',
    ADVANCED: 'advanced',
    IELTS: 'ielts'
} as const;

export type UserLevel = typeof UserLevel[keyof typeof UserLevel];

export const ExamType = {
    ONLINE: 'online',
    OFFLINE: 'offline'
} as const;

export type ExamType = typeof ExamType[keyof typeof ExamType];

export interface Curriculum {
    id: string;
    level: UserLevel;
    name: string;
    description: string | null;
    order_index: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Lesson {
    id: string;
    curriculum_id: string;
    title: string;
    description: string | null;
    content: string | null;
    duration_minutes: number;
    topics: string[];
    order_index: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface LessonProgress {
    id: string;
    user_id: string;
    lesson_id: string;
    is_completed: boolean;
    completion_date: string | null;
    time_spent_minutes: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface LessonWithProgress extends Lesson {
    progress?: LessonProgress;
    status: 'locked' | 'unlocked' | 'completed' | 'coming';
}

export interface UserCurrentLevel {
    user_id: string;
    current_level: UserLevel;
    progress_percentage: number;
    level_started_at: string;
    updated_at: string;
}

export interface ExamSchedule {
    id: string;
    exam_id: string;
    exam_type: ExamType;
    scheduled_date: string;
    location: string | null;
    meeting_link: string | null;
    max_participants: number | null;
    current_participants: number;
    is_cancelled: boolean;
    created_at: string;
    updated_at: string;
    exam?: {
        title: string;
        description: string | null;
        duration_minutes: number | null;
    };
}

export interface ExamRegistration {
    id: string;
    exam_schedule_id: string;
    student_id: string;
    registered_at: string;
    attended: boolean;
}

export interface JourneyData {
    userLevel: UserCurrentLevel;
    curriculum: Curriculum[];
    lessons: LessonWithProgress[];
    exams: {
        upcoming: ExamSchedule[];
        old: ExamSchedule[];
        overall: ExamSchedule[];
    };
}

// Helper function to get display name for user level
export function getLevelDisplayName(level: UserLevel): string {
    const displayNames: Record<UserLevel, string> = {
        [UserLevel.BEGINNER]: 'Beginner',
        [UserLevel.ELEMENTARY]: 'Elementary',
        [UserLevel.PRE_INTERMEDIATE]: 'Pre-Intermediate',
        [UserLevel.INTERMEDIATE]: 'Intermediate',
        [UserLevel.UPPER_INTERMEDIATE]: 'Upper-Intermediate',
        [UserLevel.ADVANCED]: 'Advanced',
        [UserLevel.IELTS]: 'IELTS'
    };
    return displayNames[level];
}

// Helper function to get level order for progression
export function getLevelOrder(level: UserLevel): number {
    const order: Record<UserLevel, number> = {
        [UserLevel.BEGINNER]: 1,
        [UserLevel.ELEMENTARY]: 2,
        [UserLevel.PRE_INTERMEDIATE]: 3,
        [UserLevel.INTERMEDIATE]: 4,
        [UserLevel.UPPER_INTERMEDIATE]: 5,
        [UserLevel.ADVANCED]: 6,
        [UserLevel.IELTS]: 7
    };
    return order[level];
}

// Helper function to get level color
export function getLevelColor(level: UserLevel): string {
    const colors: Record<UserLevel, string> = {
        [UserLevel.BEGINNER]: '#22c55e', // green
        [UserLevel.ELEMENTARY]: '#eab308', // yellow
        [UserLevel.PRE_INTERMEDIATE]: '#0ea5e9', // light blue
        [UserLevel.INTERMEDIATE]: '#3b82f6', // blue
        [UserLevel.UPPER_INTERMEDIATE]: '#1d4ed8', // dark blue
        [UserLevel.ADVANCED]: '#f97316', // orange
        [UserLevel.IELTS]: '#ef4444' // red
    };
    return colors[level];
}
