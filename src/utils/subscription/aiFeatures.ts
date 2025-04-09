
import { AIAssistantFeaturesMap, AIAssistantModelsMap, FeatureAccessLevel } from './types';

// AI assistant features by tier
export const AI_ASSISTANT_FEATURES: AIAssistantFeaturesMap = {
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
export const AI_ASSISTANT_MODELS: AIAssistantModelsMap = {
  'basic': 'llama-3.1-sonar-small-128k-online', // 8B parameter model
  'standard': 'llama-3.1-sonar-small-128k-online', // Same model with enhanced context
  'premium': 'llama-3.1-sonar-large-128k-online', // 70B parameter model
  'enterprise': 'llama-3.1-sonar-large-128k-online' // 70B parameter model with custom fine-tuning
};
