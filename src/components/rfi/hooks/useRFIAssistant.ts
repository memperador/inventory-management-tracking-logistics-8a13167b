
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

type AssistantResponse = {
  id: string;
  text: string;
  timestamp: Date;
};

type AssistantState = {
  isLoading: boolean;
  messages: AssistantResponse[];
  input: string;
};

export const useRFIAssistant = () => {
  const [state, setState] = useState<AssistantState>({
    isLoading: false,
    messages: [{
      id: '1',
      text: 'Hello! I can help you complete your RFI. What information do you need assistance with?',
      timestamp: new Date()
    }],
    input: '',
  });
  const { toast } = useToast();
  const { hasSubscriptionTier } = useFeatureAccess();
  const [apiKey, setApiKey] = useState<string>('');
  const [isKeySet, setIsKeySet] = useState<boolean>(false);

  const setInput = (value: string) => {
    setState(prev => ({ ...prev, input: value }));
  };

  const setApiKeyHandler = (key: string) => {
    setApiKey(key);
    setIsKeySet(!!key);
    
    if (key) {
      toast({
        title: "API Key Set",
        description: "You can now use live AI responses for RFI assistance."
      });
    }
  };

  // Helper function to generate AI response based on user query
  const getSmartResponse = async (message: string): Promise<string> => {
    if (!isKeySet || !apiKey) {
      return getStaticResponse(message);
    }
    
    try {
      // Use Perplexity API for live responses
      const isPremium = hasSubscriptionTier('premium');
      const model = isPremium ? 'llama-3.1-sonar-large-128k-online' : 'llama-3.1-sonar-small-128k-online';
      
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
              content: `You are an AI assistant specialized in helping construction professionals complete Request for Information (RFI) forms. 
              Provide detailed, clear responses focused on best practices for RFI documentation. 
              ${isPremium ? 'As this is a premium tier account, provide comprehensive, detailed answers with industry-specific terminology and reference applicable standards where appropriate.' : 
              'Keep responses focused and direct, under 150 words.'}`
            },
            {
              role: 'user',
              content: message
            }
          ],
          temperature: 0.3,
          max_tokens: isPremium ? 1000 : 500,
          frequency_penalty: 1,
          presence_penalty: 0
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error getting AI response:', error);
      return getStaticResponse(message) + " (Error connecting to AI service, falling back to static response)";
    }
  };

  // Static responses for when API is not available
  const getStaticResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('foundation') || lowerMessage.includes('structural')) {
      return "For foundation-related RFIs, make sure to reference the specific drawing sheet number, grid location, and elevation. Include photos if possible, and be clear about which structural element you're asking about.";
    } else if (lowerMessage.includes('electrical') || lowerMessage.includes('wiring')) {
      return "For electrical RFIs, specify the panel designation, circuit number, and load calculations if applicable. Reference NEC code sections if you're asking about code compliance issues.";
    } else if (lowerMessage.includes('mechanical') || lowerMessage.includes('hvac')) {
      return "For mechanical system queries, include equipment specifications, duct/pipe sizes, and any clearance issues. Note any conflicts with other building systems in your RFI.";
    } else if (lowerMessage.includes('finish') || lowerMessage.includes('material')) {
      return "When requesting clarification on finishes, include the room numbers, wall/floor/ceiling designations, and exact material specifications from the project manual.";
    } else if (lowerMessage.includes('deadline') || lowerMessage.includes('urgent')) {
      return "For urgent RFIs, highlight the critical path impact in your description and note any schedule delays that might occur without a timely response. Consider calling the design team in addition to submitting the RFI.";
    } else if (lowerMessage.includes('conflict') || lowerMessage.includes('clash')) {
      return "When documenting conflicts between different systems, provide coordinates or dimensions from known reference points, include photos or screenshots from the BIM model, and suggest possible solutions if you have them.";
    }
    
    return "I'll help you with that. For best results in your RFI, be specific about the location, reference the relevant drawings or specifications, explain why the information is needed, and suggest a potential solution if you have one. This approach typically results in faster, more accurate responses.";
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    // Add user message
    const userMessageId = Date.now().toString();
    setState(prev => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          id: userMessageId,
          text: message,
          timestamp: new Date()
        }
      ],
      input: '',
      isLoading: true
    }));

    try {
      // Get response from AI or static response system
      const response = await getSmartResponse(message);
      
      // Add assistant response
      setState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: (Date.now() + 1).toString(),
            text: response,
            timestamp: new Date()
          }
        ],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error in RFI Assistant:', error);
      toast({
        title: "Assistant error",
        description: "There was a problem getting a response. Please try again.",
        variant: "destructive",
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return {
    ...state,
    setInput,
    sendMessage,
    isKeySet,
    setApiKey: setApiKeyHandler
  };
};
