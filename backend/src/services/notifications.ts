import axios from 'axios';
import { config } from '../config';

const TELEGRAM_API_URL = `https://api.telegram.org/bot${config.botToken}`;

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
        added: "To'lov Qabul Qilindi",
        updated: "To'lov Yangilandi",
        deleted: "To'lov O'chirildi"
    };

    const statusText = {
        paid: "To'langan",
        pending: "Kutilmoqda",
        unpaid: "To'lanmagan"
    };

    const message = `${actionEmoji[paymentInfo.action]} *${actionText[paymentInfo.action]}*

📚 Fan: ${paymentInfo.subject}
💵 Miqdor: ${paymentInfo.amount.toLocaleString()} UZS
📅 Sana: ${paymentInfo.date}
💳 Usul: ${paymentInfo.method === 'cash' ? 'Naqd' : 'Karta'}
${statusEmoji[paymentInfo.status]} Holat: ${statusText[paymentInfo.status]}

${paymentInfo.action === 'deleted' ? "To'lov yozuvlaringizdan olib tashlandi." : "Sizning to'lovingiz admin tomonidan muvaffaqiyatli qayd etildi."}`;

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
    let message = '👥 *Guruh O\'zgarishlari*\n\n';

    if (groupChanges.added.length > 0) {
        message += '✅ *Guruhlarga qo\'shildi:*\n';
        groupChanges.added.forEach(group => {
            message += `• ${group}\n`;
        });
        message += '\n';
    }

    if (groupChanges.removed.length > 0) {
        message += '❌ *Guruhlardan olib tashlandi:*\n';
        groupChanges.removed.forEach(group => {
            message += `• ${group}\n`;
        });
        message += '\n';
    }

    message += 'Sizning guruhlaringiz admin tomonidan yangilandi.';

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
    let message = 'ℹ️ *Profil Yangilandi*\n\n';
    message += 'Quyidagi ma\'lumotlar yangilandi:\n\n';

    changes.forEach(change => {
        message += `*${change.field}:* ${change.oldValue} → ${change.newValue}\n`;
    });

    message += '\nSizning profilingiz admin tomonidan yangilandi.';

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
    const message = `💵 *To'lov Qo'shildi*

💰 Miqdor: ${payoutInfo.amount.toLocaleString()} UZS
📅 Sana: ${payoutInfo.date}
💳 Usul: ${payoutInfo.method === 'cash' ? 'Naqd' : 'Karta'}
${payoutInfo.notes ? `📝 Izohlar: ${payoutInfo.notes}` : ''}

Sizning to'lovingiz admin tomonidan amalga oshirildi.`;

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
    let message = '👥 *Guruh Tayinlovidagi O\'zgarishlar*\n\n';

    if (groupChanges.added.length > 0) {
        message += '✅ *Yangi guruhlarga tayinlandi:*\n';
        groupChanges.added.forEach(group => {
            message += `• ${group}\n`;
        });
        message += '\n';
    }

    if (groupChanges.removed.length > 0) {
        message += '❌ *Guruhlardan olib tashlandi:*\n';
        groupChanges.removed.forEach(group => {
            message += `• ${group}\n`;
        });
        message += '\n';
    }

    message += 'Sizning guruh tayinlovlaringiz admin tomonidan yangilandi.';

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
    let message = '📚 *Fan Tayinlovidagi O\'zgarishlar*\n\n';

    if (subjectChanges.added.length > 0) {
        message += '✅ *O\'qitish uchun tayinlandi:*\n';
        subjectChanges.added.forEach(subject => {
            message += `• ${subject}\n`;
        });
        message += '\n';
    }

    if (subjectChanges.removed.length > 0) {
        message += '❌ *O\'qitishdan olib tashlandi:*\n';
        subjectChanges.removed.forEach(subject => {
            message += `• ${subject}\n`;
        });
        message += '\n';
    }

    message += 'Sizning fan tayinlovlaringiz admin tomonidan yangilandi.';

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

// ============================================
// BROADCAST NOTIFICATIONS
// ============================================

/**
 * Send broadcast notification to multiple users
 * @param telegramIds - Array of Telegram IDs
 * @param message - Message to send
 */
export async function sendBroadcastNotification(
    telegramIds: number[],
    message: string
) {
    console.log(`Starting broadcast to ${telegramIds.length} users`);

    let successCount = 0;
    let failCount = 0;

    // We'll process these sequentially to be nice to the API, 
    // though for large lists a queue system would be better.
    for (const telegramId of telegramIds) {
        try {
            await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
                chat_id: telegramId,
                text: message,
                parse_mode: 'Markdown'
            });
            successCount++;
        } catch (error) {
            console.error(`Failed to send broadcast to ${telegramId}:`, error);
            failCount++;
        }
    }

    console.log(`Broadcast complete. Success: ${successCount}, Failed: ${failCount}`);
    return { success: successCount, failed: failCount };
}
