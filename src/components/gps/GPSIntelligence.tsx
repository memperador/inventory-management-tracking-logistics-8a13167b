
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Send, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AIResponse {
  text: string;
  timestamp: Date;
}

const GPSIntelligence: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isKeySet, setIsKeySet] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responses, setResponses] = useState<AIResponse[]>([]);

  const handleSetApiKey = () => {
    if (apiKey.trim().length > 0) {
      setIsKeySet(true);
      toast({
        title: "API Key Set",
        description: "You can now use AI assistance for GPS data.",
      });
    } else {
      toast({
        title: "Invalid API Key",
        description: "Please enter a valid API key.",
        variant: "destructive",
      });
    }
  };

  const handleSendQuery = async () => {
    if (!query.trim()) return;
    
    try {
      setIsLoading(true);
      
      // In a real implementation, this would make an API call to an AI service
      // using your Perplexity API key or other LLM
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock AI responses based on query keywords
      let responseText = "";
      
      if (query.toLowerCase().includes("track") || query.toLowerCase().includes("location")) {
        responseText = "I can help you track equipment locations. Our system updates GPS coordinates every 15 minutes for active equipment. You can view real-time positions on the map visualization tab.";
      } else if (query.toLowerCase().includes("battery") || query.toLowerCase().includes("power")) {
        responseText = "Most GPS tracking devices have a battery life of 2-3 days when actively reporting. I recommend setting up low battery alerts in the system settings to prevent unexpected tracking loss.";
      } else if (query.toLowerCase().includes("maintenance") || query.toLowerCase().includes("service")) {
        responseText = "Based on GPS movement patterns, I can identify equipment that may need maintenance. Excavator #103 has shown irregular movement patterns over the last 3 days, suggesting a potential calibration issue.";
      } else if (query.toLowerCase().includes("optimize") || query.toLowerCase().includes("efficiency")) {
        responseText = "I've analyzed your equipment movement patterns and found that Bulldozer #87 has been idle for 35% of operating hours. Consider reassigning it to the downtown project site where utilization is higher.";
      } else {
        responseText = "I can analyze GPS data to help with equipment tracking, maintenance predictions, and efficiency optimization. Could you provide more specific details about what you'd like to know?";
      }
      
      setResponses([...responses, { text: responseText, timestamp: new Date() }]);
      setQuery('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from AI service.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const predefinedQueries = [
    "How can I optimize equipment routing based on GPS data?",
    "Identify idle equipment across all job sites",
    "Predict maintenance needs based on movement patterns",
    "Calculate fuel efficiency based on GPS routes",
  ];

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="mr-2 h-5 w-5 text-primary" />
          GPS Intelligence
        </CardTitle>
        <CardDescription>
          Use AI to analyze GPS data and optimize equipment usage
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isKeySet ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect to an AI service like Perplexity or your own LLM to analyze GPS data.
            </p>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter AI Service API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSetApiKey}>Connect</Button>
            </div>
            <div className="text-xs text-muted-foreground">
              For production use, store your API keys securely in Supabase environment variables.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 h-64 overflow-y-auto bg-muted/30">
              {responses.length > 0 ? (
                <div className="space-y-3">
                  {responses.map((response, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="flex items-start">
                        <Bot className="h-5 w-5 text-primary mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm">{response.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {response.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Bot className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Ask questions about your GPS data</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 items-center">
              <Input
                placeholder="Ask about GPS data analysis..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendQuery()}
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendQuery} 
                disabled={isLoading || !query.trim()}
                size="icon"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {predefinedQueries.map((preQuery, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setQuery(preQuery)}
                >
                  {preQuery}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GPSIntelligence;
