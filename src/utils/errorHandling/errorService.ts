import { toast } from '@/hooks/use-toast';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { 
  CONSTRUCTION_ERROR_CODES,
  ConstructionErrorCode,
  ConstructionErrorResponse,
  ERROR_CATEGORIES,
  ERROR_SEVERITY,
  RECOVERY_STRATEGY
} from './errorTypes';
import { v4 as uuidv4 } from 'uuid';

// In-memory store for errors during current session
const errorStore: ConstructionErrorResponse[] = [];
const MAX_ERROR_HISTORY = 100;

/**
 * Creates a structured error response based on predefined codes
 */
export const createErrorResponse = (
  errorCode: ConstructionErrorCode, 
  additionalDetails?: Partial<ConstructionErrorResponse>
): ConstructionErrorResponse => {
  const baseError = CONSTRUCTION_ERROR_CODES[errorCode];
  
  if (!baseError) {
    console.error(`Unknown error code: ${errorCode}`);
    // Fallback to system error
    return createErrorResponse('SY-001', { 
      message: `Unknown error code: ${errorCode}`,
      technicalDetails: `Attempted to use undefined error code: ${errorCode}`
    });
  }
  
  const response: ConstructionErrorResponse = {
    ...baseError,
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    technicalDetails: additionalDetails?.technicalDetails || '',
    location: additionalDetails?.location || '',
    userGuidance: additionalDetails?.userGuidance || baseError.userGuidance || '',
    ...additionalDetails
  };
  
  // Store the error for history
  storeError(response);
  
  return response;
};

/**
 * Creates a custom error response for situations without predefined codes
 */
export const createCustomErrorResponse = (
  options: {
    message: string;
    category: ConstructionErrorResponse['category'];
    severity?: ConstructionErrorResponse['severity'];
    recoveryStrategy?: ConstructionErrorResponse['recoveryStrategy'];
    technicalDetails?: string;
    location?: string;
    shouldLog?: boolean;
    shouldAlert?: boolean;
    code?: string;
    userGuidance?: string;
    requiredRoles?: string[];
    relatedRegulations?: string[];
  }
): ConstructionErrorResponse => {
  const response: ConstructionErrorResponse = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    category: options.category,
    severity: options.severity || ERROR_SEVERITY.MEDIUM,
    code: options.code || `CUSTOM-${Date.now().toString().slice(-6)}`,
    message: options.message,
    technicalDetails: options.technicalDetails || '',
    location: options.location || '',
    recoveryStrategy: options.recoveryStrategy || RECOVERY_STRATEGY.NOTIFY,
    userGuidance: options.userGuidance || '',
    shouldLog: options.shouldLog !== undefined ? options.shouldLog : true,
    shouldAlert: options.shouldAlert !== undefined ? options.shouldAlert : false,
    requiredRoles: options.requiredRoles || [],
    relatedRegulations: options.relatedRegulations || []
  };
  
  // Store the error for history
  storeError(response);
  
  return response;
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
  
  // Log the error if configured
  if (errorResponse.shouldLog) {
    console.error(`[${errorResponse.category}] ${errorResponse.code}: ${errorResponse.message}`, {
      errorDetails: errorResponse
    });
    
    // Use auth logger for AUTH category errors
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
  
  // Show toast notification if enabled
  if (showToast && !window.sessionStorage.getItem(`error_displayed_${errorResponse.code}`)) {
    // Set a session flag to avoid repetitive errors
    window.sessionStorage.setItem(`error_displayed_${errorResponse.code}`, 'true');
    
    // Display appropriate toast based on severity
    toast({
      title: `${getSeverityLabel(errorResponse.severity)}: ${errorResponse.message}`,
      description: errorResponse.userGuidance || 'See error details for more information.',
      variant: mapSeverityToVariant(errorResponse.severity),
      duration: mapSeverityToDuration(errorResponse.severity)
    });
  }
  
  // Auto-retry logic for appropriate recovery strategies
  if (errorResponse.recoveryStrategy === RECOVERY_STRATEGY.AUTO_RETRY && retryFn) {
    handleAutoRetry(retryFn, maxRetries, errorResponse);
  }
  
  // Throw the error if requested
  if (throwError) {
    const error = new Error(`${errorResponse.code}: ${errorResponse.message}`);
    (error as any).errorDetails = errorResponse;
    throw error;
  }
  
  return errorResponse;
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
        // Exponential backoff (1s, 2s, 4s, etc.)
        const delay = Math.pow(2, attempts - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return attemptWithBackoff();
      } else {
        // All retries failed, update the error response
        const updatedResponse = {
          ...errorResponse,
          recoveryStrategy: RECOVERY_STRATEGY.MANUAL_INTERVENTION,
          message: `${errorResponse.message} (after ${maxRetries} retry attempts)`
        };
        
        // Replace the original error in the store
        updateStoredError(errorResponse.id, updatedResponse);
        
        // Show a toast about the retry failure
        toast({
          title: 'Recovery Failed',
          description: `Automatic recovery failed after ${maxRetries} attempts. Manual intervention required.`,
          variant: 'destructive'
        });
        
        throw error;
      }
    }
  };
  
  // Start the retry process
  return attemptWithBackoff();
};

/**
 * Stores an error in the in-memory store
 */
const storeError = (error: ConstructionErrorResponse): void => {
  errorStore.unshift(error);
  
  // Keep the store size limited
  if (errorStore.length > MAX_ERROR_HISTORY) {
    errorStore.pop();
  }
};

/**
 * Updates an existing error in the store
 */
const updateStoredError = (id: string, updatedError: ConstructionErrorResponse): void => {
  const index = errorStore.findIndex(error => error.id === id);
  if (index !== -1) {
    errorStore[index] = updatedError;
  }
};

/**
 * Gets all errors from the error store
 */
export const getErrorHistory = (): ConstructionErrorResponse[] => {
  return [...errorStore];
};

/**
 * Utility to filter errors by criteria
 */
export const filterErrors = (criteria: Partial<ConstructionErrorResponse>): ConstructionErrorResponse[] => {
  return errorStore.filter(error => {
    return Object.entries(criteria).every(([key, value]) => {
      return error[key as keyof ConstructionErrorResponse] === value;
    });
  });
};

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
const mapSeverityToVariant = (severity: ConstructionErrorResponse['severity']): 'default' | 'destructive' => {
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
const mapSeverityToDuration = (severity: ConstructionErrorResponse['severity']): number => {
  switch (severity) {
    case ERROR_SEVERITY.CRITICAL:
      return 10000; // 10 seconds for critical
    case ERROR_SEVERITY.HIGH:
      return 8000; // 8 seconds for high
    default:
      return 5000; // 5 seconds for others
  }
};

/**
 * Maps severity to auth log level
 */
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

/**
 * Creates a wrapper function that catches errors and handles them
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    errorCode?: ConstructionErrorCode;
    category?: ConstructionErrorResponse['category'];
    location?: string;
    showToast?: boolean;
    retryable?: boolean;
    maxRetries?: number;
  } = {}
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      // Create an appropriate error response
      const errorResponse = options.errorCode 
        ? createErrorResponse(options.errorCode, { 
            location: options.location,
            technicalDetails: error instanceof Error ? error.message : String(error)
          })
        : createCustomErrorResponse({
            message: error instanceof Error ? error.message : 'An error occurred',
            category: options.category || ERROR_CATEGORIES.SYSTEM,
            location: options.location,
            technicalDetails: error instanceof Error ? error.stack : String(error),
            recoveryStrategy: options.retryable ? RECOVERY_STRATEGY.AUTO_RETRY : RECOVERY_STRATEGY.NOTIFY
          });
      
      // Handle the error
      handleError(errorResponse, {
        showToast: options.showToast,
        throwError: true,
        retryFn: options.retryable ? () => fn(...args) : undefined,
        maxRetries: options.maxRetries
      });
      
      // This line won't be reached because handleError throws,
      // but TypeScript requires a return
      throw error;
    }
  };
}

/**
 * Creates a wrapper function that handles errors for React components
 */
export function withComponentErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    errorCode?: ConstructionErrorCode;
    fallback?: React.ReactNode;
  } = {}
): React.ComponentType<P> {
  return class WithErrorBoundary extends React.Component<P, { hasError: boolean; error: Error | null }> {
    constructor(props: P) {
      super(props);
      this.state = {
        hasError: false,
        error: null
      };
    }

    static getDerivedStateFromError(error: Error) {
      return {
        hasError: true,
        error
      };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      // Create and handle the error response
      const errorResponse = options.errorCode
        ? createErrorResponse(options.errorCode, {
            technicalDetails: `${error.message}\n${errorInfo.componentStack}`,
            location: errorInfo.componentStack.split('\n')[1]?.trim() || 'Unknown component'
          })
        : createCustomErrorResponse({
            message: `Error in ${Component.displayName || 'component'}: ${error.message}`,
            category: ERROR_CATEGORIES.SYSTEM,
            technicalDetails: `${error.message}\n${errorInfo.componentStack}`,
            location: errorInfo.componentStack.split('\n')[1]?.trim() || 'Unknown component'
          });
      
      // Handle the error (without throwing)
      handleError(errorResponse, { throwError: false });
    }

    render() {
      if (this.state.hasError) {
        return options.fallback || (
          <div className="p-4 border border-destructive rounded-md bg-destructive/10">
            <h2 className="text-lg font-semibold text-destructive mb-2">Something went wrong</h2>
            <p className="text-sm text-destructive/90">
              {this.state.error?.message || 'An error occurred in this component'}
            </p>
            <button 
              className="mt-2 text-xs underline" 
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try to recover
            </button>
          </div>
        );
      }

      return <Component {...this.props} />;
    }
  };
}
