
import { toast } from '@/hooks/use-toast';

// AI models by subscription tier
export const AI_TIER_MODELS = {
  basic: 'llama-3.1-sonar-small-128k-online', // 8B parameter model for basic tier
  standard: 'llama-3.1-sonar-small-128k-online', // Same model with more context for standard
  premium: 'llama-3.1-sonar-large-128k-online', // 70B parameter model for premium
};

// System prompts tailored to each tier
export const AI_TIER_PROMPTS = {
  basic: `You are an Inventory Expert AI assistant specialized in basic inventory management. 
  Provide advice on organizing inventory, tracking stock levels, and implementing best practices for inventory control.
  Keep responses focused on simple inventory tasks. Limit responses to 100 words.`,

  standard: `You are an Inventory & Tracking Specialist AI assistant with expertise in both inventory management and GPS tracking.
  Provide advice on organizing inventory, tracking equipment locations, optimizing routes, and implementing best practices for location-based inventory control.
  You can discuss GPS and location tracking in moderate detail. Aim for responses around 150 words.`,

  premium: `You are an Asset Management Intelligence AI assistant with comprehensive expertise in all aspects of construction asset management.
  Provide detailed advice on advanced inventory systems, GPS tracking implementation, geofencing strategies, predictive maintenance, and enterprise-level asset management practices.
  Offer thorough analysis with industry best practices and implementation strategies. You can provide detailed responses up to 250 words.`
};

// Token limits by tier (to control costs)
export const AI_TIER_TOKENS = {
  basic: 500,
  standard: 1000,
  premium: 2000
};

interface AIServiceProps {
  apiKey: string;
  tier: 'basic' | 'standard' | 'premium';
}

export const getAIAssistantResponse = async (
  message: string,
  { apiKey, tier = 'basic' }: AIServiceProps
): Promise<string> => {
  if (!apiKey) {
    return "API key is missing. Please check your settings.";
  }

  try {
    const model = AI_TIER_MODELS[tier];
    const systemPrompt = AI_TIER_PROMPTS[tier];
    const maxTokens = AI_TIER_TOKENS[tier];
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: tier === 'premium' ? 0.7 : 0.5, // Higher creativity for premium
        max_tokens: maxTokens,
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to get AI response');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error getting AI response:', error);
    return "Sorry, I encountered an error processing your request. Please try again later.";
  }
};

// Mock API for development/fallback
export const getMockAIResponse = (message: string, tier: 'basic' | 'standard' | 'premium'): string => {
  const lowerMessage = message.toLowerCase();
  
  // Basic tier responses
  if (tier === 'basic') {
    if (lowerMessage.includes('inventory') || lowerMessage.includes('stock')) {
      return "For basic inventory management, I recommend implementing a first-in, first-out system and weekly stock counts. Set minimum thresholds for reordering based on your typical usage rates.";
    }
    if (lowerMessage.includes('organize') || lowerMessage.includes('storage')) {
      return "Organize your inventory by frequency of use, with high-turnover items most accessible. Use clear labeling and consistent naming conventions. Consider color-coding for quick visual identification.";
    }
  }
  
  // Standard tier responses
  else if (tier === 'standard') {
    if (lowerMessage.includes('gps') || lowerMessage.includes('track')) {
      return "Your GPS tracking setup should prioritize battery life and durability. For construction equipment, I recommend using hardwired GPS units for large assets and battery-powered trackers with 2-3 week battery life for medium-sized equipment. Set up movement alerts for high-value items and create geofences around your job sites to monitor entries and exits.";
    }
    if (lowerMessage.includes('route') || lowerMessage.includes('movement')) {
      return "Based on typical construction equipment movement patterns, I recommend scheduling deliveries during off-peak traffic hours. Consider grouping deliveries to nearby locations to minimize fuel usage and driver time. Monitor idle time at job sites to identify workflow improvements.";
    }
  }
  
  // Premium tier responses
  else if (tier === 'premium') {
    if (lowerMessage.includes('geofence') || lowerMessage.includes('boundary')) {
      return "For optimal geofencing strategy, I recommend implementing three tiers of boundaries: 1) Job site boundaries to monitor overall presence, 2) Specific work zone boundaries within sites to track equipment utilization in different areas, and 3) Off-limits zones to prevent equipment from entering hazardous or restricted areas. Configure real-time alerts for boundary violations with escalation protocols for after-hours triggers. For multistory projects, consider implementing altitude-aware geofencing to distinguish between floors. This approach has reduced unauthorized equipment movement by 82% in similar implementation scenarios.";
    }
    if (lowerMessage.includes('maintenance') || lowerMessage.includes('predict')) {
      return "Our predictive maintenance algorithm has analyzed your equipment usage patterns and identified opportunities to optimize your maintenance schedule. Based on GPS data showing equipment operation hours and conditions, I recommend transitioning your excavators from time-based to usage-based maintenance cycles. Your units operating in sandy environments are experiencing 37% faster wear rates than those on clay soils. I've prepared a comprehensive maintenance forecast that accounts for these environmental factors, projected utilization rates from your upcoming projects, and historical breakdown patterns. Implementing this optimized schedule could reduce your emergency repairs by approximately 42% and extend equipment lifespan by 15-20%.";
    }
  }
  
  // Generic responses for any tier
  return "I understand your question about " + message.substring(0, 20) + "... To provide the most helpful response, could you share more specific details about your inventory needs or challenges?";
};
