
import { useCallback, useState } from 'react';
import { createErrorResponse, createCustomErrorResponse, handleError } from '@/utils/errorHandling/errorService';
import { ERROR_CATEGORIES, ConstructionErrorCode, ConstructionErrorResponse } from '@/utils/errorHandling/errorTypes';

interface UseErrorHandlingOptions {
  defaultErrorCode?: ConstructionErrorCode;
  showToast?: boolean;
  componentName?: string;
  category?: keyof typeof ERROR_CATEGORIES;
}

export function useErrorHandling(options: UseErrorHandlingOptions = {}) {
  const {
    defaultErrorCode = 'SY-001',
    showToast = true,
    componentName,
    category = 'SYSTEM'
  } = options;
  
  const [error, setError] = useState<ConstructionErrorResponse | null>(null);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const clearError = useCallback(() => {
    setError(null);
    setIsError(false);
    setErrorMessage(null);
  }, []);
  
  const handleComponentError = useCallback((
    err: unknown,
    options: {
      errorCode?: ConstructionErrorCode;
      message?: string;
      showToast?: boolean;
      throwError?: boolean;
      fallbackUI?: boolean;
    } = {}
  ) => {
    const {
      errorCode = defaultErrorCode,
      message,
      showToast: showToastOverride = showToast,
      throwError = false,
      fallbackUI = true
    } = options;
    
    // Extract the error message
    const errorMessage = 
      message || 
      (err instanceof Error ? err.message : 
      (typeof err === 'string' ? err : 'An unknown error occurred'));
      
    // Extract stack trace if available
    const stackTrace = err instanceof Error ? err.stack : undefined;
    
    // Create a structured error response
    const errorResponse = errorCode
      ? createErrorResponse(errorCode, {
          message: errorMessage,
          technicalDetails: stackTrace || String(err),
          location: componentName || 'unknown'
        })
      : createCustomErrorResponse({
          message: errorMessage,
          category: ERROR_CATEGORIES[category],
          technicalDetails: stackTrace || String(err),
          location: componentName || 'unknown',
        });
    
    // Handle the error
    handleError(errorResponse, { 
      showToast: showToastOverride,
      throwError 
    });
    
    // Set state for UI display
    if (fallbackUI) {
      setError(errorResponse);
      setIsError(true);
      setErrorMessage(errorMessage);
    }
    
    // Return the error response for further handling
    return errorResponse;
  }, [defaultErrorCode, showToast, componentName, category]);
  
  // Wraps an async function with error handling
  const wrapAsync = useCallback(<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    options: {
      errorCode?: ConstructionErrorCode;
      showToast?: boolean;
      throwError?: boolean;
      fallbackUI?: boolean;
      message?: string;
    } = {}
  ): ((...args: Parameters<T>) => Promise<ReturnType<T> | undefined>) => {
    return async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
      try {
        clearError();
        return await fn(...args);
      } catch (err) {
        handleComponentError(err, options);
        return undefined;
      }
    };
  }, [handleComponentError, clearError]);
  
  return {
    error,
    isError,
    errorMessage,
    clearError,
    handleError: handleComponentError,
    wrapAsync
  };
}

export default useErrorHandling;
