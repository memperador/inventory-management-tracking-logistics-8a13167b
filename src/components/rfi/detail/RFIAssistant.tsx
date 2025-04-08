
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, Sparkles } from 'lucide-react';
import { useRFIAssistant } from '../hooks/useRFIAssistant';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Badge } from '@/components/ui/badge';
import RFIMessageList from './components/RFIMessageList';
import RFIApiKeyInput from './components/RFIApiKeyInput';
import RFIChatInput from './components/RFIChatInput';

const RFIAssistant: React.FC = () => {
  const { messages, input, isLoading, setInput, sendMessage, isKeySet, setApiKey } = useRFIAssistant();
  const { hasSubscriptionTier } = useFeatureAccess();
  const [apiKeyInput, setApiKeyInput] = useState('');
  const isPremium = hasSubscriptionTier('premium');

  const handleSetApiKey = () => {
    if (apiKeyInput.trim()) {
      setApiKey(apiKeyInput);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
    }
  };

  return (
    <Card className="flex flex-col h-[600px] shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bot className="h-5 w-5 mr-2 text-primary" />
            <CardTitle>RFI Assistant</CardTitle>
            {isPremium && (
              <Badge variant="outline" className="ml-2 bg-primary/10">
                <Sparkles className="h-3 w-3 mr-1" /> Premium
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>AI-powered guidance for effective Request for Information forms</CardDescription>
      </CardHeader>
      
      {!isKeySet && (
        <RFIApiKeyInput 
          apiKeyInput={apiKeyInput} 
          isPremium={isPremium} 
          setApiKeyInput={setApiKeyInput} 
          handleSetApiKey={handleSetApiKey} 
        />
      )}
      
      <CardContent className="flex-1 p-0 px-4">
        <RFIMessageList messages={messages} isLoading={isLoading} />
      </CardContent>
      
      <CardFooter className="border-t p-3 mt-auto space-y-2">
        <RFIChatInput 
          input={input}
          setInput={setInput}
          isPremium={isPremium}
          isLoading={isLoading}
          handleSubmit={handleSubmit}
        />
      </CardFooter>
    </Card>
  );
};

export default RFIAssistant;
