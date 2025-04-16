
import { UpgradePrompt, FeatureAccessLevel } from './types';

// Map feature keys to their upgrade prompts
const UPGRADE_PROMPTS: Record<string, UpgradePrompt> = {
  // Standard tier features
  'gps_tracking': {
    title: 'GPS Tracking',
    description: 'Track your equipment in real-time with our GPS tracking feature.',
    requiredTier: 'standard'
  },
  'advanced_alerts': {
    title: 'Advanced Alerts',
    description: 'Get notified instantly when equipment status changes or requires attention.',
    requiredTier: 'standard'
  },
  'audit_logs': {
    title: 'Audit Logs',
    description: 'Detailed logs of all actions taken on your equipment.',
    requiredTier: 'standard'
  },
  
  // Premium tier features
  'geofencing': {
    title: 'Geofencing',
    description: 'Set up virtual boundaries and get notified when equipment crosses them.',
    requiredTier: 'premium'
  },
  'route_optimization': {
    title: 'Route Optimization',
    description: 'Find the most efficient routes for your equipment and teams.',
    requiredTier: 'premium'
  },
  'premium_analytics': {
    title: 'Premium Analytics',
    description: 'Advanced analytics and insights for your equipment and projects.',
    requiredTier: 'premium'
  },
  'premium_ai_assistant': {
    title: 'Premium AI Assistant',
    description: 'Access advanced AI capabilities for equipment management.',
    requiredTier: 'premium'
  },
  
  // Enterprise tier features
  'white_labeling': {
    title: 'White Labeling',
    description: 'Brand the platform with your company logo and colors.',
    requiredTier: 'enterprise'
  },
  'sso_integration': {
    title: 'Single Sign-On',
    description: 'Integrate with your existing SSO provider.',
    requiredTier: 'enterprise'
  },
  'custom_api': {
    title: 'Custom API Access',
    description: 'Build custom integrations using our API.',
    requiredTier: 'enterprise'
  }
};

/**
 * Get an upgrade prompt for a feature
 */
export const getUpgradePromptForFeature = (featureKey: string): UpgradePrompt | null => {
  return UPGRADE_PROMPTS[featureKey] || null;
};

/**
 * Get all upgrade prompts for a specific tier
 */
export const getUpgradePromptsForTier = (tier: FeatureAccessLevel): UpgradePrompt[] => {
  const tierHierarchy: Record<FeatureAccessLevel, number> = {
    'basic': 1,
    'standard': 2,
    'premium': 3,
    'enterprise': 4
  };
  
  const targetTierLevel = tierHierarchy[tier];
  
  return Object.values(UPGRADE_PROMPTS).filter(prompt => {
    const promptTierLevel = tierHierarchy[prompt.requiredTier];
    return promptTierLevel === targetTierLevel;
  });
};
