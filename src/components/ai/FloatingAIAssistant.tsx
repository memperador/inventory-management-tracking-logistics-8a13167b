
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { AIMessage as AIMessageType } from './components/AIMessage';
import ChatTab from './components/ChatTab';
import ErrorsTab from './components/ErrorsTab';
import FeaturesTab from './components/FeaturesTab';
import MinimizedAssistant from './components/MinimizedAssistant';
import AssistantHeader from './components/AssistantHeader';

interface FloatingAIAssistantProps {
  recentErrors?: string[];
  availableFeatures?: string[];
  tier?: 'basic' | 'standard' | 'premium' | 'enterprise';
}

const FloatingAIAssistant: React.FC<FloatingAIAssistantProps> = ({ 
  recentErrors = [], 
  availableFeatures = [],
  tier = 'basic'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<AIMessageType[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m your construction assistant. How can I help you today?', 
      timestamp: new Date(),
      type: 'standard'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { hasSubscriptionTier } = useFeatureAccess();
  
  const hasPremiumAccess = hasSubscriptionTier('standard');
  
  useEffect(() => {
    if (recentErrors.length > 0) {
      const latestError = recentErrors[recentErrors.length - 1];
      
      const hasProcessed = messages.some(
        msg => msg.type === 'error' && msg.content.includes(latestError)
      );
      
      if (!hasProcessed) {
        setMessages(prev => [
          ...prev,
          {
            role: 'system',
            content: `I noticed an error: "${latestError}". Would you like help troubleshooting this issue?`,
            timestamp: new Date(),
            type: 'error'
          }
        ]);
      }
    }
  }, [recentErrors, messages]);
  
  useEffect(() => {
    if (messages.length >= 5 && Math.random() > 0.7) {
      if (availableFeatures.length > 0) {
        const randomFeature = availableFeatures[Math.floor(Math.random() * availableFeatures.length)];
        
        setMessages(prev => [
          ...prev,
          {
            role: 'system',
            content: `Based on your usage, you might find "${randomFeature}" helpful. Would you like to learn more?`,
            timestamp: new Date(),
            type: 'recommendation'
          }
        ]);
      }
    }
  }, [messages.length, availableFeatures]);
  
  const handleInputChange = (value: string) => {
    setInput(value);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage: AIMessageType = {
      role: 'user',
      content: input,
      timestamp: new Date(),
      type: 'standard'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      setTimeout(() => {
        let responseContent = "I'm processing your request about " + input.substring(0, 30) + "...";
        
        if (input.toLowerCase().includes('report')) {
          responseContent = "To report an issue, please provide details about what you're experiencing. You can also use the 'Report Issue' option in the settings menu.";
        } else if (input.toLowerCase().includes('feature')) {
          responseContent = "Thanks for your feature request! I've logged it for our team to review. Would you like to provide more details?";
        } else if (input.toLowerCase().includes('help')) {
          responseContent = "I'm here to help! You can ask me about any feature in the platform, how to use specific tools, or best practices for your construction projects.";
        } else if (input.toLowerCase().includes('error') || input.toLowerCase().includes('issue')) {
          responseContent = "I can help troubleshoot that issue. Can you provide more details about what you were doing when the error occurred? Screenshots or error messages are also helpful.";
        } else if (input.toLowerCase().includes('track') || input.toLowerCase().includes('monitor')) {
          responseContent = "Our system offers several tracking options. Depending on your subscription tier, you can use GPS tracking, geofencing, and movement analysis. Would you like me to explain these features?";
        }
        
        const assistantMessage: AIMessageType = {
          role: 'assistant',
          content: responseContent,
          timestamp: new Date(),
          type: 'standard'
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  
  const toggleAssistant = () => {
    setIsOpen(!isOpen);
    if (isMinimized) setIsMinimized(false);
  };
  
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  
  const handleChangeTab = (tab: string) => {
    setActiveTab(tab);
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={toggleAssistant}
          className="rounded-full h-14 w-14 shadow-lg flex items-center justify-center"
        >
          <Bot className="h-6 w-6" />
        </Button>
      ) : (
        <div className="transition-all duration-200">
          {isMinimized ? (
            <MinimizedAssistant onMaximize={toggleMinimize} onClose={toggleAssistant} />
          ) : (
            <Card className="w-[350px] shadow-lg">
              <AssistantHeader 
                tier={tier}
                onMinimize={toggleMinimize}
                onClose={toggleAssistant}
              />
              
              <Tabs defaultValue="chat" value={activeTab} onValueChange={handleChangeTab}>
                <div className="px-4 border-b">
                  <TabsList className="w-full">
                    <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
                    <TabsTrigger value="errors" className="flex-1">Issues</TabsTrigger>
                    <TabsTrigger value="features" className="flex-1">Features</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="chat" className="m-0">
                  <ChatTab 
                    messages={messages}
                    input={input}
                    isLoading={isLoading}
                    hasPremiumAccess={hasPremiumAccess}
                    handleInputChange={handleInputChange}
                    handleSendMessage={handleSendMessage}
                  />
                </TabsContent>
                
                <TabsContent value="errors" className="m-0">
                  <ErrorsTab 
                    messages={messages}
                    onChangeTab={handleChangeTab}
                  />
                </TabsContent>
                
                <TabsContent value="features" className="m-0">
                  <FeaturesTab 
                    messages={messages}
                    availableFeatures={availableFeatures}
                    onChangeTab={handleChangeTab}
                  />
                </TabsContent>
              </Tabs>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default FloatingAIAssistant;
