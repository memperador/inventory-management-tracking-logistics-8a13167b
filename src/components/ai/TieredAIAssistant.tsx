
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';
import { useTenant } from '@/hooks/useTenantContext';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useTieredAIChat } from './hooks/useTieredAIChat';
import { assistantConfigs, AssistantTier } from './config/assistantConfig';
import AICapabilities from './components/AICapabilities';
import ApiKeyInput from './components/ApiKeyInput';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';

interface TieredAIAssistantProps {
  initialInput?: string;
}

const TieredAIAssistant: React.FC<TieredAIAssistantProps> = ({ initialInput = '' }) => {
  const { currentTenant } = useTenant();
  const { hasSubscriptionTier } = useFeatureAccess();
  
  const tier = (currentTenant?.subscription_tier as AssistantTier) || 'basic';
  const currentAssistant = assistantConfigs[tier] || assistantConfigs.basic;
  
  const {
    messages,
    input,
    setInput,
    isLoading,
    apiKey,
    setApiKey,
    isKeySet,
    handleSetApiKey,
    handleSendMessage
  } = useTieredAIChat({ tier, initialInput });

  return (
    <Card className="w-full flex flex-col h-[600px]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <CardTitle>{currentAssistant.name}</CardTitle>
        </div>
        <CardDescription>{currentAssistant.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <AICapabilities capabilities={currentAssistant.capabilities} />
        
        {!isKeySet && (
          <ApiKeyInput 
            apiKey={apiKey}
            tier={tier}
            onApiKeyChange={setApiKey}
            onSetApiKey={handleSetApiKey}
          />
        )}
        
        <MessageList 
          messages={messages} 
          isLoading={isLoading} 
        />
      </CardContent>
      
      <CardFooter className="border-t p-3 space-y-3">
        <ChatInput 
          input={input}
          tier={tier}
          isLoading={isLoading}
          onInputChange={setInput}
          onSendMessage={handleSendMessage}
        />
      </CardFooter>
    </Card>
  );
};

export default TieredAIAssistant;
