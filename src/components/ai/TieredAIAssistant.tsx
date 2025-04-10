
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';
import { useTenant } from '@/hooks/useTenantContext';
import { useTieredAIChat } from './hooks/useTieredAIChat';
import { assistantConfigs, AssistantTier } from './config/assistantConfig';
import ApiKeyInput from './components/ApiKeyInput';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import AICapabilityList from './components/AICapabilityList';
import AIStatusAlert from './components/AIStatusAlert';
import AIWelcomeMessage from './components/AIWelcomeMessage';

interface TieredAIAssistantProps {
  initialInput?: string;
}

const TieredAIAssistant: React.FC<TieredAIAssistantProps> = ({ initialInput = '' }) => {
  const { currentTenant } = useTenant();
  
  // Determine tier from tenant or default to basic
  const tier = (currentTenant?.subscription_tier as AssistantTier) || 'basic';
  const currentAssistant = assistantConfigs[tier] || assistantConfigs.basic;
  
  const {
    messages,
    input,
    setInput,
    isLoading,
    localApiKey,
    setLocalApiKey,
    isReady,
    isEnabled,
    fallbackToUserInput,
    handleSetApiKey,
    handleSendMessage,
    initializeMessages
  } = useTieredAIChat({ tier, initialInput });

  // Initialize welcome message based on tier
  useEffect(() => {
    const welcomeMessage = <AIWelcomeMessage tier={tier} />;
    initializeMessages(welcomeMessage);
  }, [tier]);

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
        <AICapabilityList capabilities={currentAssistant.capabilities} />
        
        <AIStatusAlert isEnabled={isEnabled} />
        
        {isEnabled && !isReady && fallbackToUserInput && (
          <ApiKeyInput 
            apiKey={localApiKey}
            tier={tier}
            onApiKeyChange={setLocalApiKey}
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
          disabled={!isEnabled}
          onInputChange={setInput}
          onSendMessage={handleSendMessage}
        />
      </CardFooter>
    </Card>
  );
};

export default TieredAIAssistant;
