
import { FeatureAccessLevel, FeatureAccessMap } from './types';

// Features and their required subscription tiers
export const FEATURE_ACCESS_MAP: FeatureAccessMap = {
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
