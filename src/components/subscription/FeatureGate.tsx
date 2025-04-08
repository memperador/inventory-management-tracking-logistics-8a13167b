
import React, { ReactNode } from 'react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { UpgradePrompt } from './UpgradePrompt';
import { getUpgradePromptForFeature } from '@/utils/subscriptionUtils';

interface FeatureGateProps {
  featureKey: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  className?: string;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  featureKey,
  children,
  fallback,
  showUpgradePrompt = true,
  className = ''
}) => {
  const { canAccessFeature } = useFeatureAccess();
  
  const hasAccess = canAccessFeature(featureKey);
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  // If fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // If showUpgradePrompt is true and no fallback is provided, show upgrade prompt
  if (showUpgradePrompt) {
    const upgradeInfo = getUpgradePromptForFeature(featureKey);
    
    if (upgradeInfo) {
      return (
        <div className={className}>
          <UpgradePrompt
            title={upgradeInfo.title}
            description={upgradeInfo.description}
            requiredTier={upgradeInfo.requiredTier}
          />
        </div>
      );
    }
  }
  
  // Fallback to null if nothing else is specified
  return null;
};
