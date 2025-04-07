
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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

  const setInput = (value: string) => {
    setState(prev => ({ ...prev, input: value }));
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
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate response based on user query
      let response = "I'll help you with that. Could you provide more specific details about your request?";
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('foundation') || lowerMessage.includes('structural')) {
        response = "For foundation-related RFIs, make sure to reference the specific drawing sheet number, grid location, and elevation. Include photos if possible, and be clear about which structural element you're asking about.";
      } else if (lowerMessage.includes('electrical') || lowerMessage.includes('wiring')) {
        response = "For electrical RFIs, specify the panel designation, circuit number, and load calculations if applicable. Reference NEC code sections if you're asking about code compliance issues.";
      } else if (lowerMessage.includes('mechanical') || lowerMessage.includes('hvac')) {
        response = "For mechanical system queries, include equipment specifications, duct/pipe sizes, and any clearance issues. Note any conflicts with other building systems in your RFI.";
      } else if (lowerMessage.includes('finish') || lowerMessage.includes('material')) {
        response = "When requesting clarification on finishes, include the room numbers, wall/floor/ceiling designations, and exact material specifications from the project manual.";
      } else if (lowerMessage.includes('deadline') || lowerMessage.includes('urgent')) {
        response = "For urgent RFIs, highlight the critical path impact in your description and note any schedule delays that might occur without a timely response. Consider calling the design team in addition to submitting the RFI.";
      } else if (lowerMessage.includes('conflict') || lowerMessage.includes('clash')) {
        response = "When documenting conflicts between different systems, provide coordinates or dimensions from known reference points, include photos or screenshots from the BIM model, and suggest possible solutions if you have them.";
      }
      
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
  };
};
