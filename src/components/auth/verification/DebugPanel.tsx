
import React from 'react';

interface DebugPanelProps {
  manualResendDebug: string | null;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ manualResendDebug }) => {
  if (!manualResendDebug) {
    return null;
  }
  
  return (
    <div className="mt-3 p-2 bg-yellow-100 rounded text-xs border border-yellow-300 whitespace-pre-line">
      <p className="font-medium">Debug log:</p>
      <p className="overflow-auto max-h-24">{manualResendDebug}</p>
    </div>
  );
};

export default DebugPanel;
