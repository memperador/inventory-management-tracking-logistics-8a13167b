
import React from 'react';

interface UpgradeNoticeProps {
  currentTier?: string;
}

export const UpgradeNotice: React.FC<UpgradeNoticeProps> = ({ currentTier }) => {
  if (!currentTier) return null;
  
  return (
    <div className="mb-4 p-3 bg-amber-50 text-amber-800 rounded border border-amber-200">
      <p className="text-sm">
        <strong>Upgrading from {currentTier}:</strong> You'll be charged a prorated 
        amount for the remainder of the current billing cycle.
      </p>
    </div>
  );
};
