
export interface AssistantConfig {
  name: string;
  description: string;
  capabilities: string[];
}

export type AssistantTier = 'basic' | 'standard' | 'premium';

export const assistantConfigs: Record<AssistantTier, AssistantConfig> = {
  basic: {
    name: 'Inventory Expert',
    description: 'An AI assistant specialized in inventory management',
    capabilities: ['Inventory organization', 'Stock level tracking', 'Item categorization', 'Basic inventory reporting']
  },
  standard: {
    name: 'Inventory & Tracking Specialist',
    description: 'An advanced AI assistant for inventory management with GPS tracking expertise',
    capabilities: ['Everything in Basic', 'GPS integration advice', 'Location tracking strategies', 'Equipment movement analysis', 'Route planning assistance']
  },
  premium: {
    name: 'Asset Management Intelligence',
    description: 'A premium AI assistant with comprehensive asset management capabilities',
    capabilities: ['Everything in Standard', 'Geofencing configuration', 'Advanced route optimization', 'Predictive maintenance', 'Asset lifecycle management', 'Implementation planning']
  }
};
