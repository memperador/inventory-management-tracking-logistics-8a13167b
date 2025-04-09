
import React from 'react';

interface DebugInfoDisplayProps {
  debugInfo: string | null;
  resendError: string | null;
}

const DebugInfoDisplay: React.FC<DebugInfoDisplayProps> = ({ debugInfo, resendError }) => {
  if (!debugInfo && !resendError) return null;
  
  return (
    <>
      {debugInfo && (
        <div className="mt-2 text-xs bg-yellow-100 p-2 rounded border border-yellow-300">
          <p className="font-medium">Email status: {debugInfo}</p>
        </div>
      )}
      
      {resendError && (
        <div className="mt-2 text-xs bg-red-50 p-2 rounded border border-red-200">
          <p className="font-medium text-red-700">Error: {resendError}</p>
        </div>
      )}
    </>
  );
};

export default DebugInfoDisplay;
