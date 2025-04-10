
import { FeatureAccessLevel } from '@/utils/subscriptionUtils';

export const useFeatureTier = () => {
  // Get the tier that a feature belongs to
  const getFeatureTier = (featureKey: string): FeatureAccessLevel | null => {
    // Feature to tier mapping
    const featureTierMap: Record<string, FeatureAccessLevel> = {
      // Basic tier features
      'equipment': 'basic',
      'projects': 'basic',
      'inventory_management': 'basic',
      'basic_analytics': 'basic',
      'simple_alerts': 'basic',
      'qr_generation': 'basic',
      
      // Standard tier features
      'gps': 'standard',
      'gps_tracking': 'standard',
      'audit_logs': 'standard',
      'advanced_alerts': 'standard',
      'bulk_qr': 'standard',
      'location_history': 'standard',
      'tracking': 'standard',
      
      // Premium tier features
      'advanced_gps': 'premium',
      'geofencing': 'premium',
      'route_optimization': 'premium',
      'maintenance': 'premium',
      'analytics': 'premium',
      'premium_ai': 'premium',
      
      // Enterprise tier features
      'api_access': 'enterprise',
      'white_labeling': 'enterprise',
      'sso': 'enterprise',
      'custom_reporting': 'enterprise',
      'sla': 'enterprise',
      'custom_implementation': 'enterprise'
    };
    
    return featureTierMap[featureKey] || null;
  };

  return { getFeatureTier };
};
