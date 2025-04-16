
import { toast } from '@/hooks/use-toast';
import { ConstructionErrorResponse, ERROR_CATEGORIES, ERROR_SEVERITY } from './errorTypes';
import { createErrorResponse, createCustomErrorResponse } from './createError';
import { getSeverityLabel, mapSeverityToVariant, mapSeverityToDuration } from './uiUtils';

// In-memory error history for debugging purposes
const errorHistory: ConstructionErrorResponse[] = [];

/**
 * Gets the error history
 */
export const getErrorHistory = (): ConstructionErrorResponse[] => {
  return [...errorHistory];
};

/**
 * Clears the error history
 */
export const clearErrorHistory = (): void => {
  errorHistory.length = 0;
};

/**
 * Filters errors based on criteria
 */
export const filterErrors = (
  criteria: Partial<{
    category: ConstructionErrorResponse['category'];
    severity: ConstructionErrorResponse['severity'];
    code: string;
    from: Date;
    to: Date;
  }>
): ConstructionErrorResponse[] => {
  return errorHistory.filter(error => {
    let match = true;
    
    if (criteria.category && error.category !== criteria.category) {
      match = false;
    }
    
    if (criteria.severity && error.severity !== criteria.severity) {
      match = false;
    }
    
    if (criteria.code && !error.code.includes(criteria.code)) {
      match = false;
    }
    
    if (criteria.from || criteria.to) {
      const errorDate = new Date(error.timestamp);
      
      if (criteria.from && errorDate < criteria.from) {
        match = false;
      }
      
      if (criteria.to && errorDate > criteria.to) {
        match = false;
      }
    }
    
    return match;
  });
};

/**
 * Adds an error to the history
 */
const addToErrorHistory = (error: ConstructionErrorResponse): void => {
  errorHistory.unshift(error); // Add to beginning
  
  // Limit history size
  if (errorHistory.length > 100) {
    errorHistory.pop();
  }
};

export { createErrorResponse, createCustomErrorResponse } from './createError';
export { handleError } from './handleError';
export { withErrorHandling, withComponentErrorBoundary } from './errorWrapper';
export { getSeverityLabel, mapSeverityToVariant, mapSeverityToDuration } from './uiUtils';
