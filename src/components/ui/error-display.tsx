
import React from 'react';
import { AlertTriangle, AlertCircle, AlertOctagon, Info, HelpCircle } from 'lucide-react';
import { ERROR_SEVERITY } from '@/utils/errorHandling/errorTypes';
import { getSeverityLabel } from '@/utils/errorHandling/errorService';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  details?: string | React.ReactNode;
  severity?: keyof typeof ERROR_SEVERITY;
  code?: string;
  className?: string;
  guidance?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorDisplay({
  title,
  message,
  details,
  severity = 'MEDIUM',
  code,
  className,
  guidance,
  onRetry,
  onDismiss
}: ErrorDisplayProps) {
  const iconMap = {
    CRITICAL: <AlertOctagon className="h-5 w-5 text-destructive" />,
    HIGH: <AlertCircle className="h-5 w-5 text-destructive" />,
    MEDIUM: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    LOW: <Info className="h-5 w-5 text-blue-500" />,
    INFO: <HelpCircle className="h-5 w-5 text-gray-500" />
  };

  const bgColorMap = {
    CRITICAL: 'bg-destructive/10 border-destructive',
    HIGH: 'bg-destructive/10 border-destructive/70',
    MEDIUM: 'bg-amber-50 border-amber-200',
    LOW: 'bg-blue-50 border-blue-200',
    INFO: 'bg-gray-50 border-gray-200'
  };

  return (
    <div className={cn(
      'rounded-md border p-4',
      bgColorMap[severity],
      className
    )}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {iconMap[severity]}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {title || getSeverityLabel(ERROR_SEVERITY[severity])}
            {code && <span className="ml-2 text-xs font-mono">[{code}]</span>}
          </h3>
          <div className="mt-1 text-sm">
            <p>{message}</p>
            
            {guidance && (
              <div className="mt-1 p-2 bg-white bg-opacity-50 rounded text-xs">
                <strong>Guidance:</strong> {guidance}
              </div>
            )}
          </div>
          
          {details && (
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer text-xs">View technical details</summary>
              <div className="mt-1 p-2 bg-black/5 rounded font-mono whitespace-pre-wrap overflow-x-auto">
                {details}
              </div>
            </details>
          )}
          
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex gap-2">
              {onRetry && (
                <button 
                  onClick={onRetry}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Retry
                </button>
              )}
              {onDismiss && (
                <button 
                  onClick={onDismiss}
                  className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
