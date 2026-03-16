/**
 * Production Logger Utility
 * Structured logging with levels and timestamps
 */
const LOG_LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
};

const currentLevel = process.env.LOG_LEVEL ? LOG_LEVELS[process.env.LOG_LEVEL] : LOG_LEVELS.info;

function formatMessage(level, message, meta = {}) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...(Object.keys(meta).length > 0 && { meta })
    };
    return JSON.stringify(logEntry);
}

function log(level, message, meta) {
    if (LOG_LEVELS[level] <= currentLevel) {
        const formatted = formatMessage(level, message, meta);

        if (level === 'error') {
            console.error(formatted);
        } else if (level === 'warn') {
            console.warn(formatted);
        } else {
            console.log(formatted);
        }
    }
}

module.exports = {
    error: (message, meta) => log('error', message, meta),
    warn: (message, meta) => log('warn', message, meta),
    info: (message, meta) => log('info', message, meta),
    debug: (message, meta) => log('debug', message, meta),

    // HTTP request logging helper
    http: (req, res, duration) => {
        log('info', `${req.method} ${req.originalUrl}`, {
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent')
        });
    }
};
