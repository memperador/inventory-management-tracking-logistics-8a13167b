
import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Creates an audit log entry for data mutations
 */
export const logAuditEvent = async (entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> => {
  try {
    const logEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date(),
    };
    
    console.log('Audit log:', logEntry);
    
    // In a real implementation, we would send this to the backend
    // For now, we'll just log it to the console
    
    // Example implementation with Supabase:
    // await supabase.from('audit_logs').insert([logEntry]);
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

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
    getNewValue?: (...args: Parameters<T>, result: Awaited<ReturnType<T>>) => any;
  }
): T => {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const userId = options.getUserId();
    const entityId = options.getEntityId(...args);
    const oldValue = options.getOldValue ? options.getOldValue() : undefined;

    try {
      const result = await mutationFn(...args);
      const newValue = options.getNewValue ? options.getNewValue(...args, result) : undefined;

      await logAuditEvent({
        userId,
        action: options.action,
        entityType: options.entityType,
        entityId,
        oldValue,
        newValue,
        metadata: { success: true },
      });

      return result;
    } catch (error) {
      await logAuditEvent({
        userId,
        action: options.action,
        entityType: options.entityType,
        entityId,
        oldValue,
        metadata: { success: false, error: error.message },
      });
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
