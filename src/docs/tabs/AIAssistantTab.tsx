
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import AIAssistantDocumentation from '@/components/docs/AIAssistantDocumentation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { AI_ASSISTANT_FEATURES } from '@/utils/subscription/aiFeatures';
import { Badge } from '@/components/ui/badge';
import { Bot, Sparkles, AlertTriangle, Lightbulb } from 'lucide-react';

const AIAssistantTab: React.FC = () => {
  const { currentTier, hasSubscriptionTier } = useFeatureAccess();
  const tierKey = (currentTier as keyof typeof AI_ASSISTANT_FEATURES) || 'basic';
  const features = AI_ASSISTANT_FEATURES[tierKey] || [];
  
  const isPremium = hasSubscriptionTier('premium');
  const isEnterprise = hasSubscriptionTier('enterprise');
  
  return (
    <ScrollArea className="h-[750px] pr-4">
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              AI Assistant
            </h2>
            
            <Badge className={`
              ${isPremium ? 'bg-purple-100 text-purple-800 hover:bg-purple-100' : 
                isEnterprise ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : 
                'bg-blue-100 text-blue-800 hover:bg-blue-100'}
            `}>
              {currentTier ? currentTier.charAt(0).toUpperCase() + currentTier.slice(1) : 'Basic'} Tier
            </Badge>
          </div>
          
          <p className="text-muted-foreground mt-2">
            Your AI assistant provides intelligent guidance and support for equipment management and tracking.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Available AI Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
                  <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Error Tracking & Assistance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              The AI Assistant automatically monitors your application for errors and provides troubleshooting 
              assistance. When errors occur, they'll appear in the "Issues" tab of the assistant.
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">Error Detection</p>
                  <p className="text-xs text-red-700">
                    The assistant monitors console errors and application issues
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-md bg-amber-50 border border-amber-200">
                <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Smart Recommendations</p>
                  <p className="text-xs text-amber-700">
                    Get contextual suggestions to resolve common issues based on your usage patterns
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <AIAssistantDocumentation />
      </div>
    </ScrollArea>
  );
};

export default AIAssistantTab;
