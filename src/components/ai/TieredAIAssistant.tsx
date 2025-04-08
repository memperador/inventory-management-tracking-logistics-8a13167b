import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Bot, Send, Sparkles, Loader2, Lock } from 'lucide-react';
import { useTenant } from '@/hooks/useTenantContext';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { getAIAssistantResponse, getMockAIResponse } from '@/services/aiService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const TieredAIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isKeySet, setIsKeySet] = useState(false);
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const { hasSubscriptionTier, canAccessFeature } = useFeatureAccess();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const tier = currentTenant?.subscription_tier || 'basic';
  
  const assistantConfig = {
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
  
  const currentAssistant = assistantConfig[tier as keyof typeof assistantConfig] || assistantConfig.basic;

  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  React.useEffect(() => {
    const welcomeMessage = getWelcomeMessage();
    setMessages([
      {
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      }
    ]);
  }, [tier]);

  const getWelcomeMessage = () => {
    if (tier === 'basic') {
      return "Welcome! I'm your Inventory Expert assistant. I can help you organize your inventory and implement stock tracking best practices. How can I assist you today?";
    } else if (tier === 'standard') {
      return "Welcome! I'm your Inventory & Tracking Specialist. I can help with inventory management and GPS tracking for your equipment. What would you like assistance with today?";
    } else {
      return "Welcome to your premium Asset Management Intelligence assistant. I provide comprehensive guidance on inventory systems, GPS tracking, geofencing, predictive maintenance, and enterprise asset management. How can I help optimize your operations today?";
    }
  };

  const handleSetApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid Perplexity API key.",
        variant: "destructive",
      });
      return;
    }
    
    setIsKeySet(true);
    toast({
      title: "API Key Set",
      description: "You can now use the AI assistant with live responses.",
    });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
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
      
      if (isKeySet && apiKey) {
        response = await getAIAssistantResponse(input, { 
          apiKey, 
          tier: tier as 'basic' | 'standard' | 'premium'
        });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        response = getMockAIResponse(input, tier as 'basic' | 'standard' | 'premium');
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
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Capabilities</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {currentAssistant.capabilities.map((capability, index) => (
              <div key={index} className="text-xs bg-muted rounded-full px-2.5 py-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" />
                {capability}
              </div>
            ))}
          </div>
          
          {!isKeySet && (
            <div className="mb-4 space-y-3">
              <Alert variant="outline" className="bg-muted/50">
                <AlertDescription>
                  {tier === 'premium' ? 
                    "Set your Perplexity API key to activate live AI responses with our most advanced model." :
                    "Set your Perplexity API key to activate live AI responses. Premium tier users get access to our most powerful model."}
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Enter Perplexity API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSetApiKey} disabled={!apiKey.trim()}>
                  Connect
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <ScrollArea className="h-[250px] pr-4">
          <div className="space-y-4 pb-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.content}
                  <div className="text-xs opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-muted flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="border-t p-3 space-y-3">
        <div className="flex gap-2 w-full">
          <Input
            placeholder={`Ask about ${tier === 'basic' ? 'inventory management' : tier === 'standard' ? 'inventory and tracking' : 'asset management'}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        
        {tier !== 'premium' && (
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Lock className="h-3 w-3" />
            <span>
              Upgrade to Premium for our most advanced AI model with detailed asset management insights
            </span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default TieredAIAssistant;
