
import { toast } from '@/hooks/use-toast';
import { ConstructionErrorResponse, ERROR_CATEGORIES, ERROR_SEVERITY } from './errorTypes';
import { createErrorResponse, createCustomErrorResponse } from './createError';
import { getSeverityLabel, mapSeverityToVariant, mapSeverityToDuration } from './uiUtils';
import { handleError } from './handleError';
import { withErrorHandling, withComponentErrorBoundary } from './errorWrapper';

// Re-export the history functions from handleError
export { getErrorHistory, filterErrors } from './handleError';

// Re-export all necessary functions
export { 
  createErrorResponse, 
  createCustomErrorResponse, 
  handleError,
  withErrorHandling, 
  withComponentErrorBoundary,
  getSeverityLabel, 
  mapSeverityToVariant, 
  mapSeverityToDuration
};

// In-memory error history for debugging purposes
const errorHistory: ConstructionErrorResponse[] = [];

/**
 * Clears the error history
 */
export const clearErrorHistory = (): void => {
  errorHistory.length = 0;
};
