
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: string | null;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md flex items-center">
      <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
      {error}
    </div>
  );
};

export default ErrorDisplay;
