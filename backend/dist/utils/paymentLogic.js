"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkStudentStatus = exports.calculateInitialDueDate = exports.calculateNextDueDate = void 0;
const date_fns_1 = require("date-fns");
/**
 * Calculates the next due date based on the current due date and anchor day.
 * Implements "Snap-Back" logic for Monthly Rolling (Type B).
 */
const calculateNextDueDate = (currentDueDate, anchorDay) => {
    // 1. Move to next month
    const targetDate = (0, date_fns_1.addMonths)(currentDueDate, 1);
    // 2. Get max days in that target month
    const maxDays = (0, date_fns_1.getDaysInMonth)(targetDate);
    // 3. The Snap-Back Check
    const finalDay = anchorDay > maxDays ? maxDays : anchorDay;
    return (0, date_fns_1.setDate)(targetDate, finalDay);
};
exports.calculateNextDueDate = calculateNextDueDate;
/**
 * Calculates the initial due date for a new enrollment.
 */
const calculateInitialDueDate = (joinDate, type, anchorDay) => {
    if (type === 'monthly_fixed') {
        // Due on the 1st of the next month (assuming prorated first month is paid upfront)
        // Or if we want strictly 1st of current month? Usually 1st of next.
        // Let's assume 1st of next month for the recurring cycle.
        const nextMonth = (0, date_fns_1.addMonths)(joinDate, 1);
        return (0, date_fns_1.setDate)(nextMonth, 1);
    }
    else if (type === 'monthly_rolling') {
        // Due 1 month from join date (or anchor day)
        const day = anchorDay || joinDate.getDate();
        return (0, exports.calculateNextDueDate)(joinDate, day);
    }
    return new Date(); // Irrelevant for lesson_based
};
exports.calculateInitialDueDate = calculateInitialDueDate;
/**
 * Master Status Checker
 * Returns 'active' or 'overdue' based on the logic.
 */
const checkStudentStatus = (enrollment, config) => {
    const today = (0, date_fns_1.startOfDay)(new Date());
    // --- 1. MONTHLY LOGIC ---
    if (config.payment_type === 'monthly_fixed' || config.payment_type === 'monthly_rolling') {
        if (!enrollment.next_due_date)
            return 'active'; // New student, no due date yet? Assume active.
        const dueDate = (0, date_fns_1.startOfDay)(new Date(enrollment.next_due_date));
        if ((0, date_fns_1.isBefore)(dueDate, today)) {
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
exports.checkStudentStatus = checkStudentStatus;
