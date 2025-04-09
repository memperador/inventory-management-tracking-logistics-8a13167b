
import React from 'react';

interface LastDeliveryResultProps {
  lastDeliveryResult: {
    timestamp: string;
    email: string;
    success: boolean;
    message: string;
  } | null;
  currentEmail: string;
}

const LastDeliveryResult: React.FC<LastDeliveryResultProps> = ({ lastDeliveryResult, currentEmail }) => {
  if (!lastDeliveryResult || lastDeliveryResult.email !== currentEmail) {
    return null;
  }
  
  return (
    <div className="mt-3 p-2 bg-yellow-100 rounded text-xs border border-yellow-300">
      <p className="font-medium">Last email delivery attempt:</p>
      <p>Time: {new Date(lastDeliveryResult.timestamp).toLocaleString()}</p>
      <p>Status: {lastDeliveryResult.success ? '✅ Success' : '❌ Failed'}</p>
      {!lastDeliveryResult.success && (
        <p>Error: {lastDeliveryResult.message}</p>
      )}
    </div>
  );
};

export default LastDeliveryResult;
