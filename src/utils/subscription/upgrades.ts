
import { FeatureAccessLevel, UpgradePrompt } from './types';

// Feature to upgrade prompt mapping
const FEATURE_UPGRADE_MAP: Record<string, UpgradePrompt> = {
  // Standard tier features
  'gps_tracking': {
    title: 'GPS Tracking Available',
    description: 'Track equipment location in real-time with our Standard plan',
    requiredTier: 'standard'
  },
  'audit_logs': {
    title: 'Access Audit Logs',
    description: 'Track all equipment changes with detailed audit history',
    requiredTier: 'standard'
  },
  'advanced_alerts': {
    title: 'Advanced Alerts',
    description: 'Set up customizable alerts and notifications',
    requiredTier: 'standard'
  },
  'bulk_qr': {
    title: 'Bulk QR Code Generation',
    description: 'Generate multiple QR codes at once for efficient equipment tracking',
    requiredTier: 'standard'
  },
  'location_history': {
    title: 'Location History',
    description: 'View historical location data for all your equipment',
    requiredTier: 'standard'
  },
  
  // Premium tier features
  'advanced_gps': {
    title: 'Advanced GPS Features',
    description: 'Access geofencing, route optimization and more',
    requiredTier: 'premium'
  },
  'geofencing': {
    title: 'Geofencing',
    description: 'Set boundaries for your equipment and get alerts when they cross them',
    requiredTier: 'premium'
  },
  'route_optimization': {
    title: 'Route Optimization',
    description: 'Find the most efficient routes for your equipment',
    requiredTier: 'premium'
  },
  'premium_analytics': {
    title: 'Premium Analytics',
    description: 'Access advanced analytics and reporting features',
    requiredTier: 'premium'
  },
  'premium_ai': {
    title: 'Advanced AI Assistant',
    description: 'Get AI-powered insights and recommendations',
    requiredTier: 'premium'
  },
  
  // Enterprise tier features
  'white_labeling': {
    title: 'White Labeling',
    description: 'Customize the application with your own branding',
    requiredTier: 'enterprise'
  },
  'sso_integration': {
    title: 'SSO Integration',
    description: 'Integrate with your existing single sign-on solution',
    requiredTier: 'enterprise'
  },
  'custom_api': {
    title: 'Custom API Access',
    description: 'Build custom integrations with our API',
    requiredTier: 'enterprise'
  },
  'dedicated_support': {
    title: 'Dedicated Support',
    description: 'Get priority support from our dedicated team',
    requiredTier: 'enterprise'
  },
  'sla_guarantees': {
    title: 'SLA Guarantees',
    description: 'Service level agreement guarantees for enterprise customers',
    requiredTier: 'enterprise'
  }
};

// Get the upgrade prompt for a feature
export const getUpgradePromptForFeature = (featureKey: string): UpgradePrompt | null => {
  return FEATURE_UPGRADE_MAP[featureKey] || null;
};
