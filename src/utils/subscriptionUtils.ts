
import { Tenant } from '@/types/tenant';

export type FeatureAccessLevel = 'basic' | 'standard' | 'premium' | 'enterprise';

// Features and their required subscription tiers
export const FEATURE_ACCESS_MAP: Record<string, FeatureAccessLevel> = {
  // Basic tier features
  'inventory_management': 'basic',
  'qr_codes': 'basic',
  'basic_alerts': 'basic',
  'simple_analytics': 'basic',
  'basic_ai_assistant': 'basic',
  
  // Standard tier features
  'gps_tracking': 'standard',
  'audit_logs': 'standard',
  'advanced_alerts': 'standard',
  'bulk_qr': 'standard',
  'location_history': 'standard',
  'standard_ai_assistant': 'standard',
  'tracking_insights': 'standard',
  'route_suggestions': 'standard',
  
  // Premium tier features
  'advanced_gps': 'premium',
  'geofencing': 'premium',
  'route_optimization': 'premium',
  'premium_analytics': 'premium',
  'gps_intelligence': 'premium',
  'premium_ai_assistant': 'premium',
  'predictive_maintenance': 'premium',
  'custom_ai_queries': 'premium',
  
  // Enterprise tier features
  'white_labeling': 'enterprise',
  'sso_integration': 'enterprise',
  'custom_api': 'enterprise',
  'dedicated_support': 'enterprise',
  'custom_implementation': 'enterprise',
  'sla_guarantees': 'enterprise'
};

// AI assistant features by tier
export const AI_ASSISTANT_FEATURES: Record<FeatureAccessLevel, string[]> = {
  'basic': [
    'Inventory management assistance',
    'Basic stock level recommendations',
    'Simple maintenance scheduling'
  ],
  'standard': [
    'All basic features',
    'Equipment location tracking insights',
    'Maintenance optimization based on usage',
    'Audit pattern recognition'
  ],
  'premium': [
    'All standard features',
    'Predictive maintenance AI',
    'Route optimization recommendations',
    'Advanced asset utilization analysis',
    'Cross-project resource allocation'
  ],
  'enterprise': [
    'All premium features',
    'Custom AI model training',
    'Integration with enterprise systems',
    'Advanced predictive analytics',
    'Custom data sources integration',
    'Organization-wide intelligence'
  ]
};

// Models used by the AI assistant for different tiers
export const AI_ASSISTANT_MODELS: Record<FeatureAccessLevel, string> = {
  'basic': 'llama-3.1-sonar-small-128k-online', // 8B parameter model
  'standard': 'llama-3.1-sonar-small-128k-online', // Same model with enhanced context
  'premium': 'llama-3.1-sonar-large-128k-online', // 70B parameter model
  'enterprise': 'llama-3.1-sonar-large-128k-online' // 70B parameter model with custom fine-tuning
};

// Subscription tier limits
export const SUBSCRIPTION_TIER_LIMITS: Record<FeatureAccessLevel, {assets: number | string, users: number | string}> = {
  'basic': { assets: 25, users: 3 },
  'standard': { assets: 75, users: 10 },
  'premium': { assets: 500, users: 25 },
  'enterprise': { assets: 'Unlimited', users: 'Unlimited' }
};

// Check if user has access to a specific feature
export const hasFeatureAccess = (
  tenant: Tenant | null, 
  featureKey: string
): boolean => {
  if (!tenant || !tenant.subscription_tier) return false;
  
  const requiredTier = FEATURE_ACCESS_MAP[featureKey];
  if (!requiredTier) return false;
  
  const tierHierarchy: Record<FeatureAccessLevel, number> = {
    'basic': 1,
    'standard': 2,
    'premium': 3,
    'enterprise': 4
  };
  
  const userTierLevel = tierHierarchy[tenant.subscription_tier as FeatureAccessLevel] || 0;
  const requiredTierLevel = tierHierarchy[requiredTier];
  
  return userTierLevel >= requiredTierLevel;
};

// Function to get upgrade prompt for a feature
export const getUpgradePromptForFeature = (
  featureKey: string
): { title: string; description: string; requiredTier: FeatureAccessLevel } | null => {
  const requiredTier = FEATURE_ACCESS_MAP[featureKey];
  if (!requiredTier) return null;
  
  const promptMap: Record<string, { title: string; description: string }> = {
    // Standard tier features
    'gps_tracking': {
      title: 'Upgrade to Standard for GPS Tracking',
      description: 'Track equipment location in real-time and view movement history.'
    },
    'audit_logs': {
      title: 'Unlock Detailed Audit Logs',
      description: 'See who changed what and when with comprehensive audit trails.'
    },
    'advanced_alerts': {
      title: 'Get Advanced Alert Features',
      description: 'Set up custom triggers and notification rules for your equipment.'
    },
    'bulk_qr': {
      title: 'Enable Bulk QR Generation',
      description: 'Generate and print multiple QR codes at once for faster inventory processing.'
    },
    'standard_ai_assistant': {
      title: 'Upgrade to Standard AI Assistant',
      description: 'Get enhanced AI capabilities with GPS tracking insights and route suggestions.'
    },
    
    // Premium tier features
    'advanced_gps': {
      title: 'Upgrade to Premium for Advanced GPS',
      description: 'Get detailed GPS analytics, custom reporting, and historical tracking.'
    },
    'geofencing': {
      title: 'Add Geofencing Capabilities',
      description: 'Set up virtual boundaries and get alerts when equipment crosses them.'
    },
    'route_optimization': {
      title: 'Enable Route Optimization',
      description: 'Let AI find the most efficient routes for your equipment transportation.'
    },
    'gps_intelligence': {
      title: 'Access GPS Intelligence',
      description: 'Get advanced insights and recommendations based on location data.'
    },
    'premium_ai_assistant': {
      title: 'Upgrade to Premium AI Assistant',
      description: 'Access our most powerful AI model with advanced asset management insights, predictive maintenance, and custom analysis.'
    },
    'predictive_maintenance': {
      title: 'Enable Predictive Maintenance',
      description: 'Let AI predict when your equipment needs maintenance based on usage patterns and historical data.'
    },
    'custom_ai_queries': {
      title: 'Access Custom AI Queries',
      description: 'Ask complex questions about your assets and get detailed, data-driven responses from our most advanced AI.'
    },
    
    // Enterprise tier features
    'white_labeling': {
      title: 'Upgrade to Enterprise for White Labeling',
      description: 'Remove our branding and replace it with your own company branding.'
    },
    'sso_integration': {
      title: 'Enable Single Sign-On Integration',
      description: 'Integrate with your company\'s SSO system for seamless authentication.'
    },
    'custom_api': {
      title: 'Get Custom API Access',
      description: 'Access our API with custom endpoints tailored to your organization\'s needs.'
    },
    'dedicated_support': {
      title: 'Get Dedicated Support',
      description: 'Work with a dedicated account manager and receive priority support.'
    },
    'custom_implementation': {
      title: 'Custom Implementation Services',
      description: 'Get personalized onboarding and implementation services tailored to your organization.'
    },
    'sla_guarantees': {
      title: 'Service Level Agreement',
      description: 'Get guaranteed response times and uptime commitments.'
    }
  };
  
  const prompt = promptMap[featureKey];
  if (!prompt) return null;
  
  return {
    ...prompt,
    requiredTier
  };
};

// Get all features available for a specific subscription tier
export const getAvailableFeaturesForTier = (tier: FeatureAccessLevel | null): string[] => {
  if (!tier) return [];
  
  const tierHierarchy: Record<FeatureAccessLevel, number> = {
    'basic': 1,
    'standard': 2,
    'premium': 3,
    'enterprise': 4
  };
  
  const userTierLevel = tierHierarchy[tier] || 0;
  
  return Object.entries(FEATURE_ACCESS_MAP)
    .filter(([_, requiredTier]) => {
      const requiredTierLevel = tierHierarchy[requiredTier];
      return userTierLevel >= requiredTierLevel;
    })
    .map(([featureKey, _]) => featureKey);
};

// Get the limits for a specific subscription tier
export const getSubscriptionTierLimits = (tier: FeatureAccessLevel | null) => {
  if (!tier || !SUBSCRIPTION_TIER_LIMITS[tier]) {
    return { assets: 0, users: 0 };
  }
  return SUBSCRIPTION_TIER_LIMITS[tier];
};
