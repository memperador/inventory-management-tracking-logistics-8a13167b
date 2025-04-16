
import { v4 as uuidv4 } from 'uuid';
import { 
  CONSTRUCTION_ERROR_CODES,
  ConstructionErrorCode,
  ConstructionErrorResponse,
  ERROR_CATEGORIES,
  ERROR_SEVERITY,
  RECOVERY_STRATEGY
} from './errorTypes';

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
    return createErrorResponse('SY-001', { 
      message: `Unknown error code: ${errorCode}`,
      technicalDetails: `Attempted to use undefined error code: ${errorCode}`
    });
  }
  
  // Create the response with mutable arrays
  const response: ConstructionErrorResponse = {
    ...baseError,
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    technicalDetails: additionalDetails?.technicalDetails || '',
    location: additionalDetails?.location || '',
    userGuidance: additionalDetails?.userGuidance || baseError.userGuidance || '',
    // Ensure these are always proper arrays, not readonly
    requiredRoles: [...(baseError.requiredRoles || [])],
    relatedRegulations: [...(baseError.relatedRegulations || [])],
    ...additionalDetails
  };
  
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
  
  return response;
};
