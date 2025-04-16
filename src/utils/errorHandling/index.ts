
export * from './createError';
export * from './errorTypes';
export * from './errorWrapper';
export * from './uiUtils';

// Export from errorService instead of re-exporting from both files
export { 
  handleError,
  createErrorResponse, 
  createCustomErrorResponse,
  getErrorHistory,
  filterErrors,
  withErrorHandling,
  withComponentErrorBoundary,
  getSeverityLabel,
  mapSeverityToVariant,
  mapSeverityToDuration
} from './errorService';
