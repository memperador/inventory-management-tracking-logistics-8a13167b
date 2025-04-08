
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Bot, Send, Sparkles, Loader2 } from 'lucide-react';
import { useTenant } from '@/hooks/useTenantContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const TieredAIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { currentTenant } = useTenant();
  const { toast } = useToast();

  // Get current subscription tier or default to basic
  const tier = currentTenant?.subscription_tier || 'basic';
  
  // Assistant configuration based on tier
  const assistantConfig = {
    basic: {
      name: 'Inventory Expert',
      description: 'An AI assistant specialized in inventory management',
      systemPrompt: 'You are an AI assistant specialized in helping with inventory management. You can provide advice on organizing inventory, tracking stock levels, and implementing best practices for inventory control.',
      capabilities: ['Inventory organization', 'Stock level tracking', 'Item categorization', 'Basic inventory reporting']
    },
    standard: {
      name: 'Inventory & Tracking Specialist',
      description: 'An advanced AI assistant for inventory management with GPS tracking expertise',
      systemPrompt: 'You are an advanced AI assistant specialized in inventory management with GPS tracking capabilities. You can provide advice on organizing inventory, tracking equipment locations, optimizing routes, and implementing best practices for location-based inventory control.',
      capabilities: ['Everything in Basic', 'GPS integration advice', 'Location tracking strategies', 'Equipment movement analysis', 'Route planning assistance']
    },
    premium: {
      name: 'Asset Management Intelligence',
      description: 'A premium AI assistant with comprehensive asset management capabilities',
      systemPrompt: 'You are a premium AI assistant specialized in comprehensive asset management. You can provide advanced advice on inventory systems, GPS tracking implementation, geofencing strategies, predictive maintenance, and implementing enterprise-level asset management practices.',
      capabilities: ['Everything in Standard', 'Geofencing configuration', 'Advanced route optimization', 'Predictive maintenance', 'Asset lifecycle management', 'Implementation planning']
    }
  };
  
  const currentAssistant = assistantConfig[tier as keyof typeof assistantConfig] || assistantConfig.basic;

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call an API based on the user's subscription tier
      // For demonstration, we'll simulate different AI responses based on tier
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      let assistantResponse = '';
      
      // Simulate different AI capabilities based on tier
      if (tier === 'basic') {
        assistantResponse = `As your Inventory Expert, I can help with that inventory question. ${generateBasicResponse(userMessage.content)}`;
      } else if (tier === 'standard') {
        assistantResponse = `As your Inventory & Tracking Specialist, I can provide insights on both inventory and location tracking. ${generateStandardResponse(userMessage.content)}`;
      } else if (tier === 'premium') {
        assistantResponse = `As your Asset Management Intelligence assistant, I can offer comprehensive guidance on all aspects of asset management. ${generatePremiumResponse(userMessage.content)}`;
      }
      
      setMessages((prev) => [...prev, { role: 'assistant', content: assistantResponse }]);
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

  // Mock response generators
  const generateBasicResponse = (query: string) => {
    return `Here's how you can handle inventory management for that: [Basic inventory advice based on "${query}"]`;
  };
  
  const generateStandardResponse = (query: string) => {
    return `Here's how you can handle inventory management and tracking for that: [Standard tier advice with tracking insights based on "${query}"]`;
  };
  
  const generatePremiumResponse = (query: string) => {
    return `Here's my comprehensive asset management recommendation: [Premium tier advanced advice with geofencing and predictive analytics based on "${query}"]`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <CardTitle>{currentAssistant.name}</CardTitle>
        </div>
        <CardDescription>{currentAssistant.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Capabilities</h4>
          <ul className="space-y-1">
            {currentAssistant.capabilities.map((capability, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {capability}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="h-80 overflow-y-auto border rounded-md p-4 mb-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground p-8">
              <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Ask me anything about {tier === 'basic' ? 'inventory management' : tier === 'standard' ? 'inventory and GPS tracking' : 'asset management'}!</p>
            </div>
          ) : (
            messages.map((message, index) => (
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
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-muted flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
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
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {tier !== 'premium' ? (
          <p>Upgrade your subscription to access more advanced AI capabilities.</p>
        ) : (
          <p>You have access to our most advanced AI assistant features.</p>
        )}
      </CardFooter>
    </Card>
  );
};

export default TieredAIAssistant;
