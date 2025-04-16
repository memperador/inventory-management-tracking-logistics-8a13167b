
import { ConstructionErrorResponse, ERROR_SEVERITY } from './errorTypes';

/**
 * Gets a user-friendly label for severity levels
 */
export const getSeverityLabel = (severity: ConstructionErrorResponse['severity']): string => {
  switch (severity) {
    case ERROR_SEVERITY.CRITICAL: return '🚨 Critical';
    case ERROR_SEVERITY.HIGH: return '⚠️ High';
    case ERROR_SEVERITY.MEDIUM: return '⚠ Medium';
    case ERROR_SEVERITY.LOW: return 'ℹ️ Low';
    case ERROR_SEVERITY.INFO: return 'ℹ️ Info';
    default: return 'Error';
  }
};

/**
 * Maps severity to toast variant
 */
export const mapSeverityToVariant = (severity: ConstructionErrorResponse['severity']): 'default' | 'destructive' => {
  switch (severity) {
    case ERROR_SEVERITY.CRITICAL:
    case ERROR_SEVERITY.HIGH:
      return 'destructive';
    default:
      return 'default';
  }
};

/**
 * Maps severity to toast duration
 */
export const mapSeverityToDuration = (severity: ConstructionErrorResponse['severity']): number => {
  switch (severity) {
    case ERROR_SEVERITY.CRITICAL:
      return 10000; // 10 seconds for critical
    case ERROR_SEVERITY.HIGH:
      return 8000; // 8 seconds for high
    default:
      return 5000; // 5 seconds for others
  }
};
