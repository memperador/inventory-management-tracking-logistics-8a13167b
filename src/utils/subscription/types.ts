
// Define all subscription-related types in this file
export type FeatureAccessLevel = 'basic' | 'standard' | 'premium' | 'enterprise';

// Feature to tier mapping interface
export interface FeatureAccessMap {
  [key: string]: FeatureAccessLevel;
}

// AI assistant features by tier interface
export interface AIAssistantFeaturesMap {
  [key in FeatureAccessLevel]: string[];
}

// AI assistant models by tier interface
export interface AIAssistantModelsMap {
  [key in FeatureAccessLevel]: string;
}

// Subscription tier limits interface
export interface SubscriptionTierLimit {
  assets: number | string;
  users: number | string;
}

export interface SubscriptionTierLimitsMap {
  [key in FeatureAccessLevel]: SubscriptionTierLimit;
}

// Upgrade prompt interface
export interface UpgradePrompt {
  title: string;
  description: string;
  requiredTier: FeatureAccessLevel;
}
