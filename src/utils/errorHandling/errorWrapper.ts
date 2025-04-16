
import React from 'react';
import { ConstructionErrorCode, ConstructionErrorResponse, ERROR_CATEGORIES, ERROR_SEVERITY, RECOVERY_STRATEGY } from './errorTypes';
import { createErrorResponse, createCustomErrorResponse } from './createError';
import { handleError } from './handleError';

/**
 * Creates a wrapper function that catches errors and handles them
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    errorCode?: ConstructionErrorCode;
    category?: keyof typeof ERROR_CATEGORIES;
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
      const errorResponse = options.errorCode 
        ? createErrorResponse(options.errorCode, { 
            location: options.location,
            technicalDetails: error instanceof Error ? error.message : String(error)
          })
        : createCustomErrorResponse({
            message: error instanceof Error ? error.message : 'An error occurred',
            category: options.category ? ERROR_CATEGORIES[options.category] : ERROR_CATEGORIES.SYSTEM,
            location: options.location,
            technicalDetails: error instanceof Error ? error.stack : String(error),
            recoveryStrategy: options.retryable ? RECOVERY_STRATEGY.AUTO_RETRY : RECOVERY_STRATEGY.NOTIFY
          });
      
      handleError(errorResponse, {
        showToast: options.showToast,
        throwError: true,
        retryFn: options.retryable ? () => fn(...args) : undefined,
        maxRetries: options.maxRetries
      });
      
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
