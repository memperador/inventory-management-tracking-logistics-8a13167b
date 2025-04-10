
import React from 'react';
import { AssistantTier } from '../config/assistantConfig';

interface AIWelcomeMessageProps {
  tier: AssistantTier;
}

const AIWelcomeMessage: React.FC<AIWelcomeMessageProps> = ({ tier }) => {
  const getWelcomeMessage = () => {
    if (tier === 'basic') {
      return "Welcome! I'm your Inventory Expert assistant. I can help you organize your inventory and implement stock tracking best practices. How can I assist you today?";
    } else if (tier === 'standard') {
      return "Welcome! I'm your Inventory & Tracking Specialist. I can help with inventory management and GPS tracking for your equipment. What would you like assistance with today?";
    } else {
      return "Welcome to your premium Asset Management Intelligence assistant. I provide comprehensive guidance on inventory systems, GPS tracking, geofencing, predictive maintenance, and enterprise asset management. How can I help optimize your operations today?";
    }
  };

  return getWelcomeMessage();
};

export default AIWelcomeMessage;
