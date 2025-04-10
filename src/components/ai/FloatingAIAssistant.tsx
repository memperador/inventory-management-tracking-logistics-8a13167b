
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, X, Minimize2, Maximize2, MessageSquarePlus } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const FloatingAIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m your construction assistant. How can I help you today?', 
      timestamp: new Date() 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { hasSubscriptionTier } = useFeatureAccess();
  
  // Determine if user has access to premium AI features
  const hasPremiumAccess = hasSubscriptionTier('standard');
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to the conversation
    const userMessage: AIMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // In a real implementation, we would call the AI service here
      // For now, let's simulate a response
      setTimeout(() => {
        let responseContent = "I'm processing your request about " + input.substring(0, 30) + "...";
        
        if (input.toLowerCase().includes('report')) {
          responseContent = "To report an issue, please provide details about what you're experiencing. You can also use the 'Report Issue' option in the settings menu.";
        } else if (input.toLowerCase().includes('feature')) {
          responseContent = "Thanks for your feature request! I've logged it for our team to review. Would you like to provide more details?";
        } else if (input.toLowerCase().includes('help')) {
          responseContent = "I'm here to help! You can ask me about any feature in the platform, how to use specific tools, or best practices for your construction projects.";
        }
        
        const assistantMessage: AIMessage = {
          role: 'assistant',
          content: responseContent,
          timestamp: new Date()
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
            <div className="flex items-center gap-2 bg-background border rounded-full p-2 shadow-lg">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMinimize}
                className="h-8 w-8 rounded-full"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <span className="font-medium text-sm">Construction Assistant</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleAssistant}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Card className="w-[350px] shadow-lg">
              <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-md flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Construction Assistant
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMinimize}
                    className="h-8 w-8"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleAssistant}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto bg-muted/40 p-3 space-y-4">
                {messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        msg.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-background border'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-lg px-4 py-2 bg-background border">
                      <div className="flex items-center gap-2">
                        <div className="animate-pulse flex gap-1">
                          <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                          <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                          <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                        </div>
                        <p className="text-sm">Assistant is typing...</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-3 pt-2 border-t">
                <form onSubmit={handleSendMessage} className="w-full flex gap-2">
                  <Input
                    placeholder="Ask me anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading || !hasPremiumAccess}
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    disabled={isLoading || !input.trim() || !hasPremiumAccess}
                  >
                    <MessageSquarePlus className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default FloatingAIAssistant;
