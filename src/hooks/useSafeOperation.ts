
import { useState, useCallback } from 'react';
import useErrorHandling from './useErrorHandling';
import { ConstructionErrorCode } from '@/utils/errorHandling/errorTypes';

/**
 * This hook provides a safe pattern for executing operations that might fail,
 * with automatic error handling, retry capabilities, and loading state management
 */
export function useSafeOperation<T = any, E = unknown>(options: {
  errorCode?: ConstructionErrorCode;
  componentName?: string;
  retryable?: boolean;
  maxRetries?: number;
  showErrors?: boolean;
} = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<T | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { errorCode, componentName, retryable = true, maxRetries = 3, showErrors = true } = options;
  
  const { error, isError, errorMessage, clearError, handleError } = useErrorHandling({
    defaultErrorCode: errorCode || 'SY-001',
    componentName,
    showToast: showErrors
  });
  
  /**
   * Execute an operation safely with automatic error handling
   */
  const execute = useCallback(async <R = T>(
    operation: () => Promise<R>, 
    customOptions: {
      onSuccess?: (data: R) => void;
      onError?: (error: E) => void;
      showLoading?: boolean;
      errorCode?: ConstructionErrorCode;
    } = {}
  ): Promise<R | null> => {
    const { 
      onSuccess, 
      onError, 
      showLoading = true,
      errorCode: customErrorCode
    } = customOptions;
    
    // Reset state
    clearError();
    
    if (showLoading) {
      setIsLoading(true);
    }
    
    try {
      const data = await operation();
      setResult(data as unknown as T);
      if (onSuccess) {
        onSuccess(data);
      }
      return data;
    } catch (error) {
      const errorData = error as E;
      
      if (onError) {
        onError(errorData);
      }
      
      // Handle the error with our error system
      handleError(error, {
        errorCode: customErrorCode || errorCode,
        throwError: false
      });
      
      // Implement retry logic if enabled
      if (retryable && retryCount < maxRetries) {
        setRetryCount(prevCount => prevCount + 1);
        
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        
        console.log(`Retrying operation in ${delay}ms (attempt ${retryCount + 1} of ${maxRetries})...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return execute(operation, customOptions);
      }
      
      return null;
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [handleError, clearError, retryCount, maxRetries, retryable, errorCode]);
  
  /**
   * Reset the retry count
   */
  const resetRetries = useCallback(() => {
    setRetryCount(0);
  }, []);
  
  /**
   * Manually retry the last operation
   */
  const retry = useCallback(() => {
    setRetryCount(0);
  }, []);
  
  return {
    isLoading,
    result,
    error,
    isError,
    errorMessage,
    execute,
    clearError,
    retryCount,
    resetRetries,
    retry
  };
}

export default useSafeOperation;
