
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createErrorResponse, handleError } from '@/utils/errorHandling/errorService';
import { ERROR_CATEGORIES } from '@/utils/errorHandling/errorTypes';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  errorCategory?: keyof typeof ERROR_CATEGORIES;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error with our error service
    const errorResponse = createErrorResponse('SY-001', {
      message: `Component error: ${error.message}`,
      technicalDetails: errorInfo.componentStack,
      location: this.constructor.name,
      category: this.props.errorCategory ? ERROR_CATEGORIES[this.props.errorCategory] : ERROR_CATEGORIES.SYSTEM,
    });
    
    handleError(errorResponse, { throwError: false });
    
    // Update state with error info
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <div className="p-4 border border-destructive rounded-md bg-destructive/10">
          <h2 className="text-lg font-semibold text-destructive mb-2">Something went wrong</h2>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-destructive/80">
              {this.state.error?.name || 'Error'}
            </span>
            <button 
              onClick={this.handleReset}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Try to recover
            </button>
          </div>
          <details className="text-sm">
            <summary>View error details</summary>
            <p className="mt-2 font-mono text-xs p-2 bg-black/5 rounded">
              {this.state.error?.toString()}
            </p>
            {this.state.errorInfo && (
              <pre className="mt-2 font-mono text-xs p-2 bg-black/5 rounded overflow-x-auto max-h-[300px]">
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
