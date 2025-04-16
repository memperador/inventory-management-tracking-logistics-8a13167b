
/**
 * Construction industry specific error types
 */

// Construction industry specific error categories
export const ERROR_CATEGORIES = {
  SAFETY: 'SAFETY', // Safety violations or risks
  COMPLIANCE: 'COMPLIANCE', // Code/permit compliance issues
  EQUIPMENT: 'EQUIPMENT', // Equipment malfunctions
  WORKFLOW: 'WORKFLOW', // Process/workflow errors
  COMMUNICATION: 'COMMUNICATION', // Team communication errors
  SYSTEM: 'SYSTEM', // Application system errors
  SECURITY: 'SECURITY', // Security violations
  AUTH: 'AUTH', // Authentication errors
} as const;

// Error severity levels aligned with construction industry standards
export const ERROR_SEVERITY = {
  CRITICAL: 'CRITICAL', // Immediate action required (safety/compliance)
  HIGH: 'HIGH', // Urgent attention needed
  MEDIUM: 'MEDIUM', // Should be addressed soon
  LOW: 'LOW', // Minor issue
  INFO: 'INFO', // Informational only
} as const;

// Recovery strategies
export const RECOVERY_STRATEGY = {
  AUTO_RETRY: 'AUTO_RETRY', // Automatically retry the operation
  MANUAL_INTERVENTION: 'MANUAL_INTERVENTION', // Requires human intervention
  FALLBACK: 'FALLBACK', // Use fallback/default values
  ABORT: 'ABORT', // Abort operation entirely
  NOTIFY: 'NOTIFY', // Just notify, no recovery needed
} as const;

// Construction-specific error response requirements
export interface ConstructionErrorResponse {
  id: string; // Unique error identifier
  timestamp: string; // When error occurred
  category: typeof ERROR_CATEGORIES[keyof typeof ERROR_CATEGORIES];
  severity: typeof ERROR_SEVERITY[keyof typeof ERROR_SEVERITY]; 
  code: string; // Error code (e.g., "EQ-001", "SF-201")
  message: string; // User-friendly message
  technicalDetails?: string; // Technical details for developers
  location?: string; // Where error occurred (component, function)
  recoveryStrategy: typeof RECOVERY_STRATEGY[keyof typeof RECOVERY_STRATEGY];
  userGuidance?: string; // Instructions for user to resolve
  shouldLog: boolean; // Should this be logged
  shouldAlert: boolean; // Should this generate alert notification
  requiredRoles?: string[]; // Roles that need to be notified (e.g., 'safety-officer')
  relatedRegulations?: string[]; // Related construction codes/regulations
}

// Define the error codes with complete types (making sure each has all required fields)
export const CONSTRUCTION_ERROR_CODES = {
  // Safety error codes (SF)
  'SF-001': {
    code: 'SF-001',
    category: ERROR_CATEGORIES.SAFETY,
    message: 'Mandatory safety check failed',
    severity: ERROR_SEVERITY.CRITICAL,
    recoveryStrategy: RECOVERY_STRATEGY.MANUAL_INTERVENTION,
    shouldLog: true,
    shouldAlert: true,
    userGuidance: 'Contact safety officer immediately for a manual intervention.',
    requiredRoles: ['safety-officer', 'site-manager'],
    relatedRegulations: ['OSHA 1926.20(b)(2)']
  },
  
  // Compliance error codes (CP)
  'CP-001': {
    code: 'CP-001',
    category: ERROR_CATEGORIES.COMPLIANCE,
    message: 'Missing required permit for operation',
    severity: ERROR_SEVERITY.HIGH,
    recoveryStrategy: RECOVERY_STRATEGY.MANUAL_INTERVENTION,
    shouldLog: true,
    shouldAlert: true,
    userGuidance: 'Contact compliance manager to acquire the required permit.',
    requiredRoles: ['compliance-manager', 'site-manager'],
    relatedRegulations: ['IBC 105.1']
  },
  
  // Equipment error codes (EQ)
  'EQ-001': {
    code: 'EQ-001',
    category: ERROR_CATEGORIES.EQUIPMENT,
    message: 'Equipment allocation failed',
    severity: ERROR_SEVERITY.MEDIUM,
    recoveryStrategy: RECOVERY_STRATEGY.FALLBACK,
    shouldLog: true,
    shouldAlert: false,
    userGuidance: 'Try allocating alternative equipment or reschedule the task.',
    requiredRoles: [],
    relatedRegulations: []
  },
  
  // Workflow error codes (WF)
  'WF-001': {
    code: 'WF-001',
    category: ERROR_CATEGORIES.WORKFLOW,
    message: 'Workflow sequence violation',
    severity: ERROR_SEVERITY.MEDIUM,
    recoveryStrategy: RECOVERY_STRATEGY.MANUAL_INTERVENTION,
    shouldLog: true,
    shouldAlert: true,
    userGuidance: 'Review workflow requirements and correct the sequence.',
    requiredRoles: ['project-manager'],
    relatedRegulations: []
  },
  
  // System error codes (SY)
  'SY-001': {
    code: 'SY-001',
    category: ERROR_CATEGORIES.SYSTEM,
    message: 'Application error',
    severity: ERROR_SEVERITY.MEDIUM,
    recoveryStrategy: RECOVERY_STRATEGY.AUTO_RETRY,
    shouldLog: true,
    shouldAlert: false,
    userGuidance: 'The system will attempt to recover automatically.',
    requiredRoles: [],
    relatedRegulations: []
  },
  
  // Authentication error codes (AU)
  'AU-001': {
    code: 'AU-001',
    category: ERROR_CATEGORIES.AUTH,
    message: 'Authentication error',
    severity: ERROR_SEVERITY.HIGH,
    recoveryStrategy: RECOVERY_STRATEGY.FALLBACK,
    shouldLog: true,
    shouldAlert: true,
    userGuidance: 'Please try to log in again or contact support.',
    requiredRoles: [],
    relatedRegulations: []
  },
  
  // Auth loop protection
  'AU-002': {
    code: 'AU-002',
    category: ERROR_CATEGORIES.AUTH,
    message: 'Authentication loop detected',
    severity: ERROR_SEVERITY.HIGH,
    recoveryStrategy: RECOVERY_STRATEGY.FALLBACK,
    shouldLog: true,
    shouldAlert: true,
    userGuidance: 'The system detected a login loop. Emergency authentication has been activated.'
  }
} as const;

// Type for error code keys
export type ConstructionErrorCode = keyof typeof CONSTRUCTION_ERROR_CODES;
