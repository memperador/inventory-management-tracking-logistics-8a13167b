
import { UpgradePrompt, FeatureAccessLevel } from './types';
import { FEATURE_ACCESS_MAP } from './featureMap';

// Function to get upgrade prompt for a feature
export const getUpgradePromptForFeature = (
  featureKey: string
): UpgradePrompt | null => {
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
