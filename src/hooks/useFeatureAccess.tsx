
import { useAccessControl } from '@/hooks/subscription/useAccessControl';
import { useSubscriptionStatus } from '@/hooks/subscription/useSubscriptionStatus';
import { useSubscriptionLimits } from '@/hooks/subscription/useSubscriptionLimits';
import { useUpgradePrompt } from '@/hooks/subscription/useUpgradePrompt';
import { useFeatureTier } from '@/hooks/subscription/useFeatureTier';
import { FeatureAccessLevel } from '@/utils/subscriptionUtils';

export const useFeatureAccess = () => {
  const { canAccessFeature, hasSubscriptionTier, getAccessibleFeatures, getAvailableAIFeatures } = useAccessControl();
  const { hasActiveSubscription, isTrialMode, currentTier } = useSubscriptionStatus();
  const { getSubscriptionLimits, isUnderAssetLimit, isUnderUserLimit } = useSubscriptionLimits();
  const { promptUpgrade } = useUpgradePrompt();
  const { getFeatureTier } = useFeatureTier();

  return {
    canAccessFeature,
    getFeatureTier,
    hasSubscriptionTier,
    getAccessibleFeatures,
    getAvailableAIFeatures,
    promptUpgrade,
    getSubscriptionLimits,
    isUnderAssetLimit,
    isUnderUserLimit,
    hasActiveSubscription,
    currentTier,
    isTrialMode
  };
};
