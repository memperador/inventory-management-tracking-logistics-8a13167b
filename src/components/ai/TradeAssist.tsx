
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bot, Send, Cpu, X, InfoIcon, Construction, Wrench, Zap, Droplets } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TradeExpertise {
  id: string;
  name: string;
  icon: React.ReactNode;
  active: boolean;
}

const TradeAssist: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to TradeAssist AI. How can I help you with inventory management, asset tracking, or compliance today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
  
  const [expertise, setExpertise] = useState<TradeExpertise[]>([
    { id: 'construction', name: 'Construction', icon: <Construction size={16} />, active: true },
    { id: 'hvac', name: 'HVAC', icon: <Wrench size={16} />, active: false },
    { id: 'electrical', name: 'Electrical', icon: <Zap size={16} />, active: false },
    { id: 'plumbing', name: 'Plumbing', icon: <Droplets size={16} />, active: false },
  ]);

  // Predefined responses based on keywords
  const responses = {
    'track': 'Based on your inventory profile, I recommend implementing a tiered tracking system: GPS for high-value equipment like excavators and generators, active RFID for power tools that move between sites, and passive RFID or QR codes for smaller tools and consumables.',
    'rfid': 'For your current inventory, I recommend active RFID tags for your 25 most frequently moved pieces of equipment. This would cost approximately $1,250 for tags plus $3,500 for readers, but would save an estimated 120 labor hours per month in manual tracking.',
    'gps': 'Your fleet of 12 vehicles and 8 heavy equipment pieces would benefit from GPS tracking. This would enable geofencing for jobsites, automatic mileage logging for maintenance scheduling, and theft recovery capabilities. Estimated ROI is 8-10 months based on your current loss rates.',
    'inventory': 'I\'ve analyzed your inventory data and found potential optimization opportunities: 15% of electrical components are overstocked while 8% of plumbing fixtures are consistently understocked. I recommend adjusting your par levels based on 6-month usage patterns.',
    'compliance': 'I\'ve checked your equipment against current code requirements. 3 items need attention: The scaffold certification expires in 15 days, your fall protection equipment is due for inspection, and 2 fire extinguishers need to be recertified within 30 days.',
    'project': 'For your upcoming commercial renovation project, I\'ve prepared an equipment allocation plan. You\'ll need 2 scissor lifts, 4 impact drivers, 3 hammer drills, and your concrete saw. I\'ve checked availability and all items can be allocated from your central warehouse.',
    'help': 'I can help with inventory optimization, equipment tracking recommendations, compliance checks, project resource planning, and maintenance scheduling. Try asking about "tracking options", "inventory analysis", "compliance check", or "project preparation".'
  };
  
  const toggleExpertise = (id: string) => {
    setExpertise(expertise.map(e => 
      e.id === id ? { ...e, active: !e.active } : e
    ));
    
    // Show toast when expertise is changed
    const expertiseItem = expertise.find(e => e.id === id);
    if (expertiseItem) {
      toast({
        title: expertiseItem.active ? `${expertiseItem.name} expertise disabled` : `${expertiseItem.name} expertise enabled`,
        description: expertiseItem.active 
          ? `TradeAssist will no longer provide ${expertiseItem.name.toLowerCase()} specific recommendations.`
          : `TradeAssist will now include ${expertiseItem.name.toLowerCase()} specific recommendations.`,
      });
    }
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Simulate AI thinking
    setTimeout(() => {
      let response = "I'll help you with that. Could you provide more specific details about your inventory and equipment needs?";
      
      // Check for command patterns
      if (input.startsWith('/')) {
        if (input.startsWith('/analyze-inventory')) {
          response = responses.inventory;
        } else if (input.startsWith('/track-recommendation')) {
          response = responses.track;
        } else if (input.startsWith('/compliance-check')) {
          response = responses.compliance;
        } else if (input.startsWith('/project-prep')) {
          response = responses.project;
        } else if (input.startsWith('/help')) {
          response = responses.help;
        }
      } else {
        // Check for keywords in the input
        const lowerInput = input.toLowerCase();
        if (lowerInput.includes('rfid')) {
          response = responses.rfid;
        } else if (lowerInput.includes('gps') || lowerInput.includes('track')) {
          response = responses.gps;
        } else if (lowerInput.includes('inventory') || lowerInput.includes('stock')) {
          response = responses.inventory;
        } else if (lowerInput.includes('compliance') || lowerInput.includes('regulation') || lowerInput.includes('code')) {
          response = responses.compliance;
        } else if (lowerInput.includes('project') || lowerInput.includes('job') || lowerInput.includes('site')) {
          response = responses.project;
        } else if (lowerInput.includes('help') || lowerInput.includes('assist') || lowerInput.includes('what can you')) {
          response = responses.help;
        }
      }
      
      // Add AI response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="border-b pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <CardTitle>TradeAssist AI</CardTitle>
          </div>
          
          <div className="flex items-center gap-2">
            {expertise.map(item => (
              <TooltipProvider key={item.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={item.active ? "default" : "outline"} 
                      size="sm" 
                      className="h-8 px-2"
                      onClick={() => toggleExpertise(item.id)}
                    >
                      {item.icon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {item.name} expertise {item.active ? 'enabled' : 'disabled'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <InfoIcon size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-80 text-sm">
                    TradeAssist AI provides inventory management and asset tracking advice 
                    tailored to your trade specialties. Enable or disable expertise areas 
                    using the buttons above.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={cn(
                "flex w-max max-w-[80%] rounded-lg p-4",
                message.role === 'user' 
                  ? "ml-auto bg-primary text-primary-foreground" 
                  : "bg-muted"
              )}
            >
              {message.role === 'assistant' && (
                <Bot className="h-5 w-5 mr-2 mt-0.5 shrink-0" />
              )}
              <div>
                <p className="text-sm">{message.content}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex w-max max-w-[80%] rounded-lg p-4 bg-muted">
              <Bot className="h-5 w-5 mr-2 mt-0.5" />
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <CardFooter className="border-t p-3">
        <form 
          className="flex w-full items-center space-x-2" 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <Input
            placeholder="Ask about inventory, tracking, or compliance..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isTyping}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default TradeAssist;
