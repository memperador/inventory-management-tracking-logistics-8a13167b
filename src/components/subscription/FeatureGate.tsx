
import React, { ReactNode } from 'react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { UpgradePrompt } from './UpgradePrompt';
import { getUpgradePromptForFeature } from '@/utils/subscriptionUtils';
import { FeatureTierBadge } from './FeatureTierBadge';
import { useTenant } from '@/contexts/TenantContext';

interface FeatureGateProps {
  featureKey: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  showTierBadge?: boolean;
  className?: string;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  featureKey,
  children,
  fallback,
  showUpgradePrompt = true,
  showTierBadge = true,
  className = ''
}) => {
  const { checkFeatureAccess, getFeatureTier, isTrialMode } = useFeatureAccess();
  const { currentTenant } = useTenant();
  
  const hasAccess = checkFeatureAccess(featureKey);
  
  // Get the tier this feature belongs to
  const featureTier = getFeatureTier(featureKey);
  
  if (hasAccess) {
    // If the user has access and we should show tier badge (trial mode)
    if (showTierBadge && isTrialMode && featureTier) {
      return (
        <div className="relative">
          <div className="absolute top-2 right-2 z-10">
            <FeatureTierBadge tier={featureTier} isTrialMode={true} />
          </div>
          {children}
        </div>
      );
    }
    
    // Otherwise just show the content
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
