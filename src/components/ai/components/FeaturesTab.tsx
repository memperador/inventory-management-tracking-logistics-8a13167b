
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Lightbulb, CheckCircle } from 'lucide-react';
import AIMessage, { AIMessage as AIMessageType } from './AIMessage';

interface FeaturesTabProps {
  messages: AIMessageType[];
  availableFeatures: string[];
  onChangeTab: (tab: string) => void;
}

const FeaturesTab: React.FC<FeaturesTabProps> = ({ 
  messages, 
  availableFeatures, 
  onChangeTab 
}) => {
  const recommendationMessages = messages.filter(msg => msg.type === 'recommendation');
  
  return (
    <>
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
            
            {recommendationMessages.length > 0 ? (
              <div className="space-y-2">
                {recommendationMessages.map((msg, idx) => (
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
          onClick={() => onChangeTab('chat')}
        >
          Ask about features
        </Button>
      </CardFooter>
    </>
  );
};

export default FeaturesTab;
