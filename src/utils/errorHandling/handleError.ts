
import { toast } from '@/hooks/use-toast';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { 
  ConstructionErrorResponse,
  ERROR_CATEGORIES,
  ERROR_SEVERITY,
  RECOVERY_STRATEGY 
} from './errorTypes';
import { getSeverityLabel, mapSeverityToVariant, mapSeverityToDuration } from './uiUtils';

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
  
  if (showToast && !window.sessionStorage.getItem(`error_displayed_${errorResponse.code}`)) {
    window.sessionStorage.setItem(`error_displayed_${errorResponse.code}`, 'true');
    
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
