"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logError = logError;
exports.logWarning = logWarning;
exports.logInfo = logInfo;
exports.getRequestInfo = getRequestInfo;
/**
 * Sanitize sensitive data from objects
 */
function sanitizeData(data) {
    if (!data || typeof data !== 'object')
        return data;
    const sensitiveKeys = ['password', 'token', 'secret', 'api_key', 'apiKey', 'authorization'];
    const sanitized = { ...data };
    for (const key in sanitized) {
        if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
            sanitized[key] = '[REDACTED]';
        }
        else if (typeof sanitized[key] === 'object') {
            sanitized[key] = sanitizeData(sanitized[key]);
        }
    }
    return sanitized;
}
/**
 * Log detailed error information to console (Render logs)
 */
function logError(error, context = {}) {
    const timestamp = new Date().toISOString();
    const errorDetails = {
        timestamp,
        level: 'ERROR',
        ...context,
        error: {
            message: error?.message || String(error),
            code: error?.code,
            details: sanitizeData(error?.details),
            hint: error?.hint,
            stack: process.env.NODE_ENV === 'production' ? undefined : error?.stack,
        }
    };
    console.error('[ERROR]', JSON.stringify(errorDetails, null, 2));
}
/**
 * Log warning information
 */
function logWarning(message, context = {}) {
    const timestamp = new Date().toISOString();
    const warningDetails = {
        timestamp,
        level: 'WARNING',
        message,
        ...context
    };
    console.warn('[WARNING]', JSON.stringify(warningDetails, null, 2));
}
/**
 * Log info for important events
 */
function logInfo(message, context = {}) {
    const timestamp = new Date().toISOString();
    const infoDetails = {
        timestamp,
        level: 'INFO',
        message,
        ...sanitizeData(context)
    };
    console.log('[INFO]', JSON.stringify(infoDetails, null, 2));
}
/**
 * Extract safe request info for logging
 */
function getRequestInfo(req) {
    return {
        endpoint: req.path,
        method: req.method,
        additionalInfo: {
            ip: req.ip,
            userAgent: req.get('user-agent'),
            // Don't log full body - may contain sensitive data
            bodyKeys: req.body ? Object.keys(req.body) : []
        }
    };
}
