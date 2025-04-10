
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

/**
 * Helper utility for logging migration-related events with a consistent format
 */
export const logMigrationEvent = (
  action: string, 
  message: string, 
  level: keyof typeof AUTH_LOG_LEVELS = 'INFO',
  data?: any
) => {
  logAuth('TENANT-MIGRATION', `[${action}] ${message}`, {
    level: AUTH_LOG_LEVELS[level],
    data
  });
};

/**
 * Check if we're running in a development or staging environment
 * This is useful for determining whether we should use edge functions
 * or fallback to direct database interactions
 */
export const isDevOrStagingEnvironment = (): boolean => {
  // Check if we're in a dev or staging environment
  const isLocalDev = process.env.NODE_ENV === 'development';
  const isWebView = typeof window !== 'undefined' && 
                   window.location.hostname.includes('webview');
  const isStaging = typeof window !== 'undefined' && 
                   (window.location.hostname.includes('staging') || 
                    window.location.hostname.includes('test'));
                    
  return isLocalDev || isWebView || isStaging;
};

/**
 * Parse a JSON response safely, with error handling
 */
export const safelyParseJson = async (response: Response): Promise<any> => {
  try {
    const text = await response.text();
    if (!text || text.trim() === '') {
      throw new Error('Empty response received');
    }
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Failed to parse response: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Determine if an error is due to RLS policy violations
 */
export const isRlsViolation = (error: any): boolean => {
  if (!error) return false;
  
  // Check for RLS-specific error code
  if (error.code === '42501') return true;
  
  // Check for common RLS error messages
  const errorMessage = String(error.message || error).toLowerCase();
  return errorMessage.includes('row-level security') || 
         errorMessage.includes('permission denied') ||
         errorMessage.includes('new row violates row-level security policy');
};
