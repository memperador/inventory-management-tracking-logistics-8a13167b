
import { supabase } from '@/integrations/supabase/client';
import { createErrorResponse, handleError, withErrorHandling } from '@/utils/errorHandling/errorService';
import { ERROR_CATEGORIES } from '@/utils/errorHandling/errorTypes';

export interface AuditLogEntry {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  timestamp: Date;
  metadata?: Record<string, any>;
  status?: 'success' | 'error' | 'warning';
}

/**
 * Creates an audit log entry for data mutations
 */
export const logAuditEvent = withErrorHandling(
  async (entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> => {
    const logEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date(),
    };
    
    console.log('Audit log:', logEntry);
    
    // In a real implementation, we would send this to the backend
    // For now, we'll just log it to the console
    
    // Example implementation with Supabase:
    // await supabase.from('audit_logs').insert([logEntry]);
  },
  { 
    errorCode: 'SY-001',
    location: 'logAuditEvent',
    showToast: false 
  }
);

/**
 * Higher-order function that wraps a mutation function with audit logging
 */
export const withAuditLogging = <T extends (...args: any[]) => Promise<any>>(
  mutationFn: T,
  options: {
    action: string;
    entityType: string;
    getUserId: () => string;
    getEntityId: (...args: Parameters<T>) => string;
    getOldValue?: () => any;
    getNewValue?: (result: Awaited<ReturnType<T>>, ...args: Parameters<T>) => any;
  }
): T => {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const userId = options.getUserId();
    const entityId = options.getEntityId(...args);
    const oldValue = options.getOldValue ? options.getOldValue() : undefined;

    try {
      const result = await mutationFn(...args);
      const newValue = options.getNewValue ? options.getNewValue(result, ...args) : undefined;

      await logAuditEvent({
        userId,
        action: options.action,
        entityType: options.entityType,
        entityId,
        oldValue,
        newValue,
        metadata: { success: true },
        status: 'success'
      });

      return result;
    } catch (error: any) {
      // Create a structured error response
      const errorResponse = createErrorResponse('SY-001', {
        message: `Operation failed: ${options.action}`,
        technicalDetails: error?.message || 'Unknown error during operation',
        location: 'withAuditLogging'
      });
      
      // Log the audit event with error status
      await logAuditEvent({
        userId,
        action: options.action,
        entityType: options.entityType,
        entityId,
        oldValue,
        metadata: { success: false, error: error.message },
        status: 'error'
      });
      
      // Handle the error
      handleError(errorResponse, { throwError: false });
      
      throw error;
    }
  }) as T;
};

/**
 * React hook for logging audit events
 */
export const useAuditLogger = () => {
  return {
    logEvent: logAuditEvent,
    wrapWithAuditLogging: withAuditLogging,
  };
};
