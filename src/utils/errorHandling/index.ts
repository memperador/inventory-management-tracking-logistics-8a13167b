
export * from './createError';
export * from './errorTypes';
export * from './errorWrapper';
export * from './uiUtils';

// Export from handleError
export { 
  handleError,
  getErrorHistory,
  filterErrors,
  clearErrorHistory
} from './handleError';

// Export from errorService for backward compatibility
export { 
  getSeverityLabel,
  mapSeverityToVariant,
  mapSeverityToDuration,
  withErrorHandling,
  withComponentErrorBoundary
} from './errorService';
