
import { useState, useEffect } from 'react';
import { useTenant } from '@/hooks/useTenantContext';
import { useToast } from '@/hooks/use-toast';
import { getAIAssistantResponse, getMockAIResponse } from '@/services/aiService';
import { useSecuredAIService } from '@/hooks/ai/useSecuredAIService';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseTieredAIChatProps {
  tier: 'basic' | 'standard' | 'premium';
  initialInput?: string;
}

export const useTieredAIChat = ({ tier, initialInput = '' }: UseTieredAIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(initialInput);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { 
    apiKey, 
    isReady, 
    isEnabled, 
    setApiKey: setSecureApiKey, 
    fallbackToUserInput 
  } = useSecuredAIService();
  
  // Local state for temporary API key input by user (only used as fallback if allowed)
  const [localApiKey, setLocalApiKey] = useState('');

  const getWelcomeMessage = () => {
    if (tier === 'basic') {
      return "Welcome! I'm your Inventory Expert assistant. I can help you organize your inventory and implement stock tracking best practices. How can I assist you today?";
    } else if (tier === 'standard') {
      return "Welcome! I'm your Inventory & Tracking Specialist. I can help with inventory management and GPS tracking for your equipment. What would you like assistance with today?";
    } else {
      return "Welcome to your premium Asset Management Intelligence assistant. I provide comprehensive guidance on inventory systems, GPS tracking, geofencing, predictive maintenance, and enterprise asset management. How can I help optimize your operations today?";
    }
  };

  useEffect(() => {
    const welcomeMessage = getWelcomeMessage();
    setMessages([
      {
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      }
    ]);
  }, [tier]);

  // Set input from props when it changes
  useEffect(() => {
    if (initialInput) {
      setInput(initialInput);
    }
  }, [initialInput]);

  const handleSetApiKey = () => {
    if (!localApiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid Perplexity API key.",
        variant: "destructive",
      });
      return;
    }
    
    if (fallbackToUserInput) {
      setSecureApiKey(localApiKey);
      toast({
        title: "API Key Set",
        description: "You can now use the AI assistant with live responses.",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Check if AI is enabled for this tenant
    if (!isEnabled) {
      toast({
        title: "AI Features Disabled",
        description: "AI features are currently disabled for your organization. Please contact your administrator.",
        variant: "destructive",
      });
      return;
    }
    
    const userMessage: Message = { 
      role: 'user', 
      content: input,
      timestamp: new Date()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      let response: string;
      
      if (isReady && apiKey) {
        response = await getAIAssistantResponse(input, { 
          apiKey, 
          tier: tier
        });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        response = getMockAIResponse(input, tier);
        
        // Add note that this is a simulated response
        if (!apiKey) {
          response += " (Note: This is a simulated response. Contact your administrator to enable live AI responses.)";
        }
      }
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to get a response from the assistant',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    apiKey,
    localApiKey,
    setLocalApiKey,
    isReady,
    isEnabled,
    fallbackToUserInput,
    handleSetApiKey,
    handleSendMessage
  };
};
