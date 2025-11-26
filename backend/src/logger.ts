import { Request } from 'express';

/**
 * Error logging utility
 * Logs detailed errors to console (visible in Render logs)
 * Sanitizes sensitive data before logging
 */

interface ErrorLogContext {
    endpoint?: string;
    method?: string;
    userId?: string | number;
    action?: string;
    additionalInfo?: Record<string, any>;
}

/**
 * Sanitize sensitive data from objects
 */
function sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sensitiveKeys = ['password', 'token', 'secret', 'api_key', 'apiKey', 'authorization'];
    const sanitized = { ...data };

    for (const key in sanitized) {
        if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
            sanitized[key] = '[REDACTED]';
        } else if (typeof sanitized[key] === 'object') {
            sanitized[key] = sanitizeData(sanitized[key]);
        }
    }

    return sanitized;
}

/**
 * Log detailed error information to console (Render logs)
 */
export function logError(error: any, context: ErrorLogContext = {}) {
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
export function logWarning(message: string, context: ErrorLogContext = {}) {
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
export function logInfo(message: string, context: ErrorLogContext = {}) {
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
export function getRequestInfo(req: Request): Partial<ErrorLogContext> {
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
