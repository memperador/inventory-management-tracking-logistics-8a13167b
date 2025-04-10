
// Define all subscription-related types in this file
export type FeatureAccessLevel = 'basic' | 'standard' | 'premium' | 'enterprise';

// Feature to tier mapping interface
export interface FeatureAccessMap {
  [key: string]: FeatureAccessLevel;
}

// AI assistant features by tier interface
export interface AIAssistantFeaturesMap {
  basic: string[];
  standard: string[];
  premium: string[];
  enterprise: string[];
}

// AI assistant models by tier interface
export interface AIAssistantModelsMap {
  basic: string;
  standard: string;
  premium: string;
  enterprise: string;
}

// Subscription tier limits interface
export interface SubscriptionTierLimit {
  assets: number | string;
  users: number | string;
}

export interface SubscriptionTierLimitsMap {
  basic: SubscriptionTierLimit;
  standard: SubscriptionTierLimit;
  premium: SubscriptionTierLimit;
  enterprise: SubscriptionTierLimit;
}

// Upgrade prompt interface
export interface UpgradePrompt {
  title: string;
  description: string;
  requiredTier: FeatureAccessLevel;
}

// Trial status interface
export interface TrialStatus {
  isActive: boolean;
  daysRemaining: number;
  endDate: Date | null;
  trialTier: FeatureAccessLevel;
}
