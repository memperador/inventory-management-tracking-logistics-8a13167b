
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  X, 
  Minimize2, 
  Maximize2, 
  MessageSquarePlus, 
  AlertTriangle, 
  Lightbulb,
  Settings,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'error' | 'recommendation' | 'standard';
}

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
  const [messages, setMessages] = useState<AIMessage[]>([
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
  
  // Determine if user has access to premium AI features
  const hasPremiumAccess = hasSubscriptionTier('standard');
  
  // Process errors and generate recommendations
  useEffect(() => {
    if (recentErrors.length > 0) {
      // Only process the most recent error that hasn't been processed yet
      const latestError = recentErrors[recentErrors.length - 1];
      
      // Check if we've already processed this error
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
  }, [recentErrors]);
  
  // Generate feature recommendations based on usage patterns
  useEffect(() => {
    // Only show feature recommendations if we have at least 5 messages
    if (messages.length >= 5 && Math.random() > 0.7) {
      // Choose a random available feature to recommend
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
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to the conversation
    const userMessage: AIMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
      type: 'standard'
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
        } else if (input.toLowerCase().includes('error') || input.toLowerCase().includes('issue')) {
          responseContent = "I can help troubleshoot that issue. Can you provide more details about what you were doing when the error occurred? Screenshots or error messages are also helpful.";
        } else if (input.toLowerCase().includes('track') || input.toLowerCase().includes('monitor')) {
          responseContent = "Our system offers several tracking options. Depending on your subscription tier, you can use GPS tracking, geofencing, and movement analysis. Would you like me to explain these features?";
        }
        
        const assistantMessage: AIMessage = {
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
  
  // Render message based on type
  const renderMessage = (message: AIMessage) => {
    const baseClasses = "rounded-lg px-4 py-2 max-w-[80%]";
    let classes = "";
    
    if (message.role === 'user') {
      classes = `${baseClasses} bg-primary text-primary-foreground`;
    } else if (message.type === 'error') {
      classes = `${baseClasses} bg-red-50 border border-red-200 text-red-800`;
    } else if (message.type === 'recommendation') {
      classes = `${baseClasses} bg-blue-50 border border-blue-200 text-blue-800`;
    } else {
      classes = `${baseClasses} bg-background border`;
    }
    
    let icon = null;
    if (message.type === 'error') {
      icon = <AlertTriangle className="h-4 w-4 mr-1 text-red-600" />;
    } else if (message.type === 'recommendation') {
      icon = <Lightbulb className="h-4 w-4 mr-1 text-blue-600" />;
    } else if (message.role === 'assistant') {
      icon = <Bot className="h-4 w-4 mr-1" />;
    }
    
    return (
      <div className={classes}>
        {icon && (
          <div className="flex items-center mb-1">
            {icon}
            <span className="text-xs font-medium">
              {message.type === 'error' ? 'Error Assistant' : 
               message.type === 'recommendation' ? 'Feature Suggestion' : 
               'Assistant'}
            </span>
          </div>
        )}
        <p className="text-sm">{message.content}</p>
        <p className="text-xs opacity-70 mt-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    );
  };
  
  // Get badge based on tier
  const getBadgeByTier = () => {
    switch(tier) {
      case 'premium':
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
            <Sparkles className="h-3 w-3 mr-1 text-purple-600" /> Premium
          </Badge>
        );
      case 'standard':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            <Bot className="h-3 w-3 mr-1 text-blue-600" /> Standard
          </Badge>
        );
      case 'enterprise':
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
            <Settings className="h-3 w-3 mr-1 text-amber-600" /> Enterprise
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
            <Bot className="h-3 w-3 mr-1 text-gray-600" /> Basic
          </Badge>
        );
    }
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
                <div className="flex flex-col">
                  <CardTitle className="text-md flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    Construction Assistant
                  </CardTitle>
                  <div className="mt-1">
                    {getBadgeByTier()}
                  </div>
                </div>
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
              
              <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab}>
                <div className="px-4 border-b">
                  <TabsList className="w-full">
                    <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
                    <TabsTrigger value="errors" className="flex-1">Issues</TabsTrigger>
                    <TabsTrigger value="features" className="flex-1">Features</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="chat" className="m-0">
                  <ScrollArea className="max-h-[350px] bg-muted/40 p-3 space-y-4">
                    <div className="space-y-4">
                      {messages
                        .filter(msg => msg.type !== 'error' && msg.type !== 'recommendation')
                        .map((msg, idx) => (
                          <div 
                            key={idx} 
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            {renderMessage(msg)}
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
                    </div>
                  </ScrollArea>
                  
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
                </TabsContent>
                
                <TabsContent value="errors" className="m-0">
                  <ScrollArea className="max-h-[400px] bg-muted/40 p-3 space-y-4">
                    {messages
                      .filter(msg => msg.type === 'error')
                      .length > 0 ? (
                        <div className="space-y-4">
                          {messages
                            .filter(msg => msg.type === 'error')
                            .map((msg, idx) => (
                              <div key={idx} className="flex justify-start">
                                {renderMessage(msg)}
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6 text-center">
                          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
                          <p className="text-muted-foreground">No errors detected recently</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Any application errors will appear here
                          </p>
                        </div>
                      )}
                  </ScrollArea>
                  
                  <CardFooter className="p-3 pt-2 border-t">
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => setActiveTab('chat')}
                    >
                      Ask for help with an issue
                    </Button>
                  </CardFooter>
                </TabsContent>
                
                <TabsContent value="features" className="m-0">
                  <ScrollArea className="max-h-[400px] bg-muted/40 p-3 space-y-4">
                    <div className="p-2">
                      <h3 className="font-medium mb-2 flex items-center">
                        <Sparkles className="h-4 w-4 mr-1 text-primary" />
                        Available Features in Your Tier
                      </h3>
                      
                      {availableFeatures.length > 0 ? (
                        <ul className="space-y-2">
                          {availableFeatures.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm p-2 rounded-md bg-background">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <Alert>
                          <AlertDescription>
                            No features data available
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="mt-4">
                        <h3 className="font-medium mb-2 flex items-center">
                          <Lightbulb className="h-4 w-4 mr-1 text-amber-500" />
                          Feature Recommendations
                        </h3>
                        
                        {messages
                          .filter(msg => msg.type === 'recommendation')
                          .length > 0 ? (
                            <div className="space-y-2">
                              {messages
                                .filter(msg => msg.type === 'recommendation')
                                .map((msg, idx) => (
                                  <div key={idx} className="rounded-md border p-2 bg-blue-50 border-blue-200">
                                    <div className="flex gap-2">
                                      <Lightbulb className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                      <div>
                                        <p className="text-sm">{msg.content}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {msg.timestamp.toLocaleDateString()}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Feature recommendations will appear here as you use the application
                            </p>
                          )}
                      </div>
                    </div>
                  </ScrollArea>
                  
                  <CardFooter className="p-3 pt-2 border-t">
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => setActiveTab('chat')}
                    >
                      Ask about features
                    </Button>
                  </CardFooter>
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
