
import { toast } from '@/hooks/use-toast';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { 
  ConstructionErrorResponse,
  ERROR_CATEGORIES,
  ERROR_SEVERITY,
  RECOVERY_STRATEGY 
} from './errorTypes';
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
 * Adds an error to the history
 */
const addToErrorHistory = (error: ConstructionErrorResponse): void => {
  errorHistory.unshift(error); // Add to beginning
  
  // Limit history size
  if (errorHistory.length > 100) {
    errorHistory.pop();
  }
};

/**
 * Implements auto-retry with exponential backoff
 */
const handleAutoRetry = async (
  fn: () => Promise<any>,
  maxRetries: number,
  errorResponse: ConstructionErrorResponse
) => {
  let attempts = 0;
  
  const attemptWithBackoff = async (): Promise<any> => {
    try {
      attempts++;
      return await fn();
    } catch (error) {
      console.log(`Auto-retry attempt ${attempts} of ${maxRetries} failed for ${errorResponse.code}`);
      
      if (attempts < maxRetries) {
        const delay = Math.pow(2, attempts - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return attemptWithBackoff();
      } else {
        const updatedResponse = {
          ...errorResponse,
          recoveryStrategy: RECOVERY_STRATEGY.MANUAL_INTERVENTION,
          message: `${errorResponse.message} (after ${maxRetries} retry attempts)`
        };
        
        toast({
          title: 'Recovery Failed',
          description: `Automatic recovery failed after ${maxRetries} attempts. Manual intervention required.`,
          variant: 'destructive'
        });
        
        throw error;
      }
    }
  };
  
  return attemptWithBackoff();
};

/**
 * Handles an error through the centralized error system
 */
export const handleError = (
  errorResponse: ConstructionErrorResponse,
  options?: {
    showToast?: boolean;
    throwError?: boolean;
    retryFn?: () => Promise<any>;
    maxRetries?: number;
  }
): ConstructionErrorResponse => {
  const {
    showToast = true,
    throwError = false,
    retryFn,
    maxRetries = 3
  } = options || {};
  
  // Add to error history
  addToErrorHistory(errorResponse);
  
  if (errorResponse.shouldLog) {
    console.error(`[${errorResponse.category}] ${errorResponse.code}: ${errorResponse.message}`, {
      errorDetails: errorResponse
    });
    
    if (errorResponse.category === ERROR_CATEGORIES.AUTH) {
      logAuth('ERROR-HANDLER', errorResponse.message, {
        level: mapSeverityToLogLevel(errorResponse.severity),
        force: errorResponse.severity === ERROR_SEVERITY.CRITICAL,
        data: {
          ...errorResponse,
          handledAt: new Date().toISOString()
        }
      });
    }
  }
  
  // Prevent showing too many of the same error toasts in one session
  // Store shown errors in sessionStorage rather than a local variable to persist across page refreshes
  const errorKey = `error_displayed_${errorResponse.code}`;
  const hasShown = window.sessionStorage.getItem(errorKey);
  
  if (showToast && !hasShown) {
    // Store that we've shown this error
    window.sessionStorage.setItem(errorKey, 'true');
    
    toast({
      title: `${getSeverityLabel(errorResponse.severity)}: ${errorResponse.message}`,
      description: errorResponse.userGuidance || 'See error details for more information.',
      variant: mapSeverityToVariant(errorResponse.severity),
      duration: mapSeverityToDuration(errorResponse.severity)
    });
  }
  
  if (errorResponse.recoveryStrategy === RECOVERY_STRATEGY.AUTO_RETRY && retryFn) {
    handleAutoRetry(retryFn, maxRetries, errorResponse);
  }
  
  if (throwError) {
    const error = new Error(`${errorResponse.code}: ${errorResponse.message}`);
    (error as any).errorDetails = errorResponse;
    throw error;
  }
  
  return errorResponse;
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
 * Clears error history
 */
export const clearErrorHistory = (): void => {
  errorHistory.length = 0;
  
  // Clear all error_displayed keys from sessionStorage
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('error_displayed_')) {
      sessionStorage.removeItem(key);
    }
  });
};

const mapSeverityToLogLevel = (severity: ConstructionErrorResponse['severity']) => {
  switch (severity) {
    case ERROR_SEVERITY.CRITICAL:
    case ERROR_SEVERITY.HIGH:
      return AUTH_LOG_LEVELS.ERROR;
    case ERROR_SEVERITY.MEDIUM:
      return AUTH_LOG_LEVELS.WARN;
    case ERROR_SEVERITY.LOW:
      return AUTH_LOG_LEVELS.INFO;
    case ERROR_SEVERITY.INFO:
      return AUTH_LOG_LEVELS.DEBUG;
    default:
      return AUTH_LOG_LEVELS.INFO;
  }
};
