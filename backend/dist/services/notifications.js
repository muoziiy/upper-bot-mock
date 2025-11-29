"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendStudentPaymentNotification = sendStudentPaymentNotification;
exports.sendStudentGroupNotification = sendStudentGroupNotification;
exports.sendStudentInfoNotification = sendStudentInfoNotification;
exports.sendTeacherPayoutNotification = sendTeacherPayoutNotification;
exports.sendTeacherGroupNotification = sendTeacherGroupNotification;
exports.sendTeacherSubjectNotification = sendTeacherSubjectNotification;
exports.sendBroadcastNotification = sendBroadcastNotification;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const TELEGRAM_API_URL = `https://api.telegram.org/bot${config_1.config.botToken}`;
// ============================================
// STUDENT NOTIFICATIONS
// ============================================
/**
 * Send payment notification to student
 * @param telegramId - Student's Telegram ID
 * @param paymentInfo - Payment details
 */
async function sendStudentPaymentNotification(telegramId, paymentInfo) {
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
        await axios_1.default.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: telegramId,
            text: message,
            parse_mode: 'Markdown'
        });
        console.log(`Payment notification sent to student ${telegramId}`);
    }
    catch (error) {
        console.error(`Failed to send payment notification to student ${telegramId}:`, error);
        throw error;
    }
}
/**
 * Send group change notification to student
 * @param telegramId - Student's Telegram ID
 * @param groupChanges - Group change details
 */
async function sendStudentGroupNotification(telegramId, groupChanges) {
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
        await axios_1.default.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: telegramId,
            text: message,
            parse_mode: 'Markdown'
        });
        console.log(`Group notification sent to student ${telegramId}`);
    }
    catch (error) {
        console.error(`Failed to send group notification to student ${telegramId}:`, error);
        throw error;
    }
}
/**
 * Send info update notification to student
 * @param telegramId - Student's Telegram ID
 * @param changes - Changed fields
 */
async function sendStudentInfoNotification(telegramId, changes) {
    let message = 'ℹ️ *Profile Updated*\n\n';
    message += 'The following information has been updated:\n\n';
    changes.forEach(change => {
        message += `*${change.field}:* ${change.oldValue} → ${change.newValue}\n`;
    });
    message += '\nYour profile has been updated by the admin.';
    try {
        await axios_1.default.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: telegramId,
            text: message,
            parse_mode: 'Markdown'
        });
        console.log(`Info notification sent to student ${telegramId}`);
    }
    catch (error) {
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
async function sendTeacherPayoutNotification(telegramId, payoutInfo) {
    const message = `💵 *Payout Added*

💰 Amount: $${payoutInfo.amount.toFixed(2)}
📅 Date: ${payoutInfo.date}
💳 Method: ${payoutInfo.method === 'cash' ? 'Cash' : 'Card'}
${payoutInfo.notes ? `📝 Notes: ${payoutInfo.notes}` : ''}

Your payout has been processed by the admin.`;
    try {
        await axios_1.default.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: telegramId,
            text: message,
            parse_mode: 'Markdown'
        });
        console.log(`Payout notification sent to teacher ${telegramId}`);
    }
    catch (error) {
        console.error(`Failed to send payout notification to teacher ${telegramId}:`, error);
        throw error;
    }
}
/**
 * Send group changes notification to teacher
 * @param telegramId - Teacher's Telegram ID
 * @param groupChanges - Group change details
 */
async function sendTeacherGroupNotification(telegramId, groupChanges) {
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
        await axios_1.default.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: telegramId,
            text: message,
            parse_mode: 'Markdown'
        });
        console.log(`Group notification sent to teacher ${telegramId}`);
    }
    catch (error) {
        console.error(`Failed to send group notification to teacher ${telegramId}:`, error);
        throw error;
    }
}
/**
 * Send subject changes notification to teacher
 * @param telegramId - Teacher's Telegram ID
 * @param subjectChanges - Subject change details
 */
async function sendTeacherSubjectNotification(telegramId, subjectChanges) {
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
        await axios_1.default.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: telegramId,
            text: message,
            parse_mode: 'Markdown'
        });
        console.log(`Subject notification sent to teacher ${telegramId}`);
    }
    catch (error) {
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
async function sendBroadcastNotification(telegramIds, message) {
    console.log(`Starting broadcast to ${telegramIds.length} users`);
    let successCount = 0;
    let failCount = 0;
    // We'll process these sequentially to be nice to the API, 
    // though for large lists a queue system would be better.
    for (const telegramId of telegramIds) {
        try {
            await axios_1.default.post(`${TELEGRAM_API_URL}/sendMessage`, {
                chat_id: telegramId,
                text: message,
                parse_mode: 'Markdown'
            });
            successCount++;
        }
        catch (error) {
            console.error(`Failed to send broadcast to ${telegramId}:`, error);
            failCount++;
        }
    }
    console.log(`Broadcast complete. Success: ${successCount}, Failed: ${failCount}`);
    return { success: successCount, failed: failCount };
}
