
import React from 'react';

interface LoadingIndicatorProps {
  message?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message = "Loading..." }) => {
  return (
    <div className="py-8 text-center">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-inventory-blue border-t-transparent mb-2"></div>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
};

export default LoadingIndicator;
