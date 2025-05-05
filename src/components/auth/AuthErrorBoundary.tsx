
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { useAuth } from '@/contexts/auth/AuthContext';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AuthErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logAuth('AUTH-ERROR-BOUNDARY', 'Authentication component error:', {
      level: AUTH_LOG_LEVELS.ERROR,
      data: {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      }
    });
    
    toast({
      title: 'Authentication Error',
      description: 'There was a problem with the authentication system. Please try again or contact support.',
      variant: 'destructive',
    });
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border rounded-md border-destructive bg-destructive/10 text-destructive">
          <h2 className="text-lg font-semibold mb-2">Authentication Error</h2>
          <p className="text-sm mb-4">
            There was a problem with the authentication system.
          </p>
          <div className="flex gap-2">
            <button
              onClick={this.resetErrorBoundary}
              className="px-3 py-1 text-sm bg-background border rounded-md hover:bg-accent"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/auth'}
              className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Create a wrapper with hooks
export const AuthErrorBoundary: React.FC<ErrorBoundaryProps> = (props) => {
  // You can use hooks here if needed
  return <AuthErrorBoundaryClass {...props} />;
};

// Create a HOC for easy wrapping of auth components
export function withAuthErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
): React.FC<P> {
  return (props: P) => (
    <AuthErrorBoundary fallback={fallback}>
      <Component {...props} />
    </AuthErrorBoundary>
  );
}
