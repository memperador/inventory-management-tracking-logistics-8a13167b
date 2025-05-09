
/**
 * AuthLogger utility provides enhanced debugging for authentication flows
 * This can be used in any file for consistent logging of auth events
 */

export const AUTH_LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
} as const;

type LogLevel = typeof AUTH_LOG_LEVELS[keyof typeof AUTH_LOG_LEVELS];

interface LogOptions {
  level?: LogLevel;
  data?: Record<string, any>;
  // If true, will always log regardless of log level
  force?: boolean;
}

// Always log everything in development
const DEFAULT_LOG_LEVEL = AUTH_LOG_LEVELS.DEBUG;

// Map log levels to console methods
const LOG_METHODS = {
  [AUTH_LOG_LEVELS.ERROR]: console.error,
  [AUTH_LOG_LEVELS.WARN]: console.warn,
  [AUTH_LOG_LEVELS.INFO]: console.log,
  [AUTH_LOG_LEVELS.DEBUG]: console.debug
};

// Print to sessionStorage for debugging later
const storeLogInSession = (prefix: string, message: string, level: LogLevel, data?: Record<string, any>) => {
  try {
    const logs = JSON.parse(sessionStorage.getItem('auth_debug_logs') || '[]');
    logs.push({
      timestamp: new Date().toISOString(),
      prefix,
      message,
      level,
      data
    });
    
    // Keep only the last 200 logs to prevent storage issues
    if (logs.length > 200) {
      logs.shift();
    }
    
    sessionStorage.setItem('auth_debug_logs', JSON.stringify(logs));
  } catch (e) {
    // Silently fail if sessionStorage fails
  }
};

// Log with consistent format
export const logAuth = (
  prefix: string,
  message: string,
  options: LogOptions = {}
) => {
  const { level = AUTH_LOG_LEVELS.INFO, data, force = false } = options;
  
  // Always log errors and warnings, other logs depend on the level
  const shouldLog = force || 
    level === AUTH_LOG_LEVELS.ERROR || 
    level === AUTH_LOG_LEVELS.WARN || 
    DEFAULT_LOG_LEVEL === AUTH_LOG_LEVELS.DEBUG;
  
  if (shouldLog) {
    const logFn = LOG_METHODS[level] || console.log;
    const formattedPrefix = `[${prefix}]`;
    
    if (data) {
      logFn(`${formattedPrefix} ${message}`, data);
    } else {
      logFn(`${formattedPrefix} ${message}`);
    }
    
    // Also store in session storage for debugging
    storeLogInSession(prefix, message, level, data);
  }
};

// Get all stored logs
export const getAuthLogs = (): any[] => {
  try {
    return JSON.parse(sessionStorage.getItem('auth_debug_logs') || '[]');
  } catch (e) {
    return [];
  }
};

// Clear auth logs
export const clearAuthLogs = () => {
  sessionStorage.removeItem('auth_debug_logs');
};

// Dump all auth logs to console
export const dumpAuthLogs = () => {
  const logs = getAuthLogs();
  console.group('Auth Debug Logs');
  logs.forEach(log => {
    const logFn = LOG_METHODS[log.level as LogLevel] || console.log;
    logFn(`[${log.timestamp}] [${log.prefix}] ${log.message}`, log.data);
  });
  console.groupEnd();
  return logs;
};

// Extract logs by prefix
export const getLogsByPrefix = (prefix: string): any[] => {
  try {
    const logs = getAuthLogs();
    return logs.filter(log => log.prefix === prefix);
  } catch (e) {
    return [];
  }
};

// Extract logs with specified level
export const getLogsByLevel = (level: LogLevel): any[] => {
  try {
    const logs = getAuthLogs();
    return logs.filter(log => log.level === level);
  } catch (e) {
    return [];
  }
};

// Search logs by message content
export const searchLogs = (searchTerm: string): any[] => {
  try {
    const logs = getAuthLogs();
    return logs.filter(log => 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.data && JSON.stringify(log.data).toLowerCase().includes(searchTerm.toLowerCase()))
    );
  } catch (e) {
    return [];
  }
};

// Get the most recent logs, limited by count
export const getRecentLogs = (count: number = 20): any[] => {
  try {
    const logs = getAuthLogs();
    return logs.slice(-count);
  } catch (e) {
    return [];
  }
};

// Download logs as JSON
export const downloadLogs = () => {
  try {
    const logs = getAuthLogs();
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auth-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Failed to download logs:', e);
  }
};
