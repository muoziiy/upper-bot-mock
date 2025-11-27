import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// ============================================
// STUDENT NOTIFICATIONS
// ============================================

/**
 * Send payment notification to student
 * @param telegramId - Student's Telegram ID
 * @param paymentInfo - Payment details
 */
export async function sendStudentPaymentNotification(
    telegramId: number,
    paymentInfo: {
        action: 'added' | 'updated' | 'deleted';
        subject: string;
        amount: number;
        date: string;
        method: 'cash' | 'card';
        status: 'paid' | 'pending' | 'unpaid';
    }
) {
    const actionEmoji = {
        added: '💰',
        updated: '✏️',
        deleted: '🗑️'
    };

    const statusEmoji = {
        paid: '✅',
        pending: '⏳',
        unpaid: '❌'
    };

    const actionText = {
        added: 'Payment Recorded',
        updated: 'Payment Updated',
        deleted: 'Payment Deleted'
    };

    const message = `${actionEmoji[paymentInfo.action]} *${actionText[paymentInfo.action]}*

📚 Subject: ${paymentInfo.subject}
💵 Amount: $${paymentInfo.amount.toFixed(2)}
📅 Date: ${paymentInfo.date}
💳 Method: ${paymentInfo.method === 'cash' ? 'Cash' : 'Card'}
${statusEmoji[paymentInfo.status]} Status: ${paymentInfo.status.charAt(0).toUpperCase() + paymentInfo.status.slice(1)}

${paymentInfo.action === 'deleted' ? 'The payment has been removed from your records.' : 'Your payment has been successfully recorded by the admin.'}`;

    try {
        await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: telegramId,
            text: message,
            parse_mode: 'Markdown'
        });
        console.log(`Payment notification sent to student ${telegramId}`);
    } catch (error) {
        console.error(`Failed to send payment notification to student ${telegramId}:`, error);
        throw error;
    }
}

/**
 * Send group change notification to student
 * @param telegramId - Student's Telegram ID
 * @param groupChanges - Group change details
 */
export async function sendStudentGroupNotification(
    telegramId: number,
    groupChanges: {
        added: string[];
        removed: string[];
    }
) {
    let message = '👥 *Group Changes*\n\n';

    if (groupChanges.added.length > 0) {
        message += '✅ *Added to groups:*\n';
        groupChanges.added.forEach(group => {
            message += `• ${group}\n`;
        });
        message += '\n';
    }

    if (groupChanges.removed.length > 0) {
        message += '❌ *Removed from groups:*\n';
        groupChanges.removed.forEach(group => {
            message += `• ${group}\n`;
        });
        message += '\n';
    }

    message += 'Your group assignments have been updated by the admin.';

    try {
        await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: telegramId,
            text: message,
            parse_mode: 'Markdown'
        });
        console.log(`Group notification sent to student ${telegramId}`);
    } catch (error) {
        console.error(`Failed to send group notification to student ${telegramId}:`, error);
        throw error;
    }
}

/**
 * Send info update notification to student
 * @param telegramId - Student's Telegram ID
 * @param changes - Changed fields
 */
export async function sendStudentInfoNotification(
    telegramId: number,
    changes: {
        field: string;
        oldValue: string;
        newValue: string;
    }[]
) {
    let message = 'ℹ️ *Profile Updated*\n\n';
    message += 'The following information has been updated:\n\n';

    changes.forEach(change => {
        message += `*${change.field}:* ${change.oldValue} → ${change.newValue}\n`;
    });

    message += '\nYour profile has been updated by the admin.';

    try {
        await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: telegramId,
            text: message,
            parse_mode: 'Markdown'
        });
        console.log(`Info notification sent to student ${telegramId}`);
    } catch (error) {
        console.error(`Failed to send info notification to student ${telegramId}:`, error);
        throw error;
    }
}

// ============================================
// TEACHER NOTIFICATIONS
// ============================================

/**
 * Send payout notification to teacher
 * @param telegramId - Teacher's Telegram ID
 * @param payoutInfo - Payout details
 */
export async function sendTeacherPayoutNotification(
    telegramId: number,
    payoutInfo: {
        amount: number;
        date: string;
        method: 'cash' | 'card';
        notes?: string;
    }
) {
    const message = `💵 *Payout Added*

💰 Amount: $${payoutInfo.amount.toFixed(2)}
📅 Date: ${payoutInfo.date}
💳 Method: ${payoutInfo.method === 'cash' ? 'Cash' : 'Card'}
${payoutInfo.notes ? `📝 Notes: ${payoutInfo.notes}` : ''}

Your payout has been processed by the admin.`;

    try {
        await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: telegramId,
            text: message,
            parse_mode: 'Markdown'
        });
        console.log(`Payout notification sent to teacher ${telegramId}`);
    } catch (error) {
        console.error(`Failed to send payout notification to teacher ${telegramId}:`, error);
        throw error;
    }
}

/**
 * Send group changes notification to teacher
 * @param telegramId - Teacher's Telegram ID
 * @param groupChanges - Group change details
 */
export async function sendTeacherGroupNotification(
    telegramId: number,
    groupChanges: {
        added: string[];
        removed: string[];
    }
) {
    let message = '👥 *Group Assignment Changes*\n\n';

    if (groupChanges.added.length > 0) {
        message += '✅ *Assigned to new groups:*\n';
        groupChanges.added.forEach(group => {
            message += `• ${group}\n`;
        });
        message += '\n';
    }

    if (groupChanges.removed.length > 0) {
        message += '❌ *Removed from groups:*\n';
        groupChanges.removed.forEach(group => {
            message += `• ${group}\n`;
        });
        message += '\n';
    }

    message += 'Your group assignments have been updated by the admin.';

    try {
        await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: telegramId,
            text: message,
            parse_mode: 'Markdown'
        });
        console.log(`Group notification sent to teacher ${telegramId}`);
    } catch (error) {
        console.error(`Failed to send group notification to teacher ${telegramId}:`, error);
        throw error;
    }
}

/**
 * Send subject changes notification to teacher
 * @param telegramId - Teacher's Telegram ID
 * @param subjectChanges - Subject change details
 */
export async function sendTeacherSubjectNotification(
    telegramId: number,
    subjectChanges: {
        added: string[];
        removed: string[];
    }
) {
    let message = '📚 *Subject Assignment Changes*\n\n';

    if (subjectChanges.added.length > 0) {
        message += '✅ *Assigned to teach:*\n';
        subjectChanges.added.forEach(subject => {
            message += `• ${subject}\n`;
        });
        message += '\n';
    }

    if (subjectChanges.removed.length > 0) {
        message += '❌ *Removed from teaching:*\n';
        subjectChanges.removed.forEach(subject => {
            message += `• ${subject}\n`;
        });
        message += '\n';
    }

    message += 'Your subject assignments have been updated by the admin.';

    try {
        await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: telegramId,
            text: message,
            parse_mode: 'Markdown'
        });
        console.log(`Subject notification sent to teacher ${telegramId}`);
    } catch (error) {
        console.error(`Failed to send subject notification to teacher ${telegramId}:`, error);
        throw error;
    }
}
