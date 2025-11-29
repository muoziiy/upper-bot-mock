import { addMonths, setDate, getDaysInMonth, isBefore, startOfDay, differenceInDays } from 'date-fns';

export type PaymentType = 'monthly_fixed' | 'monthly_rolling' | 'lesson_based';

export interface GroupConfig {
    payment_type: PaymentType;
    price: number;
}

export interface StudentEnrollment {
    joined_at: string;
    anchor_day?: number;
    lessons_remaining?: number;
    next_due_date?: string;
    last_payment_date?: string;
}

/**
 * Calculates the next due date based on the current due date and anchor day.
 * Implements "Snap-Back" logic for Monthly Rolling (Type B).
 */
export const calculateNextDueDate = (currentDueDate: Date, anchorDay: number): Date => {
    // 1. Move to next month
    const targetDate = addMonths(currentDueDate, 1);
    
    // 2. Get max days in that target month
    const maxDays = getDaysInMonth(targetDate);

    // 3. The Snap-Back Check
    const finalDay = anchorDay > maxDays ? maxDays : anchorDay;

    return setDate(targetDate, finalDay);
};

/**
 * Calculates the initial due date for a new enrollment.
 */
export const calculateInitialDueDate = (joinDate: Date, type: PaymentType, anchorDay?: number): Date => {
    if (type === 'monthly_fixed') {
        // Due on the 1st of the next month (assuming prorated first month is paid upfront)
        // Or if we want strictly 1st of current month? Usually 1st of next.
        // Let's assume 1st of next month for the recurring cycle.
        const nextMonth = addMonths(joinDate, 1);
        return setDate(nextMonth, 1);
    } else if (type === 'monthly_rolling') {
        // Due 1 month from join date (or anchor day)
        const day = anchorDay || joinDate.getDate();
        return calculateNextDueDate(joinDate, day);
    }
    return new Date(); // Irrelevant for lesson_based
};

/**
 * Master Status Checker
 * Returns 'active' or 'overdue' based on the logic.
 */
export const checkStudentStatus = (
    enrollment: StudentEnrollment, 
    config: GroupConfig
): 'active' | 'overdue' => {
    const today = startOfDay(new Date());

    // --- 1. MONTHLY LOGIC ---
    if (config.payment_type === 'monthly_fixed' || config.payment_type === 'monthly_rolling') {
        if (!enrollment.next_due_date) return 'active'; // New student, no due date yet? Assume active.
        
        const dueDate = startOfDay(new Date(enrollment.next_due_date));
        
        if (isBefore(dueDate, today)) {
            // Due date has passed
            return 'overdue';
        }
        return 'active';
    }

    // --- 2. LESSON LOGIC ---
    if (config.payment_type === 'lesson_based') {
        if ((enrollment.lessons_remaining || 0) <= 0) {
            return 'overdue';
        }
        return 'active';
    }

    return 'active';
};
